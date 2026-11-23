import {
  isClassMethod,
  isFunctionDeclaration,
  isFunctionOverloadPair,
  isMethodOverloadPair,
  isObjectMethod,
  isDeclaration,
  isExportListDeclaration,
  isImportDeclaration,
  hasPaddingAfterStatement,
  requireBlankLineBetween,
} from '../../utils/spacing-utils.js';
import { createRule } from '../../utils/utils.js';

export const rule = createRule({
  meta: {
    type: 'layout',
    docs: {
      description: 'Require a blank line around function definitions.',
    },
    fixable: 'whitespace',
    messages: {
      expected: 'Add exactly one blank line around this function definition.',
    },
  },

  create(context) {
    function checkStatements(node) {
      checkList({
        context,
        items: node.body,
        isFunction: isFunctionDeclaration,
        keepTogether: isFunctionOverloadPair,
        isProgram: node.type === 'Program',
        isStatementList: true,
      });
    }

    function checkClass(node) {
      checkList({
        context,
        items: node.body,
        isFunction: isClassMethod,
        keepTogether: isMethodOverloadPair,
      });
    }

    function checkObject(node) {
      checkList({
        context,
        items: node.properties,
        isFunction: isObjectMethod,
      });
    }

    return {
      Program: checkStatements,
      BlockStatement: checkStatements,
      StaticBlock: checkStatements,
      TSModuleBlock: checkStatements,
      ClassBody: checkClass,
      ObjectExpression: checkObject,
    };
  },
});

function checkList({
  context,
  items,
  isFunction,
  keepTogether = () => false,
  isProgram = false,
  isStatementList = false,
}) {
  for (let index = 0; index < items.length - 1; index += 1) {
    const node = items[index];
    const nextNode = items[index + 1];
    const afterFunction = isFunction(node) && !keepTogether(node, nextNode);

    const beforeFunction =
      isFunction(nextNode) &&
      !isFunction(node) &&
      !(isStatementList && hasPaddingAfterStatement(node)) &&
      !(
        isProgram &&
        isDeclaration(node) &&
        isDeclaration(nextNode) &&
        !isImportDeclaration(node) &&
        !isExportListDeclaration(node)
      );

    if (!afterFunction && !beforeFunction) {
      continue;
    }

    requireBlankLineBetween({
      context,
      node,
      nextNode,
      messageId: 'expected',
      reportNode: afterFunction ? node : nextNode,
    });
  }
}
