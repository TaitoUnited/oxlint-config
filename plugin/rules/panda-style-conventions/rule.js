import {
  getPropertyKeyName,
  getStaticStringValue,
  isInsidePandaStyleCall,
} from '../../utils/panda-styles.js';
import { createRule } from '../../utils/utils.js';

// Panda emits token variables as `--<category>-<name>`, e.g. `--colors-\$text`.
const tokenVariablePattern =
  /var\(\s*--(colors|durations|easings|fonts|line-heights|radii|shadows|sizes|spacing)-/;

const defaultDesignSystemPattern = String.raw`(^|/)src/design-system/`;

// Marks template interpolations, which may hold the operator of a `calc()`.
const expressionPlaceholder = '\0';

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce Panda token, utility, and global-style conventions in client styles.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          // Regex for files that define the design system itself; utility checks skip them.
          designSystemPattern: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tokenVariable:
        'Reference the token with Panda token syntax, e.g. `{colors.$text}`, or `token.var("colors.$text")` instead of its generated CSS variable.',
      textOverflowEllipsis:
        'Use the `$truncate: true` utility instead of `textOverflow: "ellipsis"`.',
      boxSizingBorderBox:
        'Remove `boxSizing: "border-box"`. The global styles already apply it to every element.',
      calcWithoutOperator:
        'Remove the redundant `calc()`. It wraps a single value without an arithmetic operator.',
    },
  },

  create(context) {
    const isDesignSystemFile = new RegExp(
      context.options[0]?.designSystemPattern ?? defaultDesignSystemPattern
    ).test(context.filename.replaceAll('\\', '/'));

    function checkString({ node, value }) {
      if (tokenVariablePattern.test(value)) {
        context.report({ node, messageId: 'tokenVariable' });
      }

      if (hasCalcWithoutOperator(value)) {
        context.report({ node, messageId: 'calcWithoutOperator' });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          checkString({ node, value: node.value });
        }
      },

      TemplateLiteral(node) {
        checkString({
          node,
          value: node.quasis
            .map(quasi => quasi.value.cooked ?? quasi.value.raw)
            .join(expressionPlaceholder),
        });
      },

      Property(node) {
        if (isDesignSystemFile || !isInsidePandaStyleCall(node)) {
          return;
        }

        const name = getPropertyKeyName(node);
        const value = getStaticStringValue(node.value);

        if (name === 'textOverflow' && value === 'ellipsis') {
          context.report({ node, messageId: 'textOverflowEllipsis' });
        }

        if (name === 'boxSizing' && value === 'border-box') {
          context.report({ node, messageId: 'boxSizingBorderBox' });
        }
      },
    };
  },
});

function hasCalcWithoutOperator(value) {
  for (const match of value.matchAll(/\bcalc\(/g)) {
    const contentStart = match.index + match[0].length;
    const content = readUntilClosingParenthesis({ value, start: contentStart });

    if (content === undefined || content.includes(expressionPlaceholder)) {
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
