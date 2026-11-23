import { createRule, getIdentifierName } from '../../utils/utils.js';

const typenameSelectionPattern = /\b__typename\b/;

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow selecting `__typename` in client GraphQL documents.',
    },
    schema: [],
    messages: {
      typenameSelection:
        'Remove the `__typename` selection. Apollo Client adds `__typename` to every selection set automatically.',
    },
  },

  create(context) {
    function checkDocument(document) {
      const text = getDocumentText(document);

      if (text !== undefined && typenameSelectionPattern.test(text)) {
        context.report({ node: document, messageId: 'typenameSelection' });
      }
    }

    return {
      CallExpression(node) {
        if (
          getIdentifierName(node.callee) === 'graphql' &&
          node.arguments.length > 0
        ) {
          checkDocument(node.arguments[0]);
        }
      },
    };
  },
});

function getDocumentText(node) {
  if (node.type === 'TemplateLiteral') {
    return node.quasis.map(quasi => quasi.value.raw).join('');
  }

  return node.type === 'Literal' && typeof node.value === 'string'
    ? node.value
    : undefined;
}
