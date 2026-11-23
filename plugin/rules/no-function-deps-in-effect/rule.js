import { createRule, findVariable, isNamedImport } from '../../utils/utils.js';

const formFunctionMembers = new Set([
  'watch',
  'getValues',
  'getErrors',
  'getFieldState',
  'setError',
  'clearErrors',
  'setValue',
  'setValues',
  'trigger',
  'resetField',
  'reset',
  'resetDefaultValues',
  'handleSubmit',
  'unregister',
  'register',
  'setFocus',
  'subscribe',
]);

// JS plugins have no type information. Only these imported APIs have known
// callable outputs; unknown hooks and non-callable members remain unchecked.
// Keep this map aligned with the pinned libraries' return types when upgrading.
const importedHookFunctionMembers = new Map([
  ['react-hook-form:useForm', formFunctionMembers],
  ['react-hook-form:useFormContext', formFunctionMembers],
  ['@apollo/client/react:useMutation', new Set(['0'])],
  [
    '@ai-sdk/react:useChat',
    new Set([
      'setMessages',
      'sendMessage',
      'regenerate',
      'stop',
      'resumeStream',
      'addToolResult',
      'addToolOutput',
      'addToolApprovalResponse',
      'clearError',
    ]),
  ],
]);

export const rule = createRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'Avoid function references in useEffect dependency arrays.',
    },
    // Removing a dependency or rewriting a function can change closure behavior
    // and other callers. Report the violation without an automatic fix.
    messages: {
      functionDependency:
        "Function '{{name}}' in effect deps. Remove it and wrap logic with useEffectEvent or move the logic. Changes in function references should not re-trigger effects as they never capture the intent of the effect. Only data-like values such as primitives should drive effects.",
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        const scope = context.sourceCode.getScope(node);

        if (
          !scope ||
          !isReactHookCall({ node, hookName: 'useEffect', scope })
        ) {
          return;
        }

        const dependencies = node.arguments?.[1];

        if (dependencies?.type !== 'ArrayExpression') {
          return;
        }

        for (const dependency of dependencies.elements ?? []) {
          if (!dependency) {
            continue;
          }

          if (isFunctionLikeDependency({ context, node: dependency })) {
            context.report({
              node: dependency,
              messageId: 'functionDependency',
              data: {
                name:
                  dependency.type === 'Identifier'
                    ? dependency.name
                    : 'function',
              },
            });
          }
        }
      },
    };
  },
});

function isReactHookCall({ node, hookName, scope }) {
  if (node?.type !== 'CallExpression') {
    return false;
  }

  const callee = node.callee;

  if (callee.type === 'Identifier') {
    const variable = findVariable({ name: callee.name, scope });

    if (!variable) {
      return callee.name === hookName;
    }

    return isNamedImport({ variable, source: 'react', importedName: hookName });
  }

  if (
    callee.type !== 'MemberExpression' ||
    callee.computed ||
    callee.object.type !== 'Identifier' ||
    callee.property.type !== 'Identifier' ||
    callee.property.name !== hookName
  ) {
    return false;
  }

  const variable = findVariable({ name: callee.object.name, scope });

  if (!variable) {
    return callee.object.name === 'React';
  }

  return variable.defs.some(definition => {
    const importNode = definition.node;

    return (
      definition.type === 'ImportBinding' &&
      (importNode.type === 'ImportDefaultSpecifier' ||
        importNode.type === 'ImportNamespaceSpecifier') &&
      importNode.parent?.type === 'ImportDeclaration' &&
      importNode.parent.source.value === 'react'
    );
  });
}

function isFunctionType(node) {
  if (node?.type === 'TSTypeAnnotation') {
    return isFunctionType(node.typeAnnotation);
  }

  if (node?.type === 'TSParenthesizedType') {
    return isFunctionType(node.typeAnnotation);
  }

  return node?.type === 'TSFunctionType';
}

function isFunctionLikeDependency({ node, context }) {
  if (!node) {
    return false;
  }

  if (
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'FunctionExpression'
  ) {
    return true;
  }

  if (node.type === 'CallExpression') {
    const scope = context.sourceCode.getScope(node);

    return scope
      ? isReactHookCall({ node, hookName: 'useEffectEvent', scope })
      : false;
  }

  if (node.type === 'Identifier') {
    return isFunctionLikeIdentifier({ context, node });
  }

  if (node.type === 'MemberExpression') {
    const scope = context.sourceCode.getScope(node);

    return scope
      ? isFunctionMember({ node, scope, seenVariables: new Set() })
      : false;
  }

  return false;
}

