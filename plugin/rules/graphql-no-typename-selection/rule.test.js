// @vitest-environment node

import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { rule } from './rule.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { lang: 'tsx' },
    sourceType: 'module',
  },
});

ruleTester.run('graphql-no-typename-selection', rule, {
  valid: [
    'const Query = graphql(`query Meeting { meeting { id title } }`);',
    'const Fragment = graphql(`fragment Meeting on Meeting { id __typenameLike }`, [Other]);',
    // Optimistic responses must still carry the type name for the cache.
    "mutate({ optimisticResponse: { deleteMeeting: { __typename: 'Meeting', id } } });",
  ],
  invalid: [
    'const Query = graphql(`query Meeting { meeting { __typename id } }`);',
    "const Query = graphql('query Meeting { meeting { __typename } }');",
  ].map(code => ({
    code,
    output: null,
    errors: [{ messageId: 'typenameSelection' }],
  })),
});
