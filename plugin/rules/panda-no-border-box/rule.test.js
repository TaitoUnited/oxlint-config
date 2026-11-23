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

ruleTester.run('panda-no-border-box', rule, {
  valid: [
    ...[
      "const Title = styled('p', { base: { boxSizing: 'content-box' } });",
      "const view = <p style={{ boxSizing: 'border-box' }} />;",
      "const options = { boxSizing: 'border-box' };",
    ].map(code => ({ code, filename })),
    {
      code: "export const globalCss = defineGlobalStyles({ '*': { boxSizing: 'border-box' } });",
      filename: '/repo/client/src/design-system/setup/global-styles.ts',
    },
  ],
  invalid: [
    "const Title = css({ '& td': { boxSizing: 'border-box' } });",
    "const Title = styled('p', { base: { boxSizing: 'border-box' } });",
  ].map(code => ({
    code,
    filename,
    output: null,
    errors: [{ messageId: 'boxSizingBorderBox' }],
  })),
});

ruleTester.run('panda-no-border-box with designSystemPattern', rule, {
  valid: [
    {
      code: "const reset = css({ boxSizing: 'border-box' });",
      filename: '/repo/src/theme/global-styles.ts',
      options: [{ designSystemPattern: String.raw`(^|/)src/theme/` }],
    },
  ],
  invalid: [
    {
      // The default design system path is no longer skipped once the pattern is replaced.
      code: "const reset = css({ boxSizing: 'border-box' });",
      filename: '/repo/src/design-system/global-styles.ts',
      options: [{ designSystemPattern: String.raw`(^|/)src/theme/` }],
      output: null,
      errors: [{ messageId: 'boxSizingBorderBox' }],
    },
  ],
});