function isFunctionLikeIdentifier({ node, context }) {
  const scope = context.sourceCode.getScope(node);

  if (!scope) {
    return false;
  }

  return isFunctionBinding({
    name: node.name,
    scope,
    seenVariables: new Set(),
  });
}

function isFunctionBinding({ name, scope, seenVariables }) {
  const variable = findVariable({ name, scope });

  if (
    !variable ||
    seenVariables.has(variable) ||
    variable.references.some(
      reference => reference.isWrite() && !reference.init
    )
  ) {
    return false;
  }

  seenVariables.add(variable);

  return variable.defs.some(definition => {
    const definitionNode = definition.node;

    if (
      definition.type === 'FunctionName' &&
      definitionNode.type === 'FunctionDeclaration'
    ) {
      return true;
    }

    if (isFunctionType(definition.name.typeAnnotation)) {
      return true;
    }

    if (definition.type === 'Parameter') {
      return isTypedDestructuredFunction({ definition, name });
    }

    if (
      definition.type !== 'Variable' ||
      definitionNode.type !== 'VariableDeclarator'
    ) {
      return false;
    }

    const init = definitionNode.init;

    if (
      init &&
      (init.type === 'ArrowFunctionExpression' ||
        init.type === 'FunctionExpression')
    ) {
      return true;
    }

    if (
      isReactHookCall({
        node: init,
        hookName: 'useCallback',
        scope: variable.scope,
      }) ||
      isReactHookCall({
        node: init,
        hookName: 'useEffectEvent',
        scope: variable.scope,
      })
    ) {
      return true;
    }

    if (definitionNode.id.type === 'ObjectPattern') {
      return isDestructuredFunction({
        pattern: definitionNode.id,
        init,
        name,
        scope: variable.scope,
        seenVariables,
      });
    }

    if (definitionNode.id.type === 'ArrayPattern') {
      const index = definitionNode.id.elements.findIndex(
        element => element?.type === 'Identifier' && element.name === name
      );

      if (
        index >= 0 &&
        isImportedHookResultFunction({
          node: init,
          propertyName: String(index),
          scope: variable.scope,
          seenVariables,
        })
      ) {
        return true;
      }

      return (
        index === 1 &&
        (isReactHookCall({
          node: init,
          hookName: 'useState',
          scope: variable.scope,
        }) ||
          isReactHookCall({
            node: init,
            hookName: 'useReducer',
            scope: variable.scope,
          }))
      );
    }

    if (init?.type === 'Identifier') {
      return isFunctionBinding({
        name: init.name,
        scope: variable.scope,
        seenVariables,
      });
    }

    if (init?.type === 'MemberExpression') {
      return isFunctionMember({
        node: init,
        scope: variable.scope,
        seenVariables,
      });
    }

    return false;
  });
}

function isTypedDestructuredFunction({ definition, name }) {
  const bindingProperty = definition.name.parent;

  if (bindingProperty?.type !== 'Property') {
    return false;
  }

  const pattern = bindingProperty.parent;

  const annotation =
    pattern?.type === 'ObjectPattern'
      ? pattern.typeAnnotation?.typeAnnotation
      : undefined;

  if (annotation?.type !== 'TSTypeLiteral') {
    return false;
  }

  const propertyName =
    bindingProperty.key.type === 'Identifier'
      ? bindingProperty.key.name
      : undefined;

  if (!propertyName || bindingProperty.value.name !== name) {
    return false;
  }

  return annotation.members.some(
    member =>
      member.type === 'TSPropertySignature' &&
      member.key.type === 'Identifier' &&
      member.key.name === propertyName &&
      isFunctionType(member.typeAnnotation)
  );
}

function isDestructuredFunction({ pattern, init, name, scope, seenVariables }) {
  const bindingProperty = pattern.properties.find(
    property => property.type === 'Property' && property.value.name === name
  );

  if (
    bindingProperty?.type !== 'Property' ||
    bindingProperty.computed ||
    bindingProperty.key.type !== 'Identifier'
  ) {
    return false;
  }

  const propertyName = bindingProperty.key.name;

  if (
    pattern.typeAnnotation?.typeAnnotation.type === 'TSTypeLiteral' &&
    pattern.typeAnnotation.typeAnnotation.members.some(
      member =>
        member.type === 'TSPropertySignature' &&
        member.key.type === 'Identifier' &&
        member.key.name === propertyName &&
        isFunctionType(member.typeAnnotation)
    )
  ) {
    return true;
  }

  if (
    init?.type === 'CallExpression' &&
    isImportedHookResultFunction({
      node: init,
      propertyName,
      scope,
      seenVariables,
    })
  ) {
    return true;
  }

  if (init?.type === 'ObjectExpression') {
    return isFunctionProperty({
      object: init,
      propertyName,
      scope,
      seenVariables,
    });
  }

  if (init?.type === 'Identifier') {
    return isFunctionMemberByName({
      objectName: init.name,
      propertyName,
      scope,
      seenVariables,
    });
  }

  return false;
}

