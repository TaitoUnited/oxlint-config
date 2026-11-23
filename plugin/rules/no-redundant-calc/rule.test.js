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

ruleTester.run('no-redundant-calc', rule, {
  valid: [
    "const Panel = styled('div', { base: { width: 'calc(100% - {spacing.$md})' } });",
    "const Panel = styled('div', { base: { width: 'calc(100% / 3)', left: 'calc(1px + 2px)' } });",
    'const Panel = styled("div", { base: { fontSize: `clamp(1rem, calc(min(2.8cqw, 4.5cqh) * var(--content-scale)), 1.5rem)` } });',
    'const width = `calc(${columns} * 1px)`;',
    'const width = `calc(${columnWidth})`;',
    "const message = 'Remove the redundant `calc()`.';",
  ].map(code => ({ code, filename })),
  invalid: [
    "const Panel = css({ width: 'calc(var(--panel-width))' });",
    "const Panel = css({ width: 'calc(-1px)' });",
    "const offset = 'calc(100%-1px)';",
  ].map(code => ({
    code,
    filename,
    output: null,
    errors: [{ messageId: 'calcWithoutOperator' }],
  })),
});
