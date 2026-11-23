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

ruleTester.run('no-chained-type-assertions', rule, {
  valid: [
    'const value = input as Shape;',
    'const value = <Shape>input;',
    'const value = { id: 1 } as const;',
    'const value = (1 as const) as const;',
    'const value = { id: 1 } satisfies Shape;',
    'const value = (input as Shape).id as string;',
    'const value = (input as Shape)! as Shape;',
    'const value = call(input as Shape) as Result;',
  ],
  invalid: [
    'const value = input as unknown as Shape;',
    'const value = ((input as any)) as Shape;',
    'const value = input as A as B as C;',
    'const value = <Shape><unknown>input;',
    'const value = (<unknown>input) as Shape;',
    'const value = <Shape>(input as unknown);',
    'const value = { id: 1 } as const as Shape;',
    'const value = input as Shape as const;',
    'const value = input as Shape as Shape;',
  ].map(code => ({ code, output: null, errors: [{ messageId: 'chained' }] })),
});

const tsxRuleTester = new RuleTester({
  languageOptions: {
    parserOptions: { lang: 'tsx' },
    sourceType: 'module',
  },
});

tsxRuleTester.run('no-chained-type-assertions in JSX', rule, {
  valid: ['const view = <Widget value={input as Shape} />;'],
  invalid: [
    {
      code: 'const view = <Widget value={input as unknown as Shape} />;',
      output: null,
      errors: [{ messageId: 'chained' }],
    },
  ],
});
