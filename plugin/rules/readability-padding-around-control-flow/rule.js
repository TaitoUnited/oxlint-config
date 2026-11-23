import {
  hasPaddingAfterStatement,
  isControlFlowStatement,
  isMultiline,
  requireBlankLineBetween,
} from '../../utils/spacing-utils.js';
import { createRule } from '../../utils/utils.js';

export const rule = createRule({
  meta: {
    type: 'layout',
    docs: {
      description:
        'Require a blank line around multiline control-flow statements.',
    },
    fixable: 'whitespace',
    messages: {
      expected:
        'Add exactly one blank line around this control-flow statement.',
    },
  },

  create(context) {
    function checkStatements(node) {
      const statements =
        node.type === 'SwitchCase' ? node.consequent : node.body;

      for (let index = 0; index < statements.length - 1; index += 1) {
        const statement = statements[index];
        const nextStatement = statements[index + 1];

        const afterControlFlow =
          isControlFlowStatement(statement) && isMultiline(statement);

        const beforeControlFlow =
          isControlFlowStatement(nextStatement) &&
          isMultiline(nextStatement) &&
          !hasPaddingAfterStatement(statement);

        if (!afterControlFlow && !beforeControlFlow) {
          continue;
        }

        requireBlankLineBetween({
          context,
          node: statement,
          nextNode: nextStatement,
          messageId: 'expected',
          reportNode: afterControlFlow ? statement : nextStatement,
        });
      }
    }

    return {
      Program: checkStatements,
      BlockStatement: checkStatements,
      StaticBlock: checkStatements,
      SwitchCase: checkStatements,
      TSModuleBlock: checkStatements,
    };
  },
});
