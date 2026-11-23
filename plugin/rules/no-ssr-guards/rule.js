import { createRule, findVariable } from '../../utils/utils.js';

const browserGlobals = new Set([
  'window',
  'document',
  'navigator',
  'localStorage',
  'sessionStorage',
]);

const equalityOperators = new Set(['==', '===', '!=', '!==']);

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow server-side rendering guards for browser globals in client code.',
    },
    schema: [],
    messages: {
      typeofGuard:
        "Remove the 'typeof {{name}}' guard. The client only runs in the browser, so '{{name}}' is always defined.",
      inGuard:
        "Remove the '\"{{name}}\" in globalThis' guard. The client only runs in the browser, so '{{name}}' is always defined.",
    },
  },

  create(context) {
    return {
      BinaryExpression(node) {
        if (equalityOperators.has(node.operator)) {
          const guardedName =
            getTypeofBrowserGlobal({ context, node: node.left }) ??
            getTypeofBrowserGlobal({ context, node: node.right });

          if (
            guardedName &&
            (isUndefinedString(node.left) || isUndefinedString(node.right))
          ) {
            context.report({
              node,
              messageId: 'typeofGuard',
              data: { name: guardedName },
            });
          }

          return;
        }

        if (
          node.operator === 'in' &&
          node.left.type === 'Literal' &&
          browserGlobals.has(node.left.value) &&
          node.right.type === 'Identifier' &&
          node.right.name === 'globalThis' &&
          isGlobalReference({ context, node: node.right })
        ) {
          context.report({
            node,
            messageId: 'inGuard',
            data: { name: node.left.value },
          });
        }
      },
    };
  },
});

function getTypeofBrowserGlobal({ context, node }) {
  if (
    node.type === 'UnaryExpression' &&
    node.operator === 'typeof' &&
    node.argument.type === 'Identifier' &&
    browserGlobals.has(node.argument.name) &&
    isGlobalReference({ context, node: node.argument })
  ) {
    return node.argument.name;
  }
}

function isUndefinedString(node) {
  if (node.type === 'Literal') {
    return node.value === 'undefined';
  }

  return (
    node.type === 'TemplateLiteral' &&
    node.expressions.length === 0 &&
    node.quasis[0]?.value.cooked === 'undefined'
  );
}

function isGlobalReference({ context, node }) {
  const variable = findVariable({
    name: node.name,
    scope: context.sourceCode.getScope(node),
  });

  return !variable || variable.defs.length === 0;
}
