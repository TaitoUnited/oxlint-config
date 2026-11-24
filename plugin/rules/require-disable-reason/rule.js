import { createRule, getSourceCode } from '../../utils/utils.js';

const disableDirectivePattern =
  /^\s*(?:eslint|oxlint)-disable(?:-next-line|-line)?(?=\s|$)/;

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require a reason after `--` in `oxlint-disable` and `eslint-disable` comments.',
    },
    schema: [],
    messages: {
      missingReason:
        'Explain why the rule is disabled after `--`, for example `// oxlint-disable-next-line no-console -- CLI output`.',
    },
  },

  create(context) {
    const sourceCode = getSourceCode(context);

    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          if (!disableDirectivePattern.test(comment.value)) {
            continue;
          }

          const reason = comment.value
            .split(/\s--\s?/)
            .slice(1)
            .join(' -- ');

          if (reason.replaceAll('*', '').trim() === '') {
            context.report({ loc: comment.loc, messageId: 'missingReason' });
          }
        }
      },
    };
  },
});
