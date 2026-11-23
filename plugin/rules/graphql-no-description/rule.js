import {
  createRule,
  getPropertyRemovalRange,
  getSourceCode,
  isFunction,
} from '../../utils/utils.js';

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow Pothos schema descriptions because the GraphQL API is internal.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noDescription:
        'Remove the GraphQL schema description. The API is internal, so document non-obvious behavior in a code comment instead.',
    },
  },

  create(context) {
    const sourceCode = getSourceCode(context);

    return {
      Property(node) {
        if (
          getPropertyName(node) !== 'description' ||
          !(isPothosOptions(node.parent) || isEnumValueOptions(node.parent))
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'noDescription',
          fix: fixer =>
            fixer.removeRange(getPropertyRemovalRange({ sourceCode, node })),
        });
      },
    };
  },
});

function getPropertyName(node) {
  if (node.computed) {
    return node.key.type === 'Literal' ? node.key.value : undefined;
  }

  return node.key.type === 'Identifier' ? node.key.name : node.key.value;
}

/**
 * Options objects are passed directly to `builder.*` calls or to field builder
 * calls such as `t.field`, `t.string`, `t.arg.string`, and
 * `t.withAuth(...).field`. Objects returned from `fields` or passed as `args`
 * are never direct call arguments, so GraphQL fields named `description` stay
 * allowed.
 */
function isPothosOptions(node) {
  const call = node?.parent;

  return (
    node?.type === 'ObjectExpression' &&
    call?.type === 'CallExpression' &&
    call.arguments.includes(node) &&
    isPothosCall(call)
  );
}

/** Covers `builder.enumType('Name', { values: { VALUE: { description } } })`. */
function isEnumValueOptions(node) {
  const valueProperty = node?.parent;
  const values = valueProperty?.parent;
  const valuesProperty = skipTypeAssertions(values)?.parent;

  return (
    node?.type === 'ObjectExpression' &&
    valueProperty?.type === 'Property' &&
    valueProperty.value === node &&
    values?.type === 'ObjectExpression' &&
    valuesProperty?.type === 'Property' &&
    getPropertyName(valuesProperty) === 'values' &&
    isPothosOptions(valuesProperty.parent)
  );
}

/** Walks from `{ ... }` to the outermost `{ ... } as const` or `satisfies` wrapper. */
function skipTypeAssertions(node) {
  let current = node;

  while (
    current?.parent?.type === 'TSAsExpression' ||
    current?.parent?.type === 'TSSatisfiesExpression'
  ) {
    current = current.parent;
  }

  return current;
}

function isPothosCall(call) {
  const root = getCalleeRoot(call.callee);

  if (root?.type !== 'Identifier') {
    return false;
  }

  if (root.name === 'builder') {
    return true;
  }

  const owner = findParameterOwner({ node: call, name: root.name });

  return Boolean(
    owner?.params[0] === owner?.binding && isFieldBuilderCallback(owner?.fn)
  );
}

/**
 * Pothos passes its field builder as the first parameter of callbacks given
 * directly to `builder.*Field(s)` or as `fields` options. Other callbacks, such
 * as resolvers, receive application data.
 */
function isFieldBuilderCallback(fn) {
  const parent = fn?.parent;

  if (parent?.type === 'CallExpression') {
    return (
      parent.arguments.includes(fn) &&
      getCalleeRoot(parent.callee)?.name === 'builder'
    );
  }

  return (
    parent?.type === 'Property' &&
    parent.value === fn &&
    getPropertyName(parent) === 'fields' &&
    isPothosOptions(parent.parent)
  );
}

function getCalleeRoot(node) {
  let current = node;

  while (current) {
    if (current.type === 'MemberExpression') {
      current = current.object;
    } else if (current.type === 'CallExpression') {
      current = current.callee;
    } else {
      return current;
    }
  }
}

function findParameterOwner({ node, name }) {
  for (let current = node.parent; current; current = current.parent) {
    const binding =
      isFunction(current) &&
      current.params.find(
        parameter => parameter.type === 'Identifier' && parameter.name === name
      );

    if (binding) {
      return { fn: current, params: current.params, binding };
    }
  }
}
