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

ruleTester.run('panda-prefer-combined-properties', rule, {
  valid: [
    "const icon = css({ boxSize: '10px' });",
    "const icon = css({ width: '10px', height: '20px' });",
    "const icon = css({ width: '10px' });",
    "const icon = css({ width: 10, height: '10px' });",
    'const icon = css({ width: size, height: size });',
    "const icon = css({ width: { base: '4', md: '6' }, height: { base: '4', md: '6' } });",
    "const icon = css({ ...base, width: '10px', height: '10px' });",
    "const icon = css({ boxSize: '4', width: '10px', height: '10px' });",
    "const icon = css({ width: '10px', w: '10px', height: '10px' });",
    "const box = css({ paddingTop: '$md', paddingBottom: '$sm' });",
    // Another property sets the same sides, so combining would change the result.
    "const box = css({ paddingBlock: '$xs', paddingTop: '$md', paddingBottom: '$md' });",
    "const box = css({ padding: '$xs', paddingLeft: '$md', paddingRight: '$md' });",
    "const box = css({ paddingTop: '$md', paddingBlockStart: '$md', paddingBottom: '$md' });",
    "const box = css({ marginLeft: 'auto', marginInlineEnd: 'auto' , marginRight: 'auto' });",
    "const view = <div style={{ width: '10px', height: '10px', paddingTop: 4, paddingBottom: 4 }} />;",
    "const options = { width: '10px', height: '10px' };",
  ].map(code => ({ code, filename })),
  invalid: [
    {
      code: "const icon = css({ width: '10px', height: '10px' });",
      output: "const icon = css({ boxSize: '10px' });",
      message:
        "Use `boxSize: '10px'` instead of setting `width` and `height` to the same value.",
    },
    {
      code: "const Icon = styled('div', {\n  base: {\n    width: '10px',\n    height: '10px',\n  },\n});",
      output:
        "const Icon = styled('div', {\n  base: {\n    boxSize: '10px',\n  },\n});",
    },
    {
      code: "const icon = css({ height: '{sizes.4}', color: 'red', width: '{sizes.4}' });",
      output: "const icon = css({ boxSize: '{sizes.4}', color: 'red' });",
    },
    {
      code: 'const icon = css({ w: 4, h: 4 });',
      output: 'const icon = css({ boxSize: 4 });',
    },
    {
      code: "const box = css({ _hover: { width: '6', height: `6` } });",
      output: "const box = css({ _hover: { boxSize: '6' } });",
    },
    {
      code: "const box = cva({ base: { paddingTop: '$lg', paddingBottom: '$lg', display: 'flex' } });",
      output:
        "const box = cva({ base: { paddingBlock: '$lg', display: 'flex' } });",
      message:
        "Use `paddingBlock: '$lg'` instead of setting `paddingTop` and `paddingBottom` to the same value.",
    },
    {
      code: "const box = css({ paddingInline: '$xs', paddingTop: '$md', paddingBottom: '$md' });",
      output: "const box = css({ paddingInline: '$xs', paddingBlock: '$md' });",
    },
    {
      code: "const box = css({ paddingLeft: '$lg', paddingRight: '$lg' });",
      output: "const box = css({ paddingInline: '$lg' });",
    },
    {
      code: "const box = css({ paddingInlineStart: '$lg', paddingInlineEnd: '$lg' });",
      output: "const box = css({ paddingInline: '$lg' });",
    },
    {
      code: "const box = css({ pt: '2', pb: '2' });",
      output: "const box = css({ paddingBlock: '2' });",
    },
    {
      code: "const box = css({ marginTop: '$sm', marginBottom: '$sm' });",
      output: "const box = css({ marginBlock: '$sm' });",
    },
    {
      code: "const box = css({ marginLeft: 'auto', marginRight: 'auto' });",
      output: "const box = css({ marginInline: 'auto' });",
    },
    {
      code: "const box = css({\n  paddingTop: '$md',\n  paddingRight: '$md',\n  paddingBottom: '$md',\n  paddingLeft: '$md',\n});",
      output: "const box = css({\n  padding: '$md',\n});",
      message:
        "Use `padding: '$md'` instead of setting `paddingTop`, `paddingRight`, `paddingBottom` and `paddingLeft` to the same value.",
    },
  ].map(({ code, output, message }) => ({
    code,
    filename,
    output,
    errors: [message ? { message } : { messageId: 'preferCombined' }],
  })),
});

ruleTester.run('panda-prefer-combined-properties with several groups', rule, {
  valid: [],
  invalid: [
    {
      code: "const box = css({ paddingTop: '$md', paddingBottom: '$md', paddingLeft: '$lg', paddingRight: '$lg' });",
      output: "const box = css({ paddingBlock: '$md', paddingInline: '$lg' });",
      filename,
      errors: [
        { messageId: 'preferCombined' },
        { messageId: 'preferCombined' },
      ],
    },
  ],
});
