# Contributing

## Setup

```sh
nvm use        # Node.js version from .nvmrc
npm ci
npm run verify # lint + format check + tests
```

| Script                            | What it does                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| `npm run lint` / `lint:fix`       | Lints this repository with its own presets ([`oxlint.config.ts`](oxlint.config.ts)). |
| `npm run format` / `format:check` | Formats with oxfmt.                                                                  |
| `npm test` / `test:watch`         | Runs rule unit tests and preset contract tests with Vitest.                          |
| `npm run verify`                  | Runs everything that CI runs.                                                        |
| `npm run pack:check`              | Lists the files that `npm publish` would include.                                    |
| `npm run release`                 | Publishes a new version with np. See [docs/releasing.md](docs/releasing.md).         |

## Repository layout

```text
configs/                 Presets, one plain JS object per export
  base.js                Built-in rules for every project + taito base rules
  node.js react.js ...   Additional presets
  utils.js               JS plugin resolution helpers
  *.d.ts                 Hand-written types for the exports
plugin/
  index.js               The `taito` JS plugin (rule registry)
  rules/<rule>/rule.js       Rule implementation
  rules/<rule>/rule.test.js  RuleTester unit tests
  utils/                 Shared AST and spacing helpers
test/
  presets.test.js        Runs the real Oxlint CLI against fixtures through the presets
  plugin.test.js         Rule registry, unit test and documentation drift checks
docs/<preset>.md         Preset docs: built-in rule highlights and custom rules
                         with Bad/Good examples (graphql.md for GraphQL rules)
docs/ideas.md            Candidate rules that are not implemented yet
docs/releasing.md        How to publish a new version
```

The package ships plain ESM JavaScript without a build step. Oxlint loads `oxlint.config.ts` and JS plugins with Node.js, and Node.js does not strip types from files in `node_modules`, so published code must be JavaScript.

## Adding a rule

1. Create `plugin/rules/<rule-name>/rule.js`:

   ```js
   import { createRule } from '../../utils/utils.js';

   export const rule = createRule({
     meta: {
       type: 'problem', // or 'suggestion' | 'layout'
       docs: { description: 'Disallow something specific.' },
       schema: [], // JSON schema for options; [] when the rule takes none
       messages: {
         someMessage: 'Explain what is wrong and what to do instead.',
       },
     },
     create(context) {
       return {
         CallExpression(node) {
           context.report({ node, messageId: 'someMessage' });
         },
       };
     },
   });
   ```

   The rule API is ESLint-compatible. Read the [Oxlint JS plugin docs](https://oxc.rs/docs/guide/usage/linter/js-plugins.html) for what is supported. JS plugins have no type information, so match syntax and imports, not types.

   Prefix a rule that only applies to one library with the library's name: `react-`, `lingui-`, `panda-` or `graphql-`, for example `graphql-no-description` (enabled as `taito/graphql-no-description`). Blank-line rules use `readability-padding-`. Rules for any TS/JS code have no prefix.

2. Register it in [`plugin/index.js`](plugin/index.js) (keep the list alphabetical).
3. Add `plugin/rules/<rule-name>/rule.test.js` (see [Testing rules](#testing-rules)). `test/plugin.test.js` fails without it.
4. Document it in the docs file of the preset that enables it (`docs/<preset>.md`), or of its topic for an opt-in rule. Add a ``### `taito/<rule-name>` `` heading, a row in the file's rule table, a short explanation, a **Bad** and a **Good** example, and an options table if the rule takes options. `test/plugin.test.js` fails until the heading exists.
5. Decide where it belongs:
   - **Generally applicable**: enable it in the matching preset in `configs/` and add a valid/invalid case to `test/presets.test.js`.
   - **Depends on a project's architecture or libraries**: keep it opt-in. Make paths, module names and file patterns configurable through options. Use the Taito full-stack template conventions as defaults.
6. Add a `CHANGELOG.md` entry under `Unreleased`.

## Testing rules

### Unit tests

Rules are unit tested with Oxlint's ESLint-compatible `RuleTester`, which runs through Vitest:

```js
import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { rule } from './rule.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { lang: 'ts' }, // 'tsx' for JSX
    sourceType: 'module',
  },
});

ruleTester.run('my-rule', rule, {
  valid: ['const ok = 1;', { code: '...', options: [{ someOption: true }] }],
  invalid: [
    {
      code: 'const bad = 1;',
      filename: '/repo/src/user.service.ts', // for filename-dependent rules
      output: null, // or the expected autofix output
      errors: [{ messageId: 'someMessage' }],
    },
  ],
});
```

Cover the false positives you thought about as `valid` cases, and test every option.

### Preset contract tests

[`test/presets.test.js`](test/presets.test.js) creates a temporary project, writes an `oxlint.config.ts` that imports the presets by package name (`@taito/oxlint-config/react`, through the package's own `exports`) and runs the real Oxlint CLI. These tests cover what unit tests cannot:

- presets resolve and load their JS plugins;
- rules are enabled with the intended severity;
- type-aware linting works;
- overrides such as default exports in config files apply.

Use them when you change presets, `package.json` `exports` or plugin resolution. They are slower because each case runs the CLI with the type-aware backend.

### Trying the package in a real project

```sh
npm pack                               # creates taito-oxlint-config-<version>.tgz
cd ../some-project
npm install --save-dev ../oxlint-config/taito-oxlint-config-<version>.tgz
npx oxlint
```

`npm link` also works. Because of symlinks, `oxlint` and the ESLint plugins are then resolved from this repository's `node_modules`.

## Changing presets

- Keep each preset self-contained. If it uses `taito/*` rules, add `taitoPlugin` to its `jsPlugins`. Add third-party JS plugins to `dependencies` with an exact version and load them with `resolvePlugin()`, which resolves them from this package's location.
- Set `env` in the preset for consumers to spread, because Oxlint ignores `env` in extended configs.
- A rule's options are replaced, not merged, when several presets configure the same rule. If two presets need the same rule, as `react` and `lingui` do with `no-restricted-imports`, export the entries and compose them.
- Enabling a rule or making it stricter is a breaking change for consumers. Note it in the changelog.

## Upgrading Oxlint

1. Bump `oxlint`, `oxfmt` and `tsrs` in `devDependencies`, and the `peerDependencies` ranges if needed. Update the ESLint plugins in `dependencies` the same way.
2. Run `npm run verify`. Renamed or removed rules make the preset tests fail with a configuration error.
3. Check the [Oxlint changelog](https://github.com/oxc-project/oxc/blob/main/apps/oxlint/CHANGELOG.md) for new rules worth enabling.
