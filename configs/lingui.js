import { reactRestrictedImports } from './react.js';
import { resolvePlugin, taitoPlugin } from './utils.js';

/**
 * Rules for React applications localized with Lingui.
 *
 * Extend after the React config. It re-declares `no-restricted-imports`, so it
 * keeps the React config's restrictions and adds the Lingui macro ones.
 *
 * @type {import('oxlint').OxlintConfig}
 */
const config = {
  jsPlugins: [
    taitoPlugin,
    resolvePlugin({
      name: 'lingui',
      specifier: 'eslint-plugin-lingui',
    }),
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      ...reactRestrictedImports,
      {
        name: '@lingui/react',
        importNames: ['Trans', 'useLingui'],
        message: 'Use the macros from @lingui/react/macro instead.',
      },
    ],
    'lingui/consistent-plural-format': 'error',
    'lingui/no-expression-in-message': 'error',
    'lingui/no-plural-inside-trans': 'error',
    'lingui/no-single-tag-to-translate': 'error',
    'lingui/no-single-variables-to-translate': 'error',
    'lingui/no-trans-inside-trans': 'error',
    'lingui/t-call-in-function': 'error',
    'taito/lingui-no-module-scope-trans': 'error',
  },
};

export default config;
