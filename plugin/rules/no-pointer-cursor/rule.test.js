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

ruleTester.run('no-pointer-cursor', rule, {
  valid: [
    "const Button = styled('button', { base: { cursor: 'default' } });",
    "const view = <div style={{ cursor: 'pointer' }} />;",
    "const Button = styled('button', { base: { [cursor]: 'pointer' } });",
    "const Row = styled(() => <div style={{ cursor: 'pointer' }} />);",
  ],
  invalid: [
    "const Button = styled('button', { base: { cursor: 'pointer' } });",
    'const className = css.raw({ cursor: `pointer` });',
    "const styles = cva({ variants: { size: { small: { 'cursor': 'pointer' } } } });",
    "const Box = styled.div({ base: { cursor: 'pointer' } });",
  ].map(code => ({
    code,
    output: null,
    errors: [{ messageId: 'pointerCursor' }],
  })),
});
