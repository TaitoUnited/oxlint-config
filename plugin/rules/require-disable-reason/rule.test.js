// @vitest-environment node

import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { rule } from './rule.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' }, sourceType: 'module' },
});

ruleTester.run('require-disable-reason', rule, {
  valid: [
    '// oxlint-disable-next-line no-console -- CLI output\nconsole.log(1);',
    'console.log(1); // eslint-disable-line no-console -- CLI output',
    '/* oxlint-disable no-console -- this file is a CLI */\nconsole.log(1);',
    '/* oxlint-enable no-console */',
    '// A comment that mentions oxlint-disable in passing.',
    '// eslint-disabled features are listed below.',
  ],
  invalid: [
    '// oxlint-disable-next-line no-console\nconsole.log(1);',
    'console.log(1); // eslint-disable-line no-console',
    '/* oxlint-disable no-console */\nconsole.log(1);',
    '/* eslint-disable */',
    '// oxlint-disable-next-line no-console --\nconsole.log(1);',
  ].map(code => ({ code, errors: [{ messageId: 'missingReason' }] })),
});
