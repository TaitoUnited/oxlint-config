import { createRule, findVariable, isNamedImport } from '../../utils/utils.js';

const functionTypes = new Set([
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
]);

export const rule = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Lingui <Trans> elements outside a function in client code.',
    },
    schema: [],
    messages: {
      moduleScopeTrans:
        'Move this <Trans> into the component or function that renders it. Module-scope elements are created once at import time instead of with the render that owns the copy.',
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        if (
          node.name.type !== 'JSXIdentifier' ||
          !isLinguiMacroTrans({ context, node: node.name }) ||
          hasEnclosingFunction(node)
        ) {
          return;
        }

        context.report({ node, messageId: 'moduleScopeTrans' });
      },
    };
  },
});

function isLinguiMacroTrans({ context, node }) {
  const variable = findVariable({
    name: node.name,
    scope: context.sourceCode.getScope(node),
  });

  return (
    variable !== undefined &&
    isNamedImport({
      variable,
      source: '@lingui/react/macro',
      importedName: 'Trans',
    })
  );
}

function hasEnclosingFunction(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (functionTypes.has(current.type)) {
      return true;
    }
  }

  return false;
}
