import { dirname, resolve } from 'node:path';

import { createRule, isInternalModule } from '../../utils/utils.js';

const defaultIgnorePattern = String.raw`(^|/)src/components/ui(/|$)`;

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require application dialogs to be lazy-loaded with `loadable` or React `lazy` instead of imported statically.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          // Regex matched against the resolved import path. Matching modules
          // (for example the UI kit's own dialog primitives) may be imported statically.
          ignorePattern: { type: 'string' },
          // Lazy-loading API that the messages suggest.
          loader: { enum: ['loadable', 'lazy'] },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      staticDialogImport:
        'Lazy-load "{{name}}" with `{{example}}` and preload it on user interaction. Dialogs are not initially visible and should stay out of the importing bundle.',
      staticDefaultDialogImport:
        'Lazy-load "{{name}}" with `{{example}}` and preload it on user interaction. Dialogs are not initially visible and should stay out of the importing bundle.',
    },
  },

  create(context) {
    const filename = context.filename;

    const ignorePattern = new RegExp(
      context.options[0]?.ignorePattern ?? defaultIgnorePattern
    );

    const loader = context.options[0]?.loader ?? 'loadable';

    // Tests and stories render dialogs directly by design.
    if (/\.(test|stories)\.[cm]?[jt]sx?$/.test(filename)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;

        if (
          node.importKind === 'type' ||
          !isApplicationModule({ filename, source, ignorePattern })
        ) {
          return;
        }

        for (const specifier of node.specifiers) {
          const name = getImportedName(specifier);

          if (
            specifier.importKind === 'type' ||
            !name?.endsWith('Dialog') ||
            /^use[A-Z]/.test(name)
          ) {
            continue;
          }

          const isDefault = specifier.type === 'ImportDefaultSpecifier';

          context.report({
            node: specifier,
            messageId: isDefault
              ? 'staticDefaultDialogImport'
              : 'staticDialogImport',
            data: {
              name,
              example: getLazyLoadExample({ loader, name, source, isDefault }),
            },
          });
        }
      },
    };
  },
});

function getLazyLoadExample({ loader, name, source, isDefault }) {
  const load = `import("${source}")`;

  if (loader === 'lazy') {
    return isDefault
      ? `lazy(() => ${load})`
      : `lazy(() => ${load}.then(mod => ({ default: mod.${name} })))`;
  }

  return isDefault
    ? `loadable(() => ${load})`
    : `loadable(() => ${load}.then(mod => mod.${name}))`;
}

function isApplicationModule({ filename, source, ignorePattern }) {
  if (!isInternalModule(source)) {
    return false;
  }

  const path = source.startsWith('@/')
    ? `src/${source.slice(2)}`
    : resolve(dirname(filename), source);

  return !ignorePattern.test(path);
}

function getImportedName(specifier) {
  switch (specifier.type) {
    case 'ImportSpecifier':
      return specifier.imported.type === 'Identifier'
        ? specifier.imported.name
        : specifier.imported.value;
    case 'ImportDefaultSpecifier':
      return specifier.local.name;
  }
}
