import { defineConfig } from 'oxlint';

import base from './configs/base.js';
import node from './configs/node.js';
import vitest from './configs/vitest.js';

// Dogfood the published presets on this repository's own code.
export default defineConfig({
  extends: [base, node, vitest],
  env: { ...base.env, ...node.env },
  options: { reportUnusedDisableDirectives: 'error' },
  overrides: [
    {
      // Rules and configs are untyped JavaScript: AST nodes are `any`.
      files: ['**/*.js'],
      rules: {
        'typescript/no-unsafe-argument': 'off',
        'typescript/no-unsafe-assignment': 'off',
        'typescript/no-unsafe-call': 'off',
        'typescript/no-unsafe-member-access': 'off',
        'typescript/no-unsafe-return': 'off',
        'typescript/strict-void-return': 'off',
      },
    },
    {
      // Oxlint loads presets and plugins through their default export.
      files: ['configs/*', 'plugin/index.*'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      // Test helpers create fixture projects and run the CLI synchronously.
      files: ['test/**'],
      rules: {
        'node/no-sync': 'off',
        'vitest/expect-expect': [
          'error',
          { assertFunctionNames: ['expect', 'expectCases'] },
        ],
      },
    },
    {
      // Rule tests and preset fixtures contain invalid code on purpose.
      files: ['test/**', '**/*.test.js'],
      rules: {
        'taito/no-redundant-calc': 'off',
      },
    },
  ],
});
