import { createRule, findVariable } from '../../utils/utils.js';

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require query documents instead of operation name strings in Apollo `refetchQueries`.',
    },
    schema: [],
    messages: {
      stringRefetchQuery:
        'Pass the query document instead of the operation name "{{name}}". Documents are type-checked, so renaming or removing the query cannot silently stop the refetch.',
    },
  },

  create(context) {
    function checkArray(array) {
      for (const element of array.elements) {
        const name = getStaticString(element);

        if (name !== undefined) {
          context.report({
            node: element,
            messageId: 'stringRefetchQuery',
            data: { name },
          });
        }
      }
    }

    return {
      Property(node) {
        if (getKeyName(node) !== 'refetchQueries') {
          return;
        }

        const array = resolveArray({ context, node: node.value });

        if (array) {
          checkArray(array);
        }
      },
    };
  },
});

/** The array literal itself, or the array a `const` identifier points to. */
function resolveArray({ context, node }) {
  if (node.type === 'ArrayExpression') {
    return node;
  }

  if (node.type !== 'Identifier') {
    return;
  }

  const variable = findVariable({
    name: node.name,
    scope: context.sourceCode.getScope(node),
  });

  const definition = variable?.defs[0]?.node;

  return definition?.type === 'VariableDeclarator' &&
    definition.parent?.kind === 'const' &&
    definition.init?.type === 'ArrayExpression'
    ? definition.init
    : undefined;
}

function getKeyName(property) {
  if (property.computed) {
    return;
  }

  return property.key.type === 'Identifier'
    ? property.key.name
    : property.key.value;
}

function getStaticString(node) {
  if (node?.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }

  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0].value.cooked;
  }
}
