import {
  isControlFlowStatement,
  isDirective,
  isExportListDeclaration,
  isFunctionDeclaration,
  isImportDeclaration,
  isMultiline,
  isVariableDeclaration,
  hasPaddingAfterStatement,
  requireBlankLineBetween,
  unwrapExport,
} from '../../utils/spacing-utils.js';
import { createRule } from '../../utils/utils.js';

export const rule = createRule({
  meta: {
    type: 'layout',
    docs: {
      description: 'Require a blank line around other multiline statements.',
    },
    fixable: 'whitespace',
    messages: {
      expected: 'Add exactly one blank line around this multiline statement.',
    },
  },

  create(context) {
    function checkStatements(node) {
      const statements =
        node.type === 'SwitchCase' ? node.consequent : node.body;

      for (let index = 0; index < statements.length - 1; index += 1) {
        const statement = statements[index];
        const nextStatement = statements[index + 1];
        const afterStatement = isResidualMultilineStatement(statement);

        const beforeStatement =
          isResidualMultilineStatement(nextStatement) &&
          !hasPaddingAfterStatement(statement);

        if (!afterStatement && !beforeStatement) {
          continue;
        }

        requireBlankLineBetween({
          context,
          node: statement,
          nextNode: nextStatement,
          messageId: 'expected',
          reportNode: afterStatement ? statement : nextStatement,
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

function isResidualMultilineStatement(node) {
  const statement = unwrapExport(node);

  return (
    isMultiline(node) &&
    !isImportDeclaration(node) &&
    !isExportListDeclaration(node) &&
    !isDirective(node) &&
    !isFunctionDeclaration(node) &&
    !isVariableDeclaration(node) &&
    !isControlFlowStatement(node) &&
    statement.type !== 'TSDeclareFunction'
  );
}
