import { taitoPlugin } from './utils.js';

/**
 * Rules for projects styled with Panda CSS.
 *
 * Extend after the base config.
 *
 * @type {import('oxlint').OxlintConfig}
 */
const config = {
  jsPlugins: [taitoPlugin],
  rules: {
    'taito/panda-no-border-box': 'error',
    'taito/panda-no-pointer-cursor': 'error',
    'taito/panda-no-token-css-variables': 'error',
    'taito/panda-prefer-combined-properties': 'error',
    'taito/panda-prefer-text-style': 'error',
  },
};

export default config;
