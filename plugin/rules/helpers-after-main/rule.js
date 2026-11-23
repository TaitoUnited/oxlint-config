import { createRule, getRootIdentifierName } from '../../utils/utils.js';

const testFunctionNames = new Set(['describe', 'test', 'it']);

const defaults = {
  testFilePattern: String.raw`\.(test|spec)\.[^/]+$`,
  moduleFilePattern: String.raw`\.(service|dao)\.[cm]?[jt]s$`,
  mainExportPattern: String.raw`(Service|Dao)$`,
};

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require helper function declarations after the tests in test files, and after the main export in modules such as services.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          // Regex matched against the file path to detect test files.
          testFilePattern: { type: 'string' },
          // Regex matched against the file path to detect modules with a main export.
          moduleFilePattern: { type: 'string' },
          // Regex matched against the name of the exported object or class.
          mainExportPattern: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      testHelperBeforeTests:
        'Move "{{name}}" below the tests. Function declarations are hoisted, so the tests can come first and show the behavior before its helpers.',
      privateHelperBeforeExport:
        'Move "{{name}}" below `{{exportName}}`. Private helpers follow the main export, so the file reads from its public API down.',
    },
  },

  create(context) {
    const options = { ...defaults, ...context.options[0] };
    const filename = context.filename.replaceAll('\\', '/');

    if (new RegExp(options.moduleFilePattern).test(filename)) {
      const mainExportPattern = new RegExp(options.mainExportPattern);

      return {
        Program(program) {
          reportPrivateHelpersBeforeExport({
            context,
            program,
            mainExportPattern,
          });
        },
      };
    }

    if (!new RegExp(options.testFilePattern).test(filename)) {
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

function reportPrivateHelpersBeforeExport({
  context,
  program,
  mainExportPattern,
}) {
  const exportIndex = program.body.findIndex(
    statement => getMainExport({ statement, mainExportPattern }) !== undefined
  );

  if (exportIndex === -1) {
    return;
  }

  const { exportName, memberNames } = getMainExport({
    statement: program.body[exportIndex],
    mainExportPattern,
  });

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

/**
 * Matches `export const userService = { getUser, save: saveUser }` (also with
 * `as const` or `satisfies`) and `export class UserService {}`. Functions
 * listed as object members are public, so they may precede the export.
 */
function getMainExport({ statement, mainExportPattern }) {
  const declaration =
    statement.type === 'ExportNamedDeclaration'
      ? statement.declaration
      : undefined;

  if (
    declaration?.type === 'ClassDeclaration' &&
    declaration.id &&
    mainExportPattern.test(declaration.id.name)
  ) {
    return { exportName: declaration.id.name, memberNames: new Set() };
  }

  if (declaration?.type !== 'VariableDeclaration') {
    return;
  }

  for (const declarator of declaration.declarations) {
    const init = declarator.init ? unwrapTypeExpression(declarator.init) : null;

    if (
      declarator.id.type !== 'Identifier' ||
      !mainExportPattern.test(declarator.id.name) ||
      init?.type !== 'ObjectExpression'
    ) {
      continue;
    }

    const memberNames = new Set();

    for (const property of init.properties) {
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

// `{ ... } as const` and `{ ... } satisfies Service` are still object literals.
function unwrapTypeExpression(node) {
  let current = node;

  while (
    current.type === 'TSAsExpression' ||
    current.type === 'TSSatisfiesExpression'
  ) {
    current = current.expression;
  }

  return current;
}
