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

ruleTester.run('no-positional-func-args', rule, {
  valid: [
    'function save() {}',
    'function save(name: string) {}',
    'function save(name: string, count: number) {}',
    'function save({ first, second, third }: { first: string; second: string; third: boolean }) {}',
    'function save(options: { first: string; second: string }) {}',
    'function collect(...values: string[]) {}',
    // Inline callbacks implement external positional contracts.
    'items.map((value, index, values) => value);',
    'register(function(first: string, second: string, third: string) {});',
    // Syntax-only detection cannot establish whether named types are equivalent.
    'function save(first: FirstId, second: SecondId) {}',
  ],
  invalid: [
    {
      code: 'function save(first: string, second: number, third: boolean) {}',
      errors: [{ messageId: 'tooMany', data: { count: '3' } }],
    },
    {
      code: 'function save(first: string, second: string) {}',
      errors: [{ messageId: 'sameType', data: { type: 'string' } }],
    },
    {
      code: 'function save(first: number, second: number) {}',
      errors: [{ messageId: 'sameType', data: { type: 'number' } }],
    },
    {
      code: 'function save(first: boolean, second: boolean) {}',
      errors: [{ messageId: 'sameType', data: { type: 'boolean' } }],
    },
    {
      code: 'function save(first: string, second: string = "") {}',
      errors: [{ messageId: 'sameType', data: { type: 'string' } }],
    },
    {
      code: 'function save(first = 1, second = 2) {}',
      errors: [{ messageId: 'sameType', data: { type: 'number' } }],
    },
    {
      code: 'function save(first = true, second = false) {}',
      errors: [{ messageId: 'sameType', data: { type: 'boolean' } }],
    },
  ],
});
