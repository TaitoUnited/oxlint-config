import { describe, expect, it } from 'vitest';

import { codesFor, lintProject } from './helpers.js';

/**
 * Contract tests: each case lints a valid and an invalid fixture through a
 * real Oxlint config that extends the published presets. The invalid fixture
 * must report the rule exactly once; the valid fixture must not report it.
 */
function expectCases({ config, cases }) {
  const files = {};
  const expectations = [];

  for (const { code, name, extension = 'ts', valid, invalid } of cases) {
    const fixtureName = name ?? code.replaceAll(/[^a-z-]/g, '-');

    for (const [kind, source] of Object.entries({ valid, invalid })) {
      const file = `src/${fixtureName}.${kind}.${extension}`;
      files[file] = source;
      expectations.push({ file, code, count: kind === 'invalid' ? 1 : 0 });
    }
  }

  const result = lintProject({ config, files });

  // A skipped or ignored fixture must not silently pass the valid cases.
  expect(result.numberOfFiles).toBe(Object.keys(files).length);

  for (const { file, code, count } of expectations) {
    const codes = codesFor({ diagnostics: result.diagnostics, file });

    expect(
      codes.filter(candidate => candidate === code),
      `${file}: ${code}\nAll diagnostics: ${codes.join(', ')}`
    ).toHaveLength(count);
  }

  for (const diagnostic of result.diagnostics) {
    expect(['error', 'warning']).toContain(diagnostic.severity);
  }
}

const baseCases = [
  {
    code: 'taito(no-chained-type-assertions)',
    valid: 'export const value = 1 as number;',
    invalid: 'export const value = 1 as unknown as string;',
  },
  {
    code: 'taito(no-object-parameters)',
    valid: 'export function save(value: { id: string }) { return value; }',
    invalid: 'export function save(value: object) { return value; }',
  },
  {
    code: 'taito(no-positional-func-args)',
    valid:
      'export function joinNames({ first, second }: { first: string; second: string }) { return first + second; }',
    invalid:
      'export function joinNames(first: string, second: string) { return first + second; }',
  },
  {
    code: 'taito(no-extra-empty-lines)',
    valid: 'export const first = 1;\n\nexport const second = 2;',
    invalid: 'export const first = 1;\n\n\nexport const second = 2;',
  },
  {
    code: 'taito(readability-padding-around-function)',
    valid:
      'export function first() { return 1; }\n\nexport function second() { return 2; }',
    invalid:
      'export function first() { return 1; }\nexport function second() { return 2; }',
  },
  {
    code: 'taito(readability-padding-around-control-flow)',
    valid:
      'export function normalize(value: number) {\n  if (value < 0) {\n    return 0;\n  }\n\n  return value;\n}',
    invalid:
      'export function normalize(value: number) {\n  if (value < 0) {\n    return 0;\n  }\n  return value;\n}',
  },
  {
    code: 'taito(readability-padding-around-multiline-statement)',
    valid:
      'declare function record(value: number): void;\n\nexport function save() {\n  record(\n    1,\n  );\n\n  return 1;\n}',
    invalid:
      'declare function record(value: number): void;\n\nexport function save() {\n  record(\n    1,\n  );\n  return 1;\n}',
  },
  {
    code: 'taito(readability-padding-around-multiline-variable)',
    valid:
      'export function read() {\n  const options = {\n    enabled: true,\n  };\n\n  return options;\n}',
    invalid:
      'export function read() {\n  const options = {\n    enabled: true,\n  };\n  return options;\n}',
  },
  {
    code: 'taito(readability-padding-between-top-level-declarations)',
    valid:
      "export type Identifier = string;\n\nexport const identifier = 'id';",
    invalid:
      "export type Identifier = string;\nexport const identifier = 'id';",
  },
  {
    // Requires the type-aware backend (tsrs) to be installed and enabled.
    code: 'typescript(no-floating-promises)',
    valid: 'export async function remember() { await Promise.resolve(1); }',
    invalid: 'export function forget() { Promise.resolve(1); }',
  },
  {
    code: 'import(no-default-export)',
    valid: 'export const value = 1;',
    invalid: 'const value = 1;\n\nexport default value;',
  },
];

