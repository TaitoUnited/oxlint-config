import { basename, posix } from 'node:path';

export function createPlugin({ name, version, rules }) {
  return {
    meta: { name, version },
    rules,
  };
}

export function createRule(rule) {
  return rule;
}

export function getSourceCode(context) {
  return context.sourceCode ?? context.getSourceCode();
}

export function getIdentifierName(node) {
  if (!node) {
    return;
  }

  if (node.type === 'Identifier' || node.type === 'JSXIdentifier') {
    return node.name;
  }

  if (node.type === 'ThisExpression') {
    return 'this';
  }

  if (node.type === 'MemberExpression' && !node.computed) {
    const objectName = getIdentifierName(node.object);
    const propertyName = getIdentifierName(node.property);

    return objectName && propertyName
      ? `${objectName}.${propertyName}`
      : undefined;
  }

  if (node.type === 'TSQualifiedName') {
    const leftName = getIdentifierName(node.left);
    const rightName = getIdentifierName(node.right);
    return leftName && rightName ? `${leftName}.${rightName}` : undefined;
  }
}

export function getRootIdentifierName(node) {
  switch (node?.type) {
    case 'Identifier':
      return node.name;
    case 'MemberExpression':
      return node.computed ? undefined : getRootIdentifierName(node.object);
    case 'CallExpression':
      return getRootIdentifierName(node.callee);
  }
}

export function getCalleeName(node) {
  return node?.type === 'CallExpression'
    ? getIdentifierName(node.callee)
    : undefined;
}

export function unwrapParameter(node) {
  if (node?.type === 'AssignmentPattern') {
    return unwrapParameter(node.left);
  }

  if (node?.type === 'TSParameterProperty') {
    return unwrapParameter(node.parameter);
  }

  return node;
}

export function findVariable({ name, scope }) {
  for (let current = scope; current; current = current.upper) {
    const variable = current.set.get(name);

    if (variable) {
      return variable;
    }
  }
}

export function isNamedImport({ variable, source, importedName }) {
  return variable.defs.some(definition => {
    const importNode = definition.node;

    return (
      definition.type === 'ImportBinding' &&
      importNode.type === 'ImportSpecifier' &&
      importNode.imported.type === 'Identifier' &&
      importNode.imported.name === importedName &&
      importNode.parent?.type === 'ImportDeclaration' &&
      importNode.parent.source.value === source
    );
  });
}

const defaultServiceFilePattern = String.raw`\.(service|dao)\.[cm]?[jt]s$`;

/** Whether the file is a service or DAO module, e.g. `user.service.ts`. */
export function isServiceOrDaoFile(
  filename,
  pattern = defaultServiceFilePattern
) {
  return new RegExp(pattern).test(basename(filename));
}

export const serviceFilePatternSchema = {
  type: 'object',
  properties: {
    // Regex matched against the file basename to detect service/DAO modules.
    serviceFilePattern: { type: 'string' },
  },
  additionalProperties: false,
};

export function isInternalModule(target) {
  if (!target) {
    return false;
  }

  const normalized = posix.normalize(target.replaceAll('\\', '/'));

  return (
    !normalized.split('/').includes('node_modules') &&
    ['./', '../', '@/', '~/'].some(prefix => target.startsWith(prefix))
  );
}

export function isFunction(node) {
  return (
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'FunctionExpression' ||
    node.type === 'FunctionDeclaration'
  );
}

export function getMemberName(node) {
  return node?.type === 'MemberExpression' &&
    !node.computed &&
    node.property.type === 'Identifier'
    ? node.property.name
    : undefined;
}
