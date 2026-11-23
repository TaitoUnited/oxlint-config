import {
  createRule,
  findVariable,
  unwrapParameter,
} from '../../utils/utils.js';

export const rule = createRule({
  meta: {
    type: 'problem',
    schema: [],
    docs: {
      description:
        'Disallow the broad object type in function input contracts.',
    },
    messages: {
      objectParameter:
        'The object type provides no property contract. Use a concrete input type, or unknown at a validation boundary.',
    },
  },

  create(context) {
    function checkParameters(node) {
      for (const parameter of node.params ?? []) {
        const annotation =
          unwrapParameter(parameter)?.typeAnnotation?.typeAnnotation;

        if (annotation && containsObject({ context, annotation })) {
          context.report({ node: annotation, messageId: 'objectParameter' });
        }
      }
    }

    return {
      ArrowFunctionExpression: checkParameters,
      FunctionDeclaration: checkParameters,
      FunctionExpression: checkParameters,
      TSCallSignatureDeclaration: checkParameters,
      TSConstructorType: checkParameters,
      TSConstructSignatureDeclaration: checkParameters,
      TSDeclareFunction: checkParameters,
      TSEmptyBodyFunctionExpression: checkParameters,
      TSFunctionType: checkParameters,
      TSMethodSignature: checkParameters,
    };
  },
});

function containsObject({ context, annotation, visited = new Set() }) {
  if (annotation.type === 'TSObjectKeyword') {
    return true;
  }

  if (annotation.type === 'TSParenthesizedType') {
    return containsObject({
      context,
      annotation: annotation.typeAnnotation,
      visited,
    });
  }

  if (annotation.type === 'TSUnionType') {
    return annotation.types.some(type =>
      containsObject({ context, annotation: type, visited: new Set(visited) })
    );
  }

  if (
    annotation.type !== 'TSTypeReference' ||
    annotation.typeName.type !== 'Identifier' ||
    annotation.typeArguments?.params.length
  ) {
    return false;
  }

  const variable = findVariable({
    name: annotation.typeName.name,
    scope: context.sourceCode.getScope(annotation),
  });

  const declaration = variable?.defs.find(
    definition => definition.node.type === 'TSTypeAliasDeclaration'
  )?.node;

  if (
    declaration?.type !== 'TSTypeAliasDeclaration' ||
    declaration.typeParameters?.params.length ||
    visited.has(declaration)
  ) {
    return false;
  }

  visited.add(declaration);

  return containsObject({
    context,
    annotation: declaration.typeAnnotation,
    visited,
  });
}