describe('base + node + vitest', () => {
  it('enables the base, Node.js and Vitest rules', () => {
    expectCases({
      config: `
import { defineConfig } from 'oxlint';
import base from '@taito/oxlint-config';
import node from '@taito/oxlint-config/node';
import vitest from '@taito/oxlint-config/vitest';

export default defineConfig({
  extends: [base, node, vitest],
  env: { ...base.env, ...node.env },
});`,
      cases: [
        ...baseCases,
        {
          code: 'node(no-process-env)',
          valid: 'export const value = 1;',
          invalid: 'export const value = process.env.VALUE;',
        },
        {
          code: 'vitest(no-focused-tests)',
          name: 'focused.test',
          valid: "import { it } from 'vitest';\n\nit('works', () => {});",
          invalid:
            "import { it } from 'vitest';\n\nit.only('works', () => {});",
        },
      ],
    });
  });

  it('allows default exports in tooling config files', () => {
    const result = lintProject({
      config: `
import { defineConfig } from 'oxlint';
import base from '@taito/oxlint-config';

export default defineConfig({ extends: [base] });`,
      files: {
        'vite.config.ts': 'const config = {};\n\nexport default config;',
      },
    });

    expect(
      codesFor({ diagnostics: result.diagnostics, file: 'vite.config.ts' })
    ).not.toContain('import(no-default-export)');
  });
});

describe('base + react + lingui + panda', () => {
  it('enables the React, Lingui and Panda rules', () => {
    expectCases({
      config: `
import { defineConfig } from 'oxlint';
import base from '@taito/oxlint-config';
import lingui from '@taito/oxlint-config/lingui';
import panda from '@taito/oxlint-config/panda';
import react from '@taito/oxlint-config/react';

export default defineConfig({
  extends: [base, react, lingui, panda],
  env: { ...base.env, ...react.env },
});`,
      cases: [
        ...baseCases,
        {
          code: 'taito(no-function-deps-in-effect)',
          extension: 'tsx',
          valid:
            "import { useEffect } from 'react';\n\nexport function useSync(value: string) {\n  useEffect(() => {\n    console.info(value);\n  }, [value]);\n}",
          invalid:
            "import { useEffect } from 'react';\n\nexport function useSync(callback: () => void) {\n  useEffect(() => {\n    callback();\n  }, [callback]);\n}",
        },
        {
          code: 'taito(readability-padding-between-jsx-siblings)',
          extension: 'tsx',
          valid:
            'export const view = (\n  <div>\n    <span>\n      First\n    </span>\n\n    <span>Second</span>\n  </div>\n);',
          invalid:
            'export const view = (\n  <div>\n    <span>\n      First\n    </span>\n    <span>Second</span>\n  </div>\n);',
        },
        {
          code: 'eslint(no-restricted-imports)',
          name: 'manual-memoization',
          extension: 'tsx',
          valid: "import { useState } from 'react';\n\nexport { useState };",
          invalid: "import { useMemo } from 'react';\n\nexport { useMemo };",
        },
        {
          code: 'eslint(no-restricted-imports)',
          name: 'lingui-runtime-import',
          extension: 'tsx',
          valid:
            "import { Trans } from '@lingui/react/macro';\n\nexport { Trans };",
          invalid:
            "import { Trans } from '@lingui/react';\n\nexport { Trans };",
        },
        {
          code: 'taito(no-module-scope-trans)',
          extension: 'tsx',
          valid:
            "import { Trans } from '@lingui/react/macro';\n\nexport function Title() {\n  return <Trans>Projects</Trans>;\n}",
          invalid:
            "import { Trans } from '@lingui/react/macro';\n\nexport const title = <Trans>Projects</Trans>;",
        },
        {
          code: 'react-x(no-forward-ref)',
          extension: 'tsx',
          valid:
            "import { useRef } from 'react';\n\nexport function useInput() {\n  return useRef(null);\n}",
          invalid:
            "import { forwardRef } from 'react';\n\nexport const Input = forwardRef<HTMLInputElement>((_props, ref) => <input ref={ref} />);",
        },
        {
          code: 'jsx-a11y(alt-text)',
          extension: 'tsx',
          valid: 'export const image = <img src="/logo.svg" alt="Logo" />;',
          invalid: 'export const image = <img src="/logo.svg" />;',
        },
        {
          code: 'taito(no-pointer-cursor)',
          valid:
            "import { css } from '~/styled-system/css';\n\nexport const button = css({ cursor: 'default' });",
          invalid:
            "import { css } from '~/styled-system/css';\n\nexport const button = css({ cursor: 'pointer' });",
        },
        {
          code: 'taito(panda-style-conventions)',
          valid:
            "import { css } from '~/styled-system/css';\n\nexport const title = css({ $truncate: true });",
          invalid:
            "import { css } from '~/styled-system/css';\n\nexport const title = css({ textOverflow: 'ellipsis' });",
        },
      ],
    });
  });
});

