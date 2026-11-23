import { findVariable, isInternalModule } from '../../utils/utils.js';

export const NETWORK_GLOBALS = new Set([
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
]);

const GLOBAL_OBJECTS = new Set(['globalThis', 'global', 'window', 'self']);

export const MOCK_MUTATORS = new Set([
  'mockImplementation',
  'mockImplementationOnce',
  'mockReturnValue',
  'mockReturnValueOnce',
  'mockResolvedValue',
  'mockResolvedValueOnce',
  'mockRejectedValue',
  'mockRejectedValueOnce',
  'withImplementation',
]);

export function isVitestMethod(origin) {
  return (
    origin?.source === 'vitest' &&
    origin.members.length === 2 &&
    ['vi', 'vitest'].includes(origin.members[0])
  );
}

function getPackageName(source) {
  const normalized = source
    .replaceAll('\\', '/')
    .split('/node_modules/')
    .at(-1);

  const parts = normalized.split('/');

  return normalized.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

export function isNetworkPackage(source, extraPackages = []) {
  if (!source) {
    return false;
  }

  const name = getPackageName(source);

  return (
    extraPackages.includes(name) ||
    [
      'googleapis',
      'google-auth-library',
      'ky',
      'axios',
      'undici',
      'node-fetch',
      'cross-fetch',
      'arctic',
      'graphql-request',
      'graphql-ws',
      'ws',
      'http',
      'https',
      'node:http',
      'node:https',
      'node:http2',
      'http2',
      'ai',
      '@apollo/client',
      '@ai-sdk/google',
      '@ai-sdk/react',
    ].includes(name) ||
    name.startsWith('@aws-sdk/') ||
    name.startsWith('@ai-sdk/')
  );
}

export function isRealDependency({ source, boundary, extraPackages = [] }) {
  const name = getPackageName(source);

  return (
    extraPackages.includes(name) ||
    (boundary !== 'client' &&
      ['pg', 'pg-pool', 'postgres', 'drizzle-orm', 'kysely', 'knex'].includes(
        name
      )) ||
    (boundary === 'client' &&
      ['react', 'react-dom', 'react-hook-form'].includes(name))
  );
}

export function isProtectedModule({
  source,
  boundary,
  networkPackages,
  realDependencies,
}) {
  return (
    isInternalModule(source) ||
    isNetworkPackage(source, networkPackages) ||
    isRealDependency({ source, boundary, extraPackages: realDependencies })
  );
}

export function isAlternativeMockPackage(source) {
  return [
    'nock',
    'fetch-mock',
    'vitest-fetch-mock',
    'jest-fetch-mock',
    'axios-mock-adapter',
  ].includes(getPackageName(source));
}

export function isGlobalObject(origin) {
  return (
    origin?.source === 'global' &&
    origin.members.length === 1 &&
    GLOBAL_OBJECTS.has(origin.members[0])
  );
}

export function isNetworkGlobal(origin, property) {
  if (origin?.source !== 'global') {
    return false;
  }

  const members = [...origin.members];

  if (GLOBAL_OBJECTS.has(members[0])) {
    members.shift();
  }

  if (members.length === 0 && property) {
    members.push(property);
  }

  return (
    NETWORK_GLOBALS.has(members[0]) ||
    (members[0] === 'navigator' &&
      (members[1] === 'serviceWorker' ||
        (members.length === 1 && property === 'serviceWorker')))
  );
}

export function getPropertyName(property, scope) {
  if (property.type !== 'Property') {
    return;
  }

  return !property.computed && property.key.type === 'Identifier'
    ? property.key.name
    : getStaticText({ node: property.key, scope });
}

function getLocalObject({ node: input, scope, seen = new Set() }) {
  const node = unwrapExpression(input);

  if (node?.type === 'ObjectExpression') {
    return node;
  }

  if (node?.type !== 'Identifier') {
    return;
  }

  const binding = getVariableInitializer({ node, scope, seen });

  if (!binding) {
    return;
  }

  const { variable, declaration } = binding;

  if (declaration?.id.type === 'Identifier') {
    return getLocalObject({
      node: declaration.init,
      scope: variable.scope,
      seen,
    });
  }
}

export function hasMockValue({ node: input, scope, seen = new Set() }) {
  const node = unwrapExpression(input);

  if (!node) {
    return false;
  }

  if (getImportOrigin({ node, scope })?.source === 'vitest-mock') {
    return true;
  }

  if (['ArrowFunctionExpression', 'FunctionExpression'].includes(node.type)) {
    return true;
  }

  if (node.type === 'ObjectExpression') {
    return node.properties.some(property =>
      hasMockValue({
        node:
          property.type === 'SpreadElement'
            ? property.argument
            : property.value,
        scope,
        seen: new Set(seen),
      })
    );
  }

  if (node.type === 'SpreadElement') {
    return hasMockValue({ node: node.argument, scope, seen });
  }

  if (node.type === 'ArrayExpression') {
    return node.elements.some(element =>
      hasMockValue({ node: element, scope, seen: new Set(seen) })
    );
  }

  if (node.type === 'Identifier') {
    const binding = getVariableInitializer({ node, scope, seen });

    if (!binding) {
      return false;
    }

    const { variable, declaration } = binding;

    return (
      declaration?.id.type === 'Identifier' &&
      hasMockValue({ node: declaration.init, scope: variable.scope, seen })
    );
  }

  return false;
}

function hasReassignment(variable) {
  return variable.references.some(
    reference => reference.isWrite() && !reference.init
  );
}

export function getStaticText({ node: input, scope, seen = new Set() }) {
  const node = unwrapExpression(input);

  if (node?.type === 'BinaryExpression' && node.operator === '+') {
    const left = getStaticText({ node: node.left, scope, seen: new Set(seen) });

    const right = getStaticText({
      node: node.right,
      scope,
      seen: new Set(seen),
    });

    return left !== undefined && right !== undefined ? left + right : undefined;
  }

  if (node?.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }

  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0]?.value.cooked;
  }

  if (node?.type === 'Identifier' && scope) {
    const binding = getVariableInitializer({ node, scope, seen });

    if (!binding) {
      return;
    }

    const { variable, declaration } = binding;

    if (declaration?.id.type === 'Identifier') {
      return getStaticText({
        node: declaration.init,
        scope: variable.scope,
        seen,
      });
    }
  }
}