function isFunctionMember({ node, scope, seenVariables }) {
  if (
    node.computed ||
    node.object.type !== 'Identifier' ||
    node.property.type !== 'Identifier'
  ) {
    return false;
  }

  return isFunctionMemberByName({
    objectName: node.object.name,
    propertyName: node.property.name,
    scope,
    seenVariables,
  });
}

function isFunctionMemberByName({
  objectName,
  propertyName,
  scope,
  seenVariables,
}) {
  const variable = findVariable({ name: objectName, scope });

  if (
    !variable ||
    seenVariables.has(variable) ||
    variable.references.some(
      reference => reference.isWrite() && !reference.init
    )
  ) {
    return false;
  }

  seenVariables.add(variable);

  return variable.defs.some(definition => {
    const definitionNode = definition.node;

    if (
      definition.type === 'Variable' &&
      definitionNode.type === 'VariableDeclarator' &&
      definitionNode.id.type === 'Identifier' &&
      isImportedHookResultFunction({
        node: definitionNode.init,
        propertyName,
        scope: variable.scope,
        seenVariables,
      })
    ) {
      return true;
    }

    return (
      definition.type === 'Variable' &&
      definitionNode.type === 'VariableDeclarator' &&
      definitionNode.init?.type === 'ObjectExpression' &&
      isFunctionProperty({
        object: definitionNode.init,
        propertyName,
        scope: variable.scope,
        seenVariables,
      })
    );
  });
}

function isFunctionProperty({ object, propertyName, scope, seenVariables }) {
  return object.properties.some(property => {
    if (
      property.type !== 'Property' ||
      property.computed ||
      property.key.type !== 'Identifier' ||
      property.key.name !== propertyName
    ) {
      return false;
    }

    const value = property.value;

    if (
      value.type === 'ArrowFunctionExpression' ||
      value.type === 'FunctionExpression'
    ) {
      return true;
    }

    return (
      value.type === 'Identifier' &&
      isFunctionBinding({ name: value.name, scope, seenVariables })
    );
  });
}

function isImportedHookResultFunction({
  node,
  propertyName,
  scope,
  seenVariables,
}) {
  if (node?.type === 'Identifier') {
    const variable = findVariable({ name: node.name, scope });

    if (
      !variable ||
      seenVariables.has(variable) ||
      variable.references.some(
        reference => reference.isWrite() && !reference.init
      )
    ) {
      return false;
    }

    seenVariables.add(variable);

    return variable.defs.some(
      definition =>
        definition.type === 'Variable' &&
        definition.node.type === 'VariableDeclarator' &&
        definition.node.id.type === 'Identifier' &&
        isImportedHookResultFunction({
          node: definition.node.init,
          propertyName,
          scope: variable.scope,
          seenVariables,
        })
    );
  }

  if (node?.type !== 'CallExpression') {
    return false;
  }

  const callee = node.callee;
  let importName;
  let namespaceHookName;

  if (callee.type === 'Identifier') {
    importName = callee.name;
  } else if (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.object.type === 'Identifier' &&
    callee.property.type === 'Identifier'
  ) {
    importName = callee.object.name;
    namespaceHookName = callee.property.name;
  } else {
    return false;
  }

  const variable = findVariable({ name: importName, scope });

  return (
    variable?.defs.some(definition => {
      const specifier = definition.node;
      const declaration = specifier.parent;

      if (
        definition.type !== 'ImportBinding' ||
        declaration?.type !== 'ImportDeclaration' ||
        declaration.importKind === 'type'
      ) {
        return false;
      }

      let hookName;

      if (
        namespaceHookName !== undefined &&
        specifier.type === 'ImportNamespaceSpecifier'
      ) {
        hookName = namespaceHookName;
      } else if (
        namespaceHookName === undefined &&
        specifier.type === 'ImportSpecifier' &&
        specifier.importKind !== 'type' &&
        specifier.imported.type === 'Identifier'
      ) {
        hookName = specifier.imported.name;
      } else {
        return false;
      }

      return (
        importedHookFunctionMembers
          .get(`${declaration.source.value}:${hookName}`)
          ?.has(propertyName) === true
      );
    }) ?? false
  );
}
