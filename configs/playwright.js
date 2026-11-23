import { resolvePlugin } from './utils.js';

/**
 * Rules for Playwright end-to-end test projects.
 *
 * Extend after the base config. The rules apply to every file the config
 * lints, so use it in the Playwright package's own Oxlint config.
 *
 * @type {import('oxlint').OxlintConfig}
 */
const config = {
  env: {
    node: true,
  },
  jsPlugins: [
    resolvePlugin({
      name: 'playwright',
      specifier: 'eslint-plugin-playwright',
    }),
  ],
  rules: {
    'no-restricted-properties': [
      'error',
      {
        property: 'reload',
        message:
          'Do not reload pages in E2E tests. Assert updates in the current page.',
      },
    ],
    // Playwright fixtures destructure an empty object when they use no other fixtures.
    'no-empty-pattern': 'off',
    'no-unexpected-multiline': 'error',
    'typescript/no-explicit-any': 'error',
    'playwright/expect-expect': 'warn',
    'playwright/max-nested-describe': 'warn',
    'playwright/missing-playwright-await': 'error',
    'playwright/no-conditional-expect': 'warn',
    'playwright/no-conditional-in-test': 'warn',
    'playwright/no-element-handle': 'warn',
    'playwright/no-eval': 'warn',
    'playwright/no-focused-test': 'error',
    'playwright/no-force-option': 'warn',
    'playwright/no-nested-step': 'warn',
    'playwright/no-networkidle': 'error',
    'playwright/no-page-pause': 'warn',
    'playwright/no-skipped-test': 'warn',
    'playwright/no-standalone-expect': 'error',
    'playwright/no-unsafe-references': 'error',
    'playwright/no-useless-await': 'warn',
    'playwright/no-useless-not': 'warn',
    'playwright/no-wait-for-selector': 'warn',
    'playwright/no-wait-for-timeout': 'warn',
    'playwright/prefer-web-first-assertions': 'error',
    'playwright/valid-describe-callback': 'error',
    'playwright/valid-expect': 'error',
    'playwright/valid-expect-in-promise': 'error',
    'playwright/valid-title': 'error',
  },
};

export default config;
