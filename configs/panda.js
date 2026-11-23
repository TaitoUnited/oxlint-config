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
    'taito/panda-no-pointer-cursor': 'error',
    'taito/panda-style-conventions': 'error',
  },
};

export default config;
