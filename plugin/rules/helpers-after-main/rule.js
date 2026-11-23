import { basename } from 'node:path';

import {
  createRule,
  getRootIdentifierName,
  isServiceOrDaoFile,
  serviceFilePatternSchema,
} from '../../utils/utils.js';

const testFunctionNames = new Set(['describe', 'test', 'it']);

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require private helper function declarations after the tests in server test files and after the exported service or DAO object.',
    },
    schema: [serviceFilePatternSchema],
    messages: {
      testHelperBeforeTests:
        'Move "{{name}}" below the tests under a `// Helpers` comment. Function declarations are hoisted, so tests can come first and show the behavior before its helpers.',
      privateHelperBeforeExport:
        'Move "{{name}}" below `{{exportName}}`. Only its public members precede the exported object; private helpers follow it.',
    },
  },

  create(context) {
    if (
      isServiceOrDaoFile(
        context.filename,
        context.options[0]?.serviceFilePattern
      )
    ) {
      return {
        Program(program) {
          reportPrivateHelpersBeforeExport({ context, program });
        },
      };
    }

    if (!basename(context.filename).includes('.test.')) {
      return {};
    }

    return {
      Program(program) {
        const firstTestIndex = program.body.findIndex(isTestCall);

        // Shared test utility modules have no tests to come first.
        if (firstTestIndex === -1) {
          return;
        }

        for (const statement of program.body.slice(0, firstTestIndex)) {
          const helper = getHelperFunction(statement);

          if (helper) {
            context.report({
              node: helper,
              messageId: 'testHelperBeforeTests',
              data: { name: helper.id.name },
            });
          }
        }
      },
    };
  },
});

function reportPrivateHelpersBeforeExport({ context, program }) {
  const exportIndex = program.body.findIndex(
    statement => getExportedObject(statement) !== undefined
  );

  if (exportIndex === -1) {
    return;
  }

  const { exportName, memberNames } = getExportedObject(
    program.body[exportIndex]
  );

  for (const statement of program.body.slice(0, exportIndex)) {
    // Directly exported functions are public API, not private helpers.
    if (statement.type === 'ExportNamedDeclaration') {
      continue;
    }

    const helper = getHelperFunction(statement);

    if (helper && !memberNames.has(helper.id.name)) {
      context.report({
        node: helper,
        messageId: 'privateHelperBeforeExport',
        data: { name: helper.id.name, exportName },
      });
    }
  }
}

// Matches `export const userService = { getUser, save: saveUser }`.
function getExportedObject(statement) {
  const declaration =
    statement.type === 'ExportNamedDeclaration'
      ? statement.declaration
      : undefined;

  if (declaration?.type !== 'VariableDeclaration') {
    return;
  }

  for (const declarator of declaration.declarations) {
    if (
      declarator.id.type !== 'Identifier' ||
      !/(Service|Dao)$/.test(declarator.id.name) ||
      declarator.init?.type !== 'ObjectExpression'
    ) {
      continue;
    }

    const memberNames = new Set();

    for (const property of declarator.init.properties) {
      if (
        property.type === 'Property' &&
        property.value.type === 'Identifier'
      ) {
        memberNames.add(property.value.name);
      }
    }

    return { exportName: declarator.id.name, memberNames };
  }
}

function isTestCall(statement) {
  return (
    statement.type === 'ExpressionStatement' &&
    statement.expression.type === 'CallExpression' &&
    testFunctionNames.has(getRootIdentifierName(statement.expression.callee))
  );
}

function getHelperFunction(statement) {
  const declaration =
    statement.type === 'ExportNamedDeclaration'
      ? statement.declaration
      : statement;

  return declaration?.type === 'FunctionDeclaration' && declaration.id
    ? declaration
    : undefined;
}
