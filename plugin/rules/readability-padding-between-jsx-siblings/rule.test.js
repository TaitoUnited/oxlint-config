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

ruleTester.run('readability-padding-between-jsx-siblings', rule, {
  valid: [
    `const view = (
  <p>
    Welcome <strong>{member.name}</strong> here.
  </p>
);`,
    `const view = (
  <section>
    <Header
      member={member}
    />

    <Details member={member} />
  </section>
);`,
    `const view = (
  <section>
    <Header />
    <Details
      member={member}
    />
  </section>
);`,
  ],
  invalid: [
    {
      code: `const view = (
  <section>
    <Header
      member={member}
    />
    {active ? (
      <Active />
    ) : (
      <Inactive />
    )}
    <Details member={member} />
  </section>
);`,
      output: `const view = (
  <section>
    <Header
      member={member}
    />

    {active ? (
      <Active />
    ) : (
      <Inactive />
    )}

    <Details member={member} />
  </section>
);`,
      errors: [{ messageId: 'expected' }, { messageId: 'expected' }],
    },
  ],
});
