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

ruleTester.run('no-ssr-guards', rule, {
  valid: [
    'const width = window.innerWidth;',
    'if (typeof value === "undefined") {}',
    'if (typeof window === "object") {}',
    'if (typeof window.matchMedia === "undefined") {}',
    'const hasWindow = "window" in options;',
    'const hasFetch = "fetch" in globalThis;',
    'function read(document?: Document) { return typeof document === "undefined"; }',
    'function read(globalThis: Record<string, unknown>) { return "window" in globalThis; }',
  ],
  invalid: [
    ...[
      'if (typeof window === "undefined") {}',
      'if (typeof window !== "undefined") {}',
      'if ("undefined" === typeof window) {}',
      'if (`undefined` !== typeof window) {}',
    ].map(code => ({
      code,
      output: null,
      errors: [{ messageId: 'typeofGuard' }],
    })),
    {
      code: 'const isBrowser = "window" in globalThis;',
      output: null,
      errors: [{ messageId: 'inGuard' }],
    },
  ],
});
