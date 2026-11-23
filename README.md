<p align='center'>
  <img src="assets/taito-oxlint-config.png" alt="Taito oxlint config hero image"/>
<p/>

<div align="center" >
  &middot;
  <i>Shared oxlint configuration and custom lint rules for Taito United's JS/TS projects</i>
  &middot;
  <br/>
  <br/>
</div>

- 📐 **Strict, type-aware defaults.** More than 360 built-in Oxlint rules across the `eslint`, `typescript`, `unicorn`, `import`, `oxc` and `promise` plugins, with type-aware rules turned on.
- 🧩 **Composable presets.** Combine a base preset with presets for Node.js, React, Vitest, Playwright, Lingui and Panda CSS.
- 🛠 **Custom rules.** The `taito` plugin ships 26 rules for readable spacing, safer function signatures, React effects and common project conventions. See the [rule reference](docs/rules.md).

## Installation

```sh
npm install --save-dev @taito/oxlint-config oxlint tsrs
```

> [!IMPORTANT]
> Requires Node.js 26 or newer and Oxlint 1.94 or newer.

- [oxlint](https://oxc.rs/docs/guide/usage/linter.html) is a fast linter for JS/TS projects.
- [tsrs](https://github.com/oxc-project/tsrs) is the backend for type-aware rules (`typescript/no-floating-promises`, `typescript/no-unsafe-*`, ...).

> [!WARNING]
> The `react` preset does not work with TypeScript 7 yet. Its [ESLint React](https://eslint-react.xyz) plugins depend on `@typescript-eslint`, which supports TypeScript 6.0 at most, and Oxlint fails to load them in a project that has TypeScript 7 installed. Keep React projects on TypeScript 6 until ESLint React supports TypeScript 7. The other presets work with TypeScript 7.

## Usage

Create an `oxlint.config.ts` file in the package root:

```ts
import base from '@taito/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base],
  env: base.env,
});
```

Then lint:

```sh
npx oxlint
npx oxlint --fix
```

> [!IMPORTANT]
> Oxlint reads `env` (and `ignorePatterns`) only from the root config, not from configs in `extends`. Spread the `env` of every preset you extend into the root config, as the examples below do.

### Presets

| Import                            | Use it for                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `@taito/oxlint-config`            | Every project. Core, TypeScript (type-aware), `import`, `unicorn`, `oxc`, `promise` and Taito's readability rules. |
| `@taito/oxlint-config/node`       | Servers, workers and scripts that run on Node.js.                                                                  |
| `@taito/oxlint-config/react`      | React apps that use React Compiler, including `jsx-a11y` and [ESLint React](https://eslint-react.xyz) rules.       |
| `@taito/oxlint-config/vitest`     | Projects tested with Vitest.                                                                                       |
| `@taito/oxlint-config/playwright` | Playwright end-to-end test packages.                                                                               |
| `@taito/oxlint-config/lingui`     | React apps localized with Lingui. Extend it **after** `react`.                                                     |
| `@taito/oxlint-config/panda`      | Projects styled with Panda CSS.                                                                                    |

The ESLint plugins that the presets use are regular dependencies of this package, pinned to the versions it is tested with, so there is nothing else to install.

### Server

```ts
import base from '@taito/oxlint-config';
import node from '@taito/oxlint-config/node';
import vitest from '@taito/oxlint-config/vitest';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base, node, vitest],
  env: { ...base.env, ...node.env },
  ignorePatterns: ['build'],
});
```

### React client

```ts
import base from '@taito/oxlint-config';
import lingui from '@taito/oxlint-config/lingui';
import panda from '@taito/oxlint-config/panda';
import react from '@taito/oxlint-config/react';
import vitest from '@taito/oxlint-config/vitest';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base, react, lingui, panda, vitest],
  env: { ...base.env, ...react.env },
  ignorePatterns: ['build', 'src/locales', 'styled-system'],
  rules: {
    'taito/no-ssr-guards': 'error',
  },
});
```

### Playwright

```ts
import base from '@taito/oxlint-config';
import playwright from '@taito/oxlint-config/playwright';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base, playwright],
  env: { ...base.env, ...playwright.env },
});
```

### Customizing

Configs are merged from first to last, and your own config always wins. Add rules, overrides and opt-in rules next to `extends`:

```ts
export default defineConfig({
  extends: [base, node],
  env: { ...base.env, ...node.env },
  rules: {
    // Fastify hooks are async but often do not await anything.
    'typescript/require-await': 'off',
    // Opt-in Taito rules with project-specific options.
    'taito/helpers-after-main': [
      'error',
      { serviceFilePattern: String.raw`\.(service|repository)\.ts$` },
    ],
  },
  overrides: [
    {
      files: ['src/**/*.test.ts'],
      rules: {
        'taito/no-internal-test-mocks': ['error', { boundary: 'server' }],
      },
    },
  ],
});
```

A rule's options are replaced, not merged. For example, if you configure `no-restricted-imports` yourself, include the restrictions from the presets that you want to keep. The React preset exports them as `reactRestrictedImports`:

```ts
import react, { reactRestrictedImports } from '@taito/oxlint-config/react';

export default defineConfig({
  extends: [base, react],
  env: { ...base.env, ...react.env },
  rules: {
    'no-restricted-imports': [
      'error',
      ...reactRestrictedImports,
      {
        name: 'sonner',
        importNames: ['toast'],
        message: 'Use the toast helper from the UI kit.',
      },
    ],
  },
});
```

## Rules

### Built-in rules

The base preset enables every `correctness` rule plus a curated set of `eslint`, `typescript`, `unicorn`, `import`, `oxc` and `promise` rules. Some highlights:

- Type-aware TypeScript rules: no floating or misused promises, no unsafe `any` flow, `switch` exhaustiveness, `strict-void-return`, `prefer-nullish-coalescing`, `no-unnecessary-condition`.
- Consistency: `type` instead of `interface`, inline `type` imports, function declarations instead of function expressions (`func-style`), no default exports except in tooling config files and stories, no barrel files.
- Unused variables, arguments and caught errors may be prefixed with `_`.

Read [`configs/`](configs) for the full list. Each preset is a plain JavaScript object.

### Custom rules

See the [rule reference](docs/rules.md) for all 26 `taito/*` rules, their options and the preset that enables each one. Rules that depend on a project's architecture are opt-in. They default to the conventions of the [Taito full-stack template](https://github.com/TaitoUnited/full-stack-template).

## Editor integration

Install the [Oxc VS Code extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) (also on Open VSX). It finds `oxlint.config.ts` automatically.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) to add or change rules and run the tests, and [RELEASING.md](RELEASING.md) to publish a new version.

## License

[MIT](LICENSE)