// Follow local aliases and static import origins only. Do not infer return
// types, execute modules, or guess what arbitrary helper functions return.
export function getImportOrigin({
  node: input,
  scope,
  seenVariables = new Set(),
}) {
  const node = unwrapExpression(input);

  if (!node || !scope) {
    return;
  }

  if (node.type === 'CallExpression') {
    const origin = getImportOrigin({ node: node.callee, scope, seenVariables });

    if (isVitestMethod(origin) && origin.members[1] === 'mocked') {
      return getImportOrigin({ node: node.arguments[0], scope, seenVariables });
    }

    if (isVitestMethod(origin) && origin.members[1] === 'fn') {
      return { source: 'vitest-mock', members: [] };
    }

    if (
      origin?.source === 'vitest-mock' &&
      MOCK_MUTATORS.has(origin.members.at(-1))
    ) {
      return { source: 'vitest-mock', members: [] };
    }

    return;
  }

  if (node.type === 'AwaitExpression') {
    return getImportOrigin({ node: node.argument, scope, seenVariables });
  }

  if (node.type === 'ImportExpression') {
    const source = getStaticText({ node: node.source, scope });
    return source ? { source, members: [] } : undefined;
  }

  if (node.type === 'MemberExpression') {
    const member =
      !node.computed && node.property.type === 'Identifier'
        ? node.property.name
        : getStaticText({ node: node.property, scope });

    const origin = getImportOrigin({ node: node.object, scope, seenVariables });

    return member && origin
      ? { source: origin.source, members: [...origin.members, member] }
      : undefined;
  }

  if (node.type !== 'Identifier') {
    return;
  }

  const variable = findVariable({ name: node.name, scope });

  if (!variable || variable.defs.length === 0) {
    if (
      GLOBAL_OBJECTS.has(node.name) ||
      NETWORK_GLOBALS.has(node.name) ||
      ['Object', 'navigator'].includes(node.name)
    ) {
      return { source: 'global', members: [node.name] };
    }

    return;
  }

  if (seenVariables.has(variable) || hasReassignment(variable)) {
    return;
  }

  seenVariables.add(variable);

  for (const definition of variable.defs) {
    const declaration = definition.node;

    if (
      definition.type === 'ImportBinding' &&
      declaration.parent?.type === 'ImportDeclaration' &&
      declaration.parent.importKind !== 'type'
    ) {
      const source = declaration.parent.source.value;

      if (declaration.type === 'ImportNamespaceSpecifier') {
        return { source, members: [] };
      }

      if (declaration.type === 'ImportDefaultSpecifier') {
        return { source, members: ['default'] };
      }

      if (
        declaration.type === 'ImportSpecifier' &&
        declaration.importKind !== 'type' &&
        declaration.imported.type === 'Identifier'
      ) {
        return { source, members: [declaration.imported.name] };
      }
    }

    if (
      definition.type !== 'Variable' ||
      declaration.type !== 'VariableDeclarator'
    ) {
      continue;
    }

    if (declaration.id.type === 'Identifier') {
      return getImportOrigin({
        node: declaration.init,
        scope: variable.scope,
        seenVariables,
      });
    }

    if (declaration.id.type === 'ObjectPattern') {
      const property = declaration.id.properties.find(
        candidate =>
          candidate.type === 'Property' &&
          candidate.value.type === 'Identifier' &&
          candidate.value.name === node.name
      );

      if (property?.type !== 'Property') {
        return;
      }

      const member =
        !property.computed && property.key.type === 'Identifier'
          ? property.key.name
          : getStaticText({ node: property.key, scope });

      const origin = getImportOrigin({
        node: declaration.init,
        scope: variable.scope,
        seenVariables,
      });

      return member && origin
        ? { source: origin.source, members: [...origin.members, member] }
        : undefined;
    }
  }
}

function unwrapExpression(input) {
  let node = input;

  while (
    node &&
    [
      'TSAsExpression',
      'TSSatisfiesExpression',
      'TSTypeAssertion',
      'TSNonNullExpression',
      'ParenthesizedExpression',
      'ChainExpression',
    ].includes(node.type)
  ) {
    node = node.expression;
  }

  return node;
}

function getVariableInitializer({ node, scope, seen }) {
  const variable = findVariable({ name: node.name, scope });

  if (!variable || seen.has(variable) || hasReassignment(variable)) {
    return;
  }

  seen.add(variable);

  const declaration = variable.defs.find(
    definition => definition.type === 'Variable'
  )?.node;

  return declaration ? { variable, declaration } : undefined;
}

export function getObjectProperties({ node, scope, seen = new Set() }) {
  const object = getLocalObject({ node, scope, seen });

  return (object?.properties ?? []).flatMap(property =>
    property.type === 'SpreadElement'
      ? getObjectProperties({
          node: property.argument,
          scope,
          seen: new Set(seen),
        })
      : [property]
  );
}
