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

const filename = '/repo/client/src/features/meeting/meeting-list-item.tsx';

ruleTester.run('panda-style-conventions', rule, {
  valid: [
    ...[
      "const Title = styled('p', { base: { color: '$text', borderColor: '{colors.$line3}' } });",
      "const Title = styled('p', { base: { color: 'var(--color-text)', padding: 'var(--dialog-body-padding, 0px)' } });",
      "const Title = styled('p', { base: { $truncate: true } });",
      "const Title = styled('p', { base: { textOverflow: 'clip', boxSizing: 'content-box' } });",
      "const view = <p style={{ textOverflow: 'ellipsis', boxSizing: 'border-box' }} />;",
      "const Panel = styled('div', { base: { width: 'calc(100% - {spacing.$md})' } });",
      "const Panel = styled('div', { base: { width: 'calc(100% / 3)', left: 'calc(1px + 2px)' } });",
      'const Panel = styled("div", { base: { fontSize: `clamp(1rem, calc(min(2.8cqw, 4.5cqh) * var(--content-scale)), 1.5rem)` } });',
      'const width = `calc(${columns} * 1px)`;',
      'const width = `calc(${columnWidth})`;',
    ].map(code => ({ code, filename })),
    {
      code: "export const $truncate = { transform: () => css({ textOverflow: 'ellipsis' }) };",
      filename: '/repo/client/src/design-system/setup/utilities.ts',
    },
  ],
  invalid: [
    [
      "const Title = styled('p', { base: { color: 'var(--colors-\\\\$text)' } });",
      'tokenVariable',
    ],
    ['const shadow = `0 0 0 1px var(--shadows-$xs)`;', 'tokenVariable'],
    [
      "const Title = styled('p', { base: { textOverflow: 'ellipsis' } });",
      'textOverflowEllipsis',
    ],
    [
      "const Title = css({ '& td': { boxSizing: 'border-box' } });",
      'boxSizingBorderBox',
    ],
    [
      "const Panel = css({ width: 'calc(var(--panel-width))' });",
      'calcWithoutOperator',
    ],
    ["const Panel = css({ width: 'calc(-1px)' });", 'calcWithoutOperator'],
  ].map(([code, messageId]) => ({
    code,
    filename,
    output: null,
    errors: [{ messageId }],
  })),
});

ruleTester.run('panda-style-conventions with designSystemPattern', rule, {
  valid: [
    {
      code: "const title = css({ textOverflow: 'ellipsis' });",
      filename: '/repo/src/theme/utilities.ts',
      options: [{ designSystemPattern: String.raw`(^|/)src/theme/` }],
    },
  ],
  invalid: [
    {
      code: "const title = css({ textOverflow: 'ellipsis' });",
      filename: '/repo/src/design-system/utilities.ts',
      options: [{ designSystemPattern: String.raw`(^|/)src/theme/` }],
      output: null,
      errors: [{ messageId: 'textOverflowEllipsis' }],
    },
  ],
});
