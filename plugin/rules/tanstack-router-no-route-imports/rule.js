import { createRule } from '../../utils/utils.js';

const defaults = {
  // Matches `./user.route`, `@/features/user/user.route.tsx` and similar.
  routeModulePattern: String.raw`\.route(\.[cm]?[jt]sx?)?$`,
  // Generated route trees must import every route.
  ignorePattern: String.raw`\.gen\.[cm]?[jt]sx?$`,
};

export const rule = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow static imports of TanStack Router route modules, which break route code-splitting.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          // Regex matched against import sources to detect route modules.
          routeModulePattern: { type: 'string' },
          // Regex matched against the file path of files that may import routes.
          ignorePattern: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      routeImport:
        'Do not import from the route module "{{source}}". It bundles that route into this module and breaks code-splitting. Access the route with `getRouteApi()`, and move shared code into a separate module.',
    },
  },

  create(context) {
    const options = { ...defaults, ...context.options[0] };
    const routeModulePattern = new RegExp(options.routeModulePattern);

    if (
      new RegExp(options.ignorePattern).test(
        context.filename.replaceAll('\\', '/')
      )
    ) {
      return {};
    }

    function check(node) {
      const source = node.source?.value;

      if (
        typeof source !== 'string' ||
        !routeModulePattern.test(source) ||
        isTypeOnly(node)
      ) {
        return;
      }

      context.report({ node, messageId: 'routeImport', data: { source } });
    }

    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
    };
  },
});

// Type-only imports are erased at build time, so they do not affect chunks.
function isTypeOnly(node) {
  if (node.importKind === 'type' || node.exportKind === 'type') {
    return true;
  }

  const specifiers = node.specifiers ?? [];

  return (
    specifiers.length > 0 &&
    specifiers.every(
      specifier =>
        specifier.importKind === 'type' || specifier.exportKind === 'type'
    )
  );
}
