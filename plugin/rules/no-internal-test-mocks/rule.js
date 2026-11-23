import { createRule, isInternalModule } from '../../utils/utils.js';
import {
  NETWORK_GLOBALS,
  MOCK_MUTATORS,
  getImportOrigin,
  getStaticText,
  getObjectProperties,
  getPropertyName,
  hasMockValue,
  isVitestMethod,
  isRealDependency,
  isNetworkPackage,
  isAlternativeMockPackage,
  isNetworkGlobal,
  isGlobalObject,
  isProtectedModule,
} from './analysis.js';

export const rule = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Keep application code real and mock HTTP only at the permitted test boundary.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          boundary: { enum: ['client', 'server'] },
          networkPackages: { type: 'array', items: { type: 'string' } },
          realDependencies: { type: 'array', items: { type: 'string' } },
          integrationTestPattern: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      networkMock:
        'Do not replace {{target}} in {{boundary}} tests with {{method}}. {{guidance}}',
      externalModule:
        "Keep '{{target}}' real in {{boundary}} integration/API tests; do not replace it with {{method}}. Reserve non-HTTP provider mocks for isolated unit tests.",
      realDependency:
        "Keep '{{target}}' real in {{boundary}} tests; do not replace it with {{method}}.",
      injectedMock:
        "Do not inject mock dependencies into internal module '{{target}}'. Keep application dependencies real in {{boundary}} tests.",
      internalModule:
        "Do not use {{method}} on internal module '{{target}}'. Keep it real in {{boundary}} tests; mock only permitted external boundaries.",
    },
  },

  create(context) {
    const options = context.options[0] ?? {};
    const boundary = options.boundary ?? 'application';
    const networkPackages = options.networkPackages ?? [];
    const realDependencies = options.realDependencies ?? [];

    const integrationTestPattern = new RegExp(
      options.integrationTestPattern ??
        String.raw`\.test\.(?:integration|(?:rest|graphql)\.api)\.`
    );

    const serverIntegration =
      boundary === 'server' && integrationTestPattern.test(context.filename);

    let vitestFile = false;

    function reportNetwork({ node, method, target }) {
      context.report({
        node,
        messageId: 'networkMock',
        data: {
          method,
          target,
          boundary,
          guidance:
            boundary === 'client'
              ? 'Use server API or end-to-end tests for network behavior.'
              : 'Use MSW at the network boundary.',
        },
      });
    }

    function reportModule({ node, method, target }) {
      if (isInternalModule(target)) {
        context.report({
          node,
          messageId: 'internalModule',
          data: { method, target, boundary },
        });
      } else if (
        isRealDependency({
          source: target,
          boundary,
          extraPackages: realDependencies,
        })
      ) {
        context.report({
          node,
          messageId: 'realDependency',
          data: { method, target, boundary },
        });
      } else if (isNetworkPackage(target, networkPackages)) {
        reportNetwork({ node, method, target });
      } else if (serverIntegration && target !== 'vitest') {
        context.report({
          node,
          messageId: 'externalModule',
          data: { method, target, boundary },
        });
      }
    }

    function reportReplacement({ node, method, target, value, scope }) {
      if (
        !vitestFile ||
        !target ||
        !isProtectedModule({
          source: target.source,
          boundary,
          networkPackages,
          realDependencies,
        }) ||
        !hasMockValue({ node: value, scope })
      ) {
        return false;
      }

      reportModule({ node, method, target: target.source });
      return true;
    }

    function checkMockLibrary({ node, source }) {
      if (
        source &&
        (isAlternativeMockPackage(source) ||
          (boundary === 'client' &&
            (source === 'msw' ||
              source.startsWith('msw/') ||
              source.startsWith('@apollo/client/testing'))))
      ) {
        reportNetwork({ node, method: 'network mocking', target: source });
      }
    }

    function checkVitestCall({ node, scope, origin }) {
      if (isVitestMethod(origin)) {
        const method = origin.members[1];
        const argument = node.arguments[0];

        if (['mock', 'doMock', 'importMock'].includes(method)) {
          const target = getStaticText({
            node:
              argument?.type === 'ImportExpression'
                ? argument.source
                : argument,
            scope,
          });

          if (target) {
            reportModule({ node, method: `vi.${method}`, target });
          }
        } else if (['spyOn', 'mockObject'].includes(method)) {
          const target = getImportOrigin({ node: argument, scope });

          if (
            isNetworkGlobal(
              target,
              method === 'spyOn'
                ? getStaticText({ node: node.arguments[1], scope })
                : undefined
            )
          ) {
            reportNetwork({
              node,
              method: `vi.${method}`,
              target: 'global network APIs',
            });
          } else if (
            target &&
            !['global', 'vitest-mock'].includes(target.source)
          ) {
            reportModule({
              node,
              method: `vi.${method}`,
              target: target.source,
            });
          }
        } else if (method === 'stubGlobal') {
          const target = getStaticText({ node: argument, scope });

          if (NETWORK_GLOBALS.has(target)) {
            reportNetwork({ node, method: 'vi.stubGlobal', target });
          }
        }

        return true;
      }

      return false;
    }

    function checkMockMutation({ node, origin }) {
      if (origin && MOCK_MUTATORS.has(origin.members.at(-1))) {
        if (isNetworkGlobal(origin)) {
          reportNetwork({
            node,
            method: origin.members.at(-1),
            target: 'global network APIs',
          });
        } else if (!['global', 'vitest-mock'].includes(origin.source)) {
          reportModule({
            node,
            method: origin.members.at(-1),
            target: origin.source,
          });
        }

        return true;
      }

      return false;
    }

    function checkObjectMutation({ node, scope, origin }) {
      if (origin?.source === 'global' && origin.members[0] === 'Object') {
        const method = origin.members[1];
        const target = getImportOrigin({ node: node.arguments[0], scope });

        if (method === 'defineProperty') {
          const property = getStaticText({ node: node.arguments[1], scope });

          if (vitestFile && isNetworkGlobal(target, property)) {
            reportNetwork({
              node,
              method: 'Object.defineProperty',
              target: property,
            });
          } else {
            reportReplacement({
              node,
              method: 'Object.defineProperty',
              target,
              value: node.arguments[2],
              scope,
            });
          }
        } else if (method === 'assign' || method === 'defineProperties') {
          for (const argument of node.arguments.slice(1)) {
            const properties = getObjectProperties({ node: argument, scope });

            if (
              vitestFile &&
              isGlobalObject(target) &&
              properties.some(property =>
                NETWORK_GLOBALS.has(getPropertyName(property, scope))
              )
            ) {
              reportNetwork({
                node,
                method: `Object.${method}`,
                target: 'global network APIs',
              });

              break;
            }

            if (
              reportReplacement({
                node,
                method: `Object.${method}`,
                target,
                value: argument,
                scope,
              })
            ) {
              break;
            }
          }
        }
      }
    }

    function checkInjectedFactory({ node, scope, origin }) {
      // Service/DAO factories are dependency boundaries, unlike UI callbacks
      // passed to render helpers or callback-taking pure utilities.
      if (
        vitestFile &&
        origin &&
        isInternalModule(origin.source) &&
        /\.(?:service|dao)(?:\.[cm]?[jt]s)?$/.test(origin.source) &&
        origin.members.at(-1)?.startsWith('create') &&
        node.arguments.some(argument => hasMockValue({ node: argument, scope }))
      ) {
        context.report({
          node,
          messageId: 'injectedMock',
          data: { target: origin.source, boundary },
        });
      }
    }

    return {
      Program(node) {
        vitestFile = node.body.some(
          statement =>
            statement.type === 'ImportDeclaration' &&
            statement.source.value === 'vitest' &&
            statement.importKind !== 'type' &&
            statement.specifiers.some(
              specifier => specifier.importKind !== 'type'
            )
        );
      },

      ImportDeclaration(node) {
        if (
          node.importKind === 'type' ||
          (node.specifiers.length > 0 &&
            node.specifiers.every(specifier => specifier.importKind === 'type'))
        ) {
          return;
        }

        checkMockLibrary({ node, source: node.source.value });
      },

      ExportNamedDeclaration(node) {
        if (
          node.exportKind !== 'type' &&
          node.source &&
          (node.specifiers.length === 0 ||
            node.specifiers.some(specifier => specifier.exportKind !== 'type'))
        ) {
          checkMockLibrary({ node, source: node.source.value });
        }
      },

      ExportAllDeclaration(node) {
        if (node.exportKind !== 'type') {
          checkMockLibrary({ node, source: node.source.value });
        }
      },

      ImportExpression(node) {
        const scope = context.sourceCode.getScope(node);

        checkMockLibrary({
          node,
          source: getStaticText({ node: node.source, scope }),
        });
      },

      CallExpression(node) {
        const scope = context.sourceCode.getScope(node);
        const origin = getImportOrigin({ node: node.callee, scope });

        if (
          checkVitestCall({ node, scope, origin }) ||
          checkMockMutation({ node, origin })
        ) {
          return;
        }

        checkObjectMutation({ node, scope, origin });
        checkInjectedFactory({ node, scope, origin });
      },

      AssignmentExpression(node) {
        const scope = context.sourceCode.getScope(node);
        const target = getImportOrigin({ node: node.left, scope });

        if (vitestFile && isNetworkGlobal(target)) {
          reportNetwork({
            node,
            method: 'assignment',
            target: 'global network APIs',
          });
        } else {
          reportReplacement({
            node,
            method: 'assignment',
            target,
            value: node.right,
            scope,
          });
        }
      },
    };
  },
});
