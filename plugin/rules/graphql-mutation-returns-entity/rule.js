import { basename } from 'node:path';

import { createRule, getMemberName, isFunction } from '../../utils/utils.js';

const scalarTypeNames = new Set(['Boolean', 'Float', 'Int', 'String']);

const scalarFieldBuilders = new Set(['boolean', 'float', 'int', 'string']);

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require GraphQL mutations to return the changed entity instead of a scalar.',
    },
    schema: [],
    messages: {
      scalarMutation:
        'Return the changed entity instead of `{{type}}` so the client cache updates without a refetch. Deletions return the deleted `ID`.',
    },
  },

  create(context) {
    if (!basename(context.filename).endsWith('.resolver.ts')) {
      return {};
    }

    return {
      CallExpression(node) {
        const method = getMemberName(node.callee);

        if (method !== 'mutationField' && method !== 'mutationFields') {
          return;
        }

        const callback = node.arguments.find(isFunction);
        const returned = callback && getReturnedExpression(callback);

        const fieldCalls =
          method === 'mutationField'
            ? [returned]
            : returned?.type === 'ObjectExpression'
              ? returned.properties.map(property => property.value)
              : [];

        for (const fieldCall of fieldCalls) {
          const scalar = getScalarReturn(fieldCall);

          if (scalar) {
            context.report({
              node: scalar.node,
              messageId: 'scalarMutation',
              data: { type: scalar.type },
            });
          }
        }
      },
    };
  },
});

function getScalarReturn(fieldCall) {
  if (fieldCall?.type !== 'CallExpression') {
    return;
  }

  const builderMethod = getMemberName(fieldCall.callee);

  if (scalarFieldBuilders.has(builderMethod)) {
    return {
      node: fieldCall.callee.property,
      type: `${builderMethod[0].toUpperCase()}${builderMethod.slice(1)}`,
    };
  }

  if (builderMethod !== 'field') {
    return;
  }

  const options = fieldCall.arguments[0];

  const typeProperty =
    options?.type === 'ObjectExpression'
      ? options.properties.find(
          property =>
            property.type === 'Property' &&
            !property.computed &&
            property.key.type === 'Identifier' &&
            property.key.name === 'type'
        )
      : undefined;

  const typeValue = typeProperty?.value;

  if (typeValue?.type === 'Literal' && scalarTypeNames.has(typeValue.value)) {
    return { node: typeValue, type: typeValue.value };
  }
}

function getReturnedExpression(fn) {
  if (fn.body.type !== 'BlockStatement') {
    return fn.body;
  }

  const returnStatement = fn.body.body.find(
    statement => statement.type === 'ReturnStatement'
  );

  return returnStatement?.argument;
}
