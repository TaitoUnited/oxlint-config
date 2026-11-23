/**
 * Rules for Vitest test files.
 *
 * Extend after the base config.
 *
 * @type {import('oxlint').OxlintConfig}
 */
const config = {
  plugins: ['vitest'],
  rules: {
    'vitest/expect-expect': 'error',
    'vitest/hoisted-apis-on-top': 'error',
    'vitest/no-commented-out-tests': 'error',
    'vitest/no-conditional-expect': 'error',
    'vitest/no-conditional-tests': 'error',
    'vitest/no-disabled-tests': 'error',
    'vitest/no-focused-tests': 'error',
    'vitest/no-identical-title': 'error',
    'vitest/no-mocks-import': 'error',
    'vitest/no-standalone-expect': 'error',
    'vitest/prefer-to-be': 'error',
    'vitest/require-awaited-expect-poll': 'error',
    'vitest/require-mock-type-parameters': 'error',
    'vitest/require-to-throw-message': 'error',
    'vitest/valid-describe-callback': 'error',
    'vitest/valid-expect': [
      'error',
      {
        maxArgs: 2,
      },
    ],
    'vitest/valid-expect-in-promise': 'error',
    'vitest/valid-title': 'error',
  },
};

export default config;
