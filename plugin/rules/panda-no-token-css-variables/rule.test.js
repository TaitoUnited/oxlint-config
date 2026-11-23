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

const filename = '/repo/client/src/features/user/user-list-item.tsx';

ruleTester.run('panda-no-token-css-variables', rule, {
  valid: [
    "const Title = styled('p', { base: { color: '$text', borderColor: '{colors.$line3}' } });",
    "const Title = styled('p', { base: { color: 'var(--color-text)', padding: 'var(--dialog-body-padding, 0px)' } });",
    "const Title = styled('p', { base: { color: token.var('colors.$text') } });",
  ].map(code => ({ code, filename })),
  invalid: [
    "const Title = styled('p', { base: { color: 'var(--colors-\\\\$text)' } });",
    'const shadow = `0 0 0 1px var(--shadows-$xs)`;',
    "const gap = 'var( --spacing-md)';",
  ].map(code => ({
    code,
    filename,
    output: null,
    errors: [{ messageId: 'tokenVariable' }],
  })),
});
