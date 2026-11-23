import { createRule } from '../../utils/utils.js';

export const rule = createRule({
  meta: {
    type: 'problem',
    schema: [],
    docs: {
      description:
        'Disallow chained assertions that bypass type compatibility.',
    },
    messages: {
      chained:
        'Chained assertions discard type evidence. Preserve the original type or validate the value before narrowing it.',
    },
  },

  create(context) {
    function checkAssertion(node) {
      let parent = node.parent;

      while (parent?.type === 'ParenthesizedExpression') {
        parent = parent.parent;
      }

      if (isAssertion(parent)) {
        return;
      }

      let current = node;
      let count = 0;
      let hasTypeAssertion = false;

      while (isAssertion(current)) {
        count += 1;
        const annotation = current.typeAnnotation;

        hasTypeAssertion ||= !(
          annotation.type === 'TSTypeReference' &&
          annotation.typeName.type === 'Identifier' &&
          annotation.typeName.name === 'const'
        );

        current = current.expression;

        while (current.type === 'ParenthesizedExpression') {
          current = current.expression;
        }
      }

      if (count > 1 && hasTypeAssertion) {
        context.report({ node, messageId: 'chained' });
      }
    }

    return {
      TSAsExpression: checkAssertion,
      TSTypeAssertion: checkAssertion,
    };
  },
});

function isAssertion(node) {
  return node?.type === 'TSAsExpression' || node?.type === 'TSTypeAssertion';
}
