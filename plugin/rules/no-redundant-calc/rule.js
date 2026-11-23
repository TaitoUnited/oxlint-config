import { createRule } from '../../utils/utils.js';

// Marks template interpolations, which may hold the operator of a `calc()`.
const expressionPlaceholder = '\0';

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow `calc()` around a single value without an arithmetic operator.',
    },
    schema: [],
    messages: {
      calcWithoutOperator:
        'Remove the redundant `calc()`. It wraps a single value without an arithmetic operator.',
    },
  },

  create(context) {
    function check({ node, value }) {
      if (hasCalcWithoutOperator(value)) {
        context.report({ node, messageId: 'calcWithoutOperator' });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          check({ node, value: node.value });
        }
      },

      TemplateLiteral(node) {
        check({
          node,
          value: node.quasis
            .map(quasi => quasi.value.cooked ?? quasi.value.raw)
            .join(expressionPlaceholder),
        });
      },
    };
  },
});

function hasCalcWithoutOperator(value) {
  for (const match of value.matchAll(/\bcalc\(/g)) {
    const contentStart = match.index + match[0].length;
    const content = readUntilClosingParenthesis({ value, start: contentStart });

    // An empty `calc()` is not CSS, but prose such as an error message.
    if (
      content === undefined ||
      content.trim() === '' ||
      content.includes(expressionPlaceholder)
    ) {
      continue;
    }

    // `+` and `-` are operators only between whitespace; `*` and `/` never need it.
    if (!/[*/]|\s[+-]\s/.test(content)) {
      return true;
    }
  }

  return false;
}

function readUntilClosingParenthesis({ value, start }) {
  let depth = 1;

  for (let index = start; index < value.length; index++) {
    if (value[index] === '(') {
      depth++;
    } else if (value[index] === ')') {
      depth--;

      if (depth === 0) {
        return value.slice(start, index);
      }
    }
  }
}
