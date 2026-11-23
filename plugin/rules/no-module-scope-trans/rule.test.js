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

ruleTester.run('no-module-scope-trans', rule, {
  valid: [
    'import { Trans } from "@lingui/react/macro"; export function Title() { return <Trans>Projects</Trans>; }',
    'import { Trans } from "@lingui/react/macro"; export const Title = () => <Trans>Projects</Trans>;',
    'import { Trans } from "@lingui/react/macro"; export const Title = function () { return <Trans>Projects</Trans>; };',
    'import { Trans } from "./trans"; const title = <Trans>Projects</Trans>;',
    'const title = <Trans>Projects</Trans>;',
    'import { Trans as Message } from "@lingui/react/macro"; const Trans = () => null; const title = <Trans />;',
  ],
  invalid: [
    'import { Trans } from "@lingui/react/macro"; const title = <Trans>Projects</Trans>;',
    'import { Trans as Message } from "@lingui/react/macro"; const title = <Message>Projects</Message>;',
  ].map(code => ({
    code,
    output: null,
    errors: [{ messageId: 'moduleScopeTrans' }],
  })),
});
