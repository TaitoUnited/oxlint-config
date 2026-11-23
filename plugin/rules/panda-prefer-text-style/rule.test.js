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

ruleTester.run('panda-prefer-text-style', rule, {
  valid: [
    ...[
      "const title = css({ textStyle: '$headingS' });",
      "const title = css({ textStyle: '$body', fontWeight: 600, lineHeight: '$single-line' });",
      "const code = css({ fontSize: '0.9em' });",
      "const label = css({ fontSize: 'inherit' });",
      "const label = css({ fontSize: '90%' });",
      "const view = <p style={{ fontSize: '12px' }} />;",
      'const options = { fontSize: 12 };',
    ].map(code => ({ code, filename })),
    {
      code: "export const textStyles = defineTextStyles({ body: { value: { fontSize: '16px' } } });",
      filename: '/repo/client/src/design-system/setup/text-styles.ts',
    },
  ],
  invalid: [
    "const title = css({ fontSize: '18px' });",
    'const title = css({ fontSize: 12 });',
    "const title = css({ fontSize: '0.875rem' });",
    "const Title = styled('h2', { base: { fontSize: '$lg' } });",
    "const title = cva({ variants: { size: { small: { fontSize: '12px' } } } });",
  ].map(code => ({
    code,
    filename,
    errors: [
      {
        message:
          'Use a `textStyle` instead of setting `fontSize` directly, so that text follows the typography scale.',
      },
    ],
  })),
});

ruleTester.run('panda-prefer-text-style with options', rule, {
  valid: [
    {
      code: "const title = css({ fontSize: '18px' });",
      filename: '/repo/src/theme/typography.ts',
      options: [{ designSystemPattern: String.raw`(^|/)src/theme/` }],
    },
  ],
  invalid: [
    {
      code: "const title = css({ fontSize: '18px', fontWeight: 700, lineHeight: 1.5 });",
      filename,
      options: [{ properties: ['fontSize', 'fontWeight', 'lineHeight'] }],
      errors: [
        { messageId: 'preferTextStyle', data: { name: 'fontSize' } },
        { messageId: 'preferTextStyle', data: { name: 'fontWeight' } },
        { messageId: 'preferTextStyle', data: { name: 'lineHeight' } },
      ],
    },
    {
      // The default design system path is no longer skipped once the pattern is replaced.
      code: "const title = css({ fontSize: '18px' });",
      filename: '/repo/src/design-system/typography.ts',
      options: [{ designSystemPattern: String.raw`(^|/)src/theme/` }],
      errors: [{ messageId: 'preferTextStyle' }],
    },
  ],
});
