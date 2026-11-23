import { createRule, unwrapParameter } from '../../utils/utils.js';

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow risky positional function parameter signatures in named functions.',
    },
    messages: {
      tooMany:
        'Prefer a named object parameter instead of {{count}} positional parameters.',
      sameType:
        'Prefer a named object parameter for two positional parameters with the same {{type}} type.',
    },
  },

  create(context) {
    function checkFunction(node) {
      const parameters = node.params ?? [];

      if (
        parameters.length === 0 ||
        parameters.some(parameter => parameter.type === 'RestElement')
      ) {
        return;
      }

      if (
        parameters.length === 1 &&
        isObjectParameter(unwrapParameter(parameters[0]))
      ) {
        return;
      }

      if (parameters.length > 2) {
        context.report({
          node,
          messageId: 'tooMany',
          data: { count: String(parameters.length) },
        });

        return;
      }

      if (parameters.length === 2) {
        const [firstType, secondType] = parameters.map(parameter =>
          getPrimitiveParameterType(parameter)
        );

        if (firstType && firstType === secondType) {
          context.report({
            node,
            messageId: 'sameType',
            data: { type: firstType },
          });
        }
      }
    }

    // Inline callbacks commonly implement a third-party contract (for example
    // Fastify hooks and GraphQL resolvers), whose positional shape cannot change.
    return { FunctionDeclaration: checkFunction };
  },
});

function isObjectParameter(node) {
  return node?.type === 'ObjectPattern';
}

function getPrimitiveParameterType(parameter) {
  const unwrapped = unwrapParameter(parameter);
  const typeNode = unwrapped?.typeAnnotation?.typeAnnotation;

  if (typeNode) {
    return getPrimitiveTypeNodeName(typeNode);
  }

  if (parameter.type === 'AssignmentPattern') {
    return getPrimitiveLiteralTypeName(parameter.right);
  }
}

function getPrimitiveTypeNodeName(typeNode) {
  switch (typeNode.type) {
    case 'TSStringKeyword':
      return 'string';
    case 'TSNumberKeyword':
      return 'number';
    case 'TSBooleanKeyword':
      return 'boolean';
  }
}

function getPrimitiveLiteralTypeName(node) {
  return node.type === 'Literal' &&
    ['string', 'number', 'boolean'].includes(typeof node.value)
    ? typeof node.value
    : undefined;
}
