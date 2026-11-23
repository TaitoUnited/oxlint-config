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

const stackImport = "import { Stack } from '@/components/ui/stack';\n";
const styledImport = "import { styled } from '@/design-system/jsx';\n";
const singleChildStack = { messageId: 'singleChildStack' };
const emptyStyled = { messageId: 'emptyStyled' };

ruleTester.run('no-redundant-stack', rule, {
  valid: [
    `${stackImport}const view = <Stack gap="sm"><Text /><Text /></Stack>;`,
    `${stackImport}const view = <Stack gap="sm">Label<Icon /></Stack>;`,
    // Expression and fragment children may render several elements.
    `${stackImport}const view = <Stack gap="sm">{items.map(item => <Text key={item} />)}</Stack>;`,
    `${stackImport}const view = <Stack gap="sm"><>{first}{second}</></Stack>;`,
    `${stackImport}const view = <Stack gap="sm" align="center"><Text /></Stack>;`,
    `${stackImport}const view = <Stack gap="sm" {...props}><Text /></Stack>;`,
    // Only the UI kit Stack is checked.
    "import { Stack } from '@/design-system/jsx';\nconst view = <Stack gap='sm'><Text /></Stack>;",
    `${styledImport}const Title = styled('h2', { base: { margin: 0 } });`,
    `${styledImport}const Title = styled.h2({ base: { margin: 0 } });`,
    `${styledImport}const Title = styled(Heading, config);`,
    // A local helper named `styled` is not Panda's factory.
    'const Title = styled(Heading);',
  ],
  invalid: [
    {
      code: `${stackImport}const view = <Stack gap="sm">\n  <Text />\n</Stack>;`,
      errors: [singleChildStack],
    },
    {
      code: `${stackImport}const view = <Stack key={id} direction="row" gap="md" wrap="wrap"><Button /></Stack>;`,
      errors: [singleChildStack],
    },
    {
      code: `${stackImport}const view = <Stack gap="sm">{/* Empty for now. */}Label</Stack>;`,
      errors: [singleChildStack],
    },
    {
      code: "import { Stack as Row } from '@/components/ui/stack';\nconst view = <Row gap='sm'><Text /></Row>;",
      errors: [singleChildStack],
    },
    {
      code: "import { Stack } from '../stack';\nconst view = <Stack gap='sm'><Text /></Stack>;",
      filename: '/repo/client/src/components/ui/card/index.tsx',
      errors: [singleChildStack],
    },
    {
      code: `${styledImport}const Title = styled(Heading);`,
      errors: [emptyStyled],
    },
    {
      code: `${styledImport}const Title = styled('h2', {});`,
      errors: [emptyStyled],
    },
    {
      code: `${styledImport}const Title = styled.h2({});`,
      errors: [emptyStyled],
    },
  ],
});

ruleTester.run('no-redundant-stack with options', rule, {
  valid: [
    // The default module is not a Stack once stackModules is replaced.
    {
      code: 'import { Stack } from "@/components/ui/stack"; const view = <Stack gap="1"><span /></Stack>;',
      filename: '/repo/src/view.tsx',
      options: [{ stackModules: ['~/ui/stack'] }],
    },
    {
      code: 'import { styled } from "~/styled-system/jsx"; const Title = styled("h2", { base: { color: "red" } });',
      filename: '/repo/src/view.tsx',
    },
  ],
  invalid: [
    {
      code: 'import { Stack } from "~/ui/stack"; const view = <Stack gap="1"><span /></Stack>;',
      filename: '/repo/src/view.tsx',
      options: [{ stackModules: ['~/ui/stack'] }],
      errors: [{ messageId: 'singleChildStack' }],
    },
    {
      code: 'import { Stack } from "../../ui/stack"; const view = <Stack gap="1"><span /></Stack>;',
      filename: '/repo/src/features/user/view.tsx',
      options: [{ stackModules: ['~/ui/stack'] }],
      errors: [{ messageId: 'singleChildStack' }],
    },
    {
      code: 'import { styled } from "~/styled-system/jsx"; const Title = styled("h2");',
      filename: '/repo/src/view.tsx',
      errors: [{ messageId: 'emptyStyled' }],
    },
    {
      code: 'import { styled } from "@/lib/panda/jsx"; const Title = styled("h2");',
      filename: '/repo/src/view.tsx',
      options: [{ styledModulePattern: String.raw`/panda/jsx$` }],
      errors: [{ messageId: 'emptyStyled' }],
    },
  ],
});
