import { createRule } from '../../utils/utils.js';

// Panda emits token variables as `--<category>-<name>`, e.g. `--colors-\$text`.
const tokenVariablePattern =
  /var\(\s*--(colors|durations|easings|fonts|line-heights|radii|shadows|sizes|spacing)-/;

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow generated Panda token CSS variables in favor of token syntax.',
    },
    schema: [],
    messages: {
      tokenVariable:
        'Reference the token with Panda token syntax, e.g. `{colors.$text}`, or `token.var("colors.$text")` instead of its generated CSS variable.',
    },
  },

  create(context) {
    function check({ node, value }) {
      if (tokenVariablePattern.test(value)) {
        context.report({ node, messageId: 'tokenVariable' });
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
            .join(''),
        });
      },
    };
  },
});
