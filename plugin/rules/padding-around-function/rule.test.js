// @vitest-environment node

import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { rule } from './rule.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { lang: 'ts' },
    sourceType: 'module',
  },
});

ruleTester.run('padding-around-function', rule, {
  valid: [
    `function first() {}

function second() {}`,
    `function parse(value: string): string;
function parse(value: unknown): string {
  return String(value);
}

function next() {}`,
    `class Store {
  find() {}

  save() {}
}`,
    `class Parser {
  parse(value: string): string;
  parse(value: unknown): string {
    return String(value);
  }

  reset() {}
}`,
    `const actions = {
  activate() {},

  suspend() {},
};`,
    `const first = 1;

function save() {}`,
    `function run() {
  if (active) {
    work();
  }
  function save() {}
}`,
  ],
  invalid: [
    {
      code: `function first() {}
function second() {}`,
      output: `function first() {}

function second() {}`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `function first() {} // first handler
// Second handler.
function second() {}`,
      output: `function first() {} // first handler

// Second handler.
function second() {}`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `class Store {
  find() {}
  save() {}
}`,
      output: `class Store {
  find() {}

  save() {}
}`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `const actions = {
  activate() {},
  suspend() {},
};`,
      output: `const actions = {
  activate() {},

  suspend() {},
};`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `function run() {
  prepare();
  function save() {}
}`,
      output: `function run() {
  prepare();

  function save() {}
}`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `import { value } from './value';
function save() {}`,
      output: `import { value } from './value';

function save() {}`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `class Store {
  value = 1;
  save() {}
}`,
      output: `class Store {
  value = 1;

  save() {}
}`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `const actions = {
  value: 1,
  save() {},
};`,
      output: `const actions = {
  value: 1,

  save() {},
};`,
      errors: [{ messageId: 'expected' }],
    },
  ],
});