describe('base + playwright', () => {
  it('enables the Playwright rules', () => {
    expectCases({
      config: `
import { defineConfig } from 'oxlint';
import base from '@taito/oxlint-config';
import playwright from '@taito/oxlint-config/playwright';

export default defineConfig({
  extends: [base, playwright],
  env: { ...base.env, ...playwright.env },
});`,
      cases: [
        {
          code: 'playwright(no-focused-test)',
          name: 'focused.spec',
          valid:
            "import { test } from '@playwright/test';\n\ntest('works', async () => {});",
          invalid:
            "import { test } from '@playwright/test';\n\ntest.only('works', async () => {});",
        },
        {
          code: 'eslint(no-restricted-properties)',
          name: 'reload.spec',
          valid:
            'export async function open(page: { goto: (url: string) => Promise<void> }) {\n  await page.goto("/");\n}',
          invalid:
            'export async function open(page: { reload: () => Promise<void> }) {\n  await page.reload();\n}',
        },
      ],
    });
  });
});

describe('opt-in rules', () => {
  it('can be enabled with project-specific options', () => {
    expectCases({
      config: `
import { defineConfig } from 'oxlint';
import base from '@taito/oxlint-config';

export default defineConfig({
  extends: [base],
  rules: {
    'taito/no-redundant-stack': ['error', { stackModules: ['~/ui/stack'] }],
    'taito/no-ssr-guards': 'error',
    'taito/graphql-no-typename-selection': 'error',
  },
});`,
      cases: [
        {
          code: 'taito(no-redundant-stack)',
          extension: 'tsx',
          valid:
            'import { Stack } from \'~/ui/stack\';\n\nexport const view = (\n  <Stack gap="1">\n    <span />\n    <span />\n  </Stack>\n);',
          invalid:
            'import { Stack } from \'~/ui/stack\';\n\nexport const view = (\n  <Stack gap="1">\n    <span />\n  </Stack>\n);',
        },
        {
          code: 'taito(no-ssr-guards)',
          valid: 'export const width = window.innerWidth;',
          invalid:
            "export const width = typeof window === 'undefined' ? 0 : window.innerWidth;",
        },
        {
          code: 'taito(graphql-no-typename-selection)',
          valid:
            'declare function graphql(document: string): unknown;\n\nexport const query = graphql(`query User { user { id } }`);',
          invalid:
            'declare function graphql(document: string): unknown;\n\nexport const query = graphql(`query User { user { __typename id } }`);',
        },
      ],
    });
  });
});
