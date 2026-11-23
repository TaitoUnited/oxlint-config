import { getRootIdentifierName } from './utils.js';

const pandaStyleFunctionNames = new Set(['css', 'cva', 'styled', 'sva']);

const styleBoundaryTypes = new Set([
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
  'JSXAttribute',
]);

export function getPropertyKeyName(property) {
  if (property.computed) {
    return;
  }

  if (property.key.type === 'Identifier') {
    return property.key.name;
  }

  return property.key.type === 'Literal'
    ? String(property.key.value)
    : undefined;
}

export function getStaticStringValue(node) {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }

  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0].value.cooked;
  }
}

export function isInsidePandaStyleCall(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (styleBoundaryTypes.has(current.type)) {
      return false;
    }

    if (
      current.type === 'CallExpression' &&
      pandaStyleFunctionNames.has(getRootIdentifierName(current.callee))
    ) {
      return true;
    }
  }

  return false;
}
