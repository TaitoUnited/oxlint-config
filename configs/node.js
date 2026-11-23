/**
 * Rules for code that runs on Node.js: servers, workers and CLI scripts.
 *
 * Extend after the base config.
 *
 * @type {import('oxlint').OxlintConfig}
 */
const config = {
  env: {
    node: true,
  },
  plugins: ['node'],
  rules: {
    'node/callback-return': 'error',
    'node/exports-style': 'error',
    'node/global-require': 'error',
    'node/handle-callback-err': 'error',
    'node/no-exports-assign': 'error',
    'node/no-mixed-requires': 'error',
    'node/no-new-require': 'error',
    'node/no-path-concat': 'error',
    'node/no-process-env': 'error',
    'node/no-sync': 'error',
    'node/no-top-level-await': 'error',
  },
};

export default config;
