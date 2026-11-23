// @vitest-environment node

import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { rule } from './rule.js';

RuleTester.describe = describe;
RuleTester.it = it;

const tsRuleTester = new RuleTester({
  languageOptions: {
    parserOptions: { lang: 'ts' },
    sourceType: 'module',
  },
});

const tsxRuleTester = new RuleTester({
  languageOptions: {
    parserOptions: { lang: 'tsx' },
    sourceType: 'module',
  },
});

tsRuleTester.run('readability-padding-no-extra-empty-lines', rule, {
  valid: [
    `function run() {
  const first = 1;

  const second = 2;
}`,
    `const values = [
  first,
  second,
];`,
    `type DialogOptions = {
  housingCommunity: {
    id: string;
    name: string;
  };
  onClose: () => void;
};`,
  ],
  invalid: [
    {
      code: `const first = 1;


const second = 2;`,
      output: `const first = 1;

const second = 2;`,
      errors: [{ messageId: 'multiple' }],
    },
    {
      code: `function run() {

  execute();
}`,
      output: `function run() {
  execute();
}`,
      errors: [{ messageId: 'boundary' }],
    },
    {
      code: `function run() {
  execute();

}`,
      output: `function run() {
  execute();
}`,
      errors: [{ messageId: 'boundary' }],
    },
    {
      code: `function run() {

  // This operation must remain first.
  execute();
}`,
      output: `function run() {
  // This operation must remain first.
  execute();
}`,
      errors: [{ messageId: 'boundary' }],
    },
    {
      code: `function run() {
  execute(); // This operation must remain last.

}`,
      output: `function run() {
  execute(); // This operation must remain last.
}`,
      errors: [{ messageId: 'boundary' }],
    },
    {
      code: `const values = [


  first,
  second,
];`,
      output: `const values = [
  first,
  second,
];`,
      errors: [{ messageId: 'boundary' }],
    },
    {
      code: `const options = {
  first: true,


  second: true,
};`,
      output: `const options = {
  first: true,

  second: true,
};`,
      errors: [{ messageId: 'multiple' }],
    },
  ],
});

tsxRuleTester.run('readability-padding-no-extra-empty-lines-jsx', rule, {
  valid: [
    `const view = <p>
  Welcome <strong>{name}</strong> here.
</p>;`,
  ],
  invalid: [
    {
      code: `const view = <>

  <Header />
</>;`,
      output: `const view = <>
  <Header />
</>;`,
      errors: [{ messageId: 'boundary' }],
    },
  ],
});
