import { dirname, resolve } from 'node:path';

import { createRule } from '../../utils/utils.js';

const defaultStackModules = ['@/components/ui/stack'];
const defaultStyledModulePattern = String.raw`(design|styled)-system/jsx$`;

// These props do nothing for a single child. Any other prop can still position,
// size or give semantics to it, so it exempts the Stack.
const singleChildIgnoredProps = new Set(['gap', 'direction', 'wrap', 'key']);

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow a Stack that lays out at most one child and a `styled()` call without styles.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          // Import specifiers of the project's Stack component, e.g. "@/components/ui/stack".
          stackModules: { type: 'array', items: { type: 'string' } },
          // Regex matched against import sources that export Panda's `styled`.
          styledModulePattern: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      singleChildStack:
        'This Stack has at most one child, so `gap`, `direction` and `wrap` lay nothing out. Render the child directly and check its width, because the row Stack may have sized it. A Stack that also sets `align`, `justify`, `grow`, `as`, `className` or `style` is allowed.',
      emptyStyled:
        'Remove this `styled()` call. Without a style config it only wraps the component; use the component directly.',
    },
  },

  create(context) {
    const stackModules =
      context.options[0]?.stackModules ?? defaultStackModules;

    const styledModulePattern = new RegExp(
      context.options[0]?.styledModulePattern ?? defaultStyledModulePattern
    );

    const stackNames = new Set();
    const styledNames = new Set();

    return {
      ImportDeclaration(node) {
        const source = node.source.value;

        for (const specifier of node.specifiers) {
          if (specifier.type !== 'ImportSpecifier') {
            continue;
          }

          const importedName = specifier.imported.name;

          if (
            importedName === 'Stack' &&
            isStackModule({ source, filename: context.filename, stackModules })
          ) {
            stackNames.add(specifier.local.name);
          }

          if (importedName === 'styled' && styledModulePattern.test(source)) {
            styledNames.add(specifier.local.name);
          }
        }
      },

      JSXElement(node) {
        const { name, attributes } = node.openingElement;

        if (
          name.type !== 'JSXIdentifier' ||
          !stackNames.has(name.name) ||
          attributes.some(attribute => !isSingleChildIgnoredProp(attribute)) ||
          !hasAtMostOneChild(node.children)
        ) {
          return;
        }

        context.report({
          node: node.openingElement,
          messageId: 'singleChildStack',
        });
      },

      CallExpression(node) {
        const { callee } = node;

        const isStyledFactory =
          callee.type === 'Identifier' && styledNames.has(callee.name);

        // `styled.div({})` takes its config first; `styled(Button, {})` second.
        const isStyledElement =
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          styledNames.has(callee.object.name);

        if (!isStyledFactory && !isStyledElement) {
          return;
        }

        const config = node.arguments[isStyledFactory ? 1 : 0];

        if (
          config === undefined ||
          (config.type === 'ObjectExpression' && config.properties.length === 0)
        ) {
          context.report({ node, messageId: 'emptyStyled' });
        }
      },
    };
  },
});

function isStackModule({ source, filename, stackModules }) {
  if (stackModules.includes(source)) {
    return true;
  }

  if (!source.startsWith('.')) {
    return false;
  }

  const resolved = resolve(dirname(filename), source).replaceAll('\\', '/');

  // `@/components/ui/stack` also matches a relative `../ui/stack` import.
  return stackModules.some(module =>
    resolved.endsWith(`/${module.replace(/^[@~#]\//, '')}`)
  );
}

function isSingleChildIgnoredProp(attribute) {
  return (
    attribute.type === 'JSXAttribute' &&
    attribute.name.type === 'JSXIdentifier' &&
    singleChildIgnoredProps.has(attribute.name.name)
  );
}

/**
 * Whitespace-only text and `{/* comments *\/}` render nothing. An expression
 * or spread child may render several elements, so it counts as a layout.
 */
function hasAtMostOneChild(children) {
  let count = 0;

  for (const child of children) {
    if (child.type === 'JSXText' && child.value.trim() === '') {
      continue;
    }

    if (
      child.type === 'JSXExpressionContainer' &&
      child.expression.type === 'JSXEmptyExpression'
    ) {
      continue;
    }

    if (
      child.type === 'JSXExpressionContainer' ||
      child.type === 'JSXSpreadChild' ||
      child.type === 'JSXFragment'
    ) {
      return false;
    }

    count += 1;
  }

  return count <= 1;
}
