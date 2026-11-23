import { taitoPlugin } from './utils.js';

/**
 * Rules for GraphQL clients that use Apollo Client and servers that build
 * their schema with Pothos.
 *
 * The client and server rules only match their own code (`graphql()`
 * documents and Pothos `builder` calls), so one preset serves both sides.
 * Extend after the base config.
 *
 * @type {import('oxlint').OxlintConfig}
 */
const config = {
  jsPlugins: [taitoPlugin],
  rules: {
    'taito/graphql-mutation-returns-entity': 'error',
    'taito/graphql-no-description': 'error',
    'taito/graphql-no-typename-selection': 'error',
  },
};

export default config;
