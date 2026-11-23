# Custom rules

All custom rules live in the `taito` JS plugin that ships with this package. Every preset that uses one of them registers the plugin for you, so rule IDs are always `taito/<rule>`.

- **Preset** says which preset enables the rule. _Opt-in_ rules are not enabled by any preset because they depend on a project's architecture or libraries. Enable them yourself (see [Enabling opt-in rules](#enabling-opt-in-rules)).
- **Fix** marks rules that `oxlint --fix` can fix automatically.

| Rule                                                                                     | Preset | Fix |
| ---------------------------------------------------------------------------------------- | ------ | --- |
| [`no-chained-type-assertions`](#taitono-chained-type-assertions)                         | base   |     |
| [`no-extra-empty-lines`](#taitono-extra-empty-lines)                                     | base   | ✓   |
| [`no-object-parameters`](#taitono-object-parameters)                                     | base   |     |
| [`no-positional-func-args`](#taitono-positional-func-args)                               | base   |     |
| [`padding-around-control-flow`](#taitopadding-around-control-flow)                       | base   | ✓   |
| [`padding-around-function`](#taitopadding-around-function)                               | base   | ✓   |
| [`padding-around-multiline-statement`](#taitopadding-around-multiline-statement)         | base   | ✓   |
| [`padding-around-multiline-variable`](#taitopadding-around-multiline-variable)           | base   | ✓   |
| [`padding-between-top-level-declarations`](#taitopadding-between-top-level-declarations) | base   | ✓   |
| [`no-function-deps-in-effect`](#taitono-function-deps-in-effect)                         | react  |     |
| [`padding-between-jsx-siblings`](#taitopadding-between-jsx-siblings)                     | react  | ✓   |
| [`no-module-scope-trans`](#taitono-module-scope-trans)                                   | lingui |     |
| [`no-pointer-cursor`](#taitono-pointer-cursor)                                           | panda  |     |
| [`panda-style-conventions`](#taitopanda-style-conventions)                               | panda  |     |
| [`lazy-load-dialogs`](#taitolazy-load-dialogs)                                           | opt-in |     |
| [`no-redundant-stack`](#taitono-redundant-stack)                                         | opt-in |     |
| [`no-ssr-guards`](#taitono-ssr-guards)                                                   | opt-in |     |
| [`graphql-no-typename-selection`](#taitographql-no-typename-selection)                   | opt-in |     |
| [`no-internal-test-mocks`](#taitono-internal-test-mocks)                                 | opt-in |     |
| [`helpers-after-main`](#taitohelpers-after-main)                                         | opt-in |     |
| [`graphql-mutation-returns-entity`](#taitographql-mutation-returns-entity)               | opt-in |     |
| [`graphql-no-description`](#taitographql-no-description)                                 | opt-in | ✓   |

Regex options are JavaScript regular expression sources written as strings. Use `String.raw` in `oxlint.config.ts` to avoid double escaping.

## Enabling opt-in rules

```ts
import base from '@taito/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base],
  env: base.env,
  rules: {
    'taito/no-ssr-guards': 'error',
    'taito/no-redundant-stack': [
      'error',
      { stackModules: ['~/components/stack'] },
    ],
  },
});
```

The base preset registers the `taito` plugin, so any config that extends it can enable opt-in rules. Without the base preset, register the plugin yourself:

```ts
import { defineConfig } from 'oxlint';

export default defineConfig({
  jsPlugins: [
    {
      name: 'taito',
      specifier: import.meta.resolve('@taito/oxlint-config/plugin'),
    },
  ],
  rules: { 'taito/no-chained-type-assertions': 'error' },
});
```

## Base rules

### `taito/no-chained-type-assertions`

Disallows chained assertions such as `value as unknown as Shape`, which skip TypeScript's compatibility check. `as const` chains are allowed.

```ts
const user = input as unknown as User; // ✗
const user = parseUser(input); // ✓ validate instead
```

### `taito/no-extra-empty-lines`

Disallows more than one consecutive blank line, and blank lines directly inside the start or end of blocks, classes, objects, arrays, type literals and JSX elements.

### `taito/no-object-parameters`

Disallows the broad `object` type in parameter annotations, including through local type aliases and unions. `object` gives no property contract. Use a concrete type, or `unknown` at a validation boundary.

```ts
function save(value: object) {} // ✗
function save(value: { id: string }) {} // ✓
function save<T extends object>(value: T) {} // ✓ constraints are fine
```

### `taito/no-positional-func-args`

Function declarations may take at most two positional parameters, and two parameters may not share the same primitive type (`string`, `number`, `boolean`), because call sites can swap them silently. Use a single object parameter instead. Inline callbacks are ignored because they usually implement a third-party signature.

```ts
function rename(from: string, to: string) {} // ✗
function rename({ from, to }: { from: string; to: string }) {} // ✓
```

### `taito/padding-around-control-flow`

Requires exactly one blank line before and after multiline `if`, `for`, `while`, `do`, `switch` and `try` statements.

### `taito/padding-around-function`

Requires exactly one blank line around function declarations, class methods and object methods. Overload signatures stay together.

### `taito/padding-around-multiline-statement`

Requires exactly one blank line around other multiline statements, such as a function call spread over several lines.

### `taito/padding-around-multiline-variable`

Requires exactly one blank line next to multiline variable declarations.

### `taito/padding-between-top-level-declarations`

Requires a blank line between top-level declarations. Consecutive single-line `const` or `type` declarations may stay grouped.

The padding rules split the work so that each boundary is reported by only one rule, and `no-extra-empty-lines` handles excess blank lines. Together they give a consistent vertical rhythm that a formatter does not enforce.

## React rules

### `taito/no-function-deps-in-effect`

Disallows functions in `useEffect` dependency arrays. A changed function reference rarely reflects the intent of an effect. Read the latest callback with `useEffectEvent`, or move the logic. The rule recognizes local functions, function-typed props and parameters, and the known callable outputs of `react-hook-form` (`useForm`, `useFormContext`), Apollo `useMutation` and AI SDK `useChat`.

```tsx
useEffect(() => {
  onChange(value);
}, [value, onChange]); // ✗ onChange
```

### `taito/padding-between-jsx-siblings`

Requires a blank line after multiline JSX children (elements, fragments and expression containers). Elements that contain text are left alone.

## Lingui rules

### `taito/no-module-scope-trans`

Disallows `<Trans>` from `@lingui/react/macro` outside a function. Module-scope elements are created once at import time, before the active locale is known.

## Panda CSS rules

### `taito/no-pointer-cursor`

Disallows `cursor: 'pointer'` inside Panda `css`, `cva`, `sva` and `styled` calls. Only links show a pointer cursor. Buttons and other controls keep the default cursor.

### `taito/panda-style-conventions`

- Reference tokens with Panda syntax (`{colors.text}`, `token.var(...)`), not generated CSS variables (`var(--colors-text)`).
- Use the `$truncate: true` utility instead of `textOverflow: 'ellipsis'`.
- Do not set `boxSizing: 'border-box'`, because global styles already apply it.
- Remove `calc()` around a single value that has no arithmetic operator.

The first and second checks assume the project defines the `$truncate` utility and a global `border-box` reset, as in the Taito full-stack template.

| Option                | Default                    | Description                                                               |
| --------------------- | -------------------------- | ------------------------------------------------------------------------- |
| `designSystemPattern` | `(^\|/)src/design-system/` | Files that define the design system itself. The utility checks skip them. |

## Opt-in rules

### `taito/lazy-load-dialogs`

Requires components whose name ends in `Dialog` to be lazy-loaded with `loadable(() => import(...))` when they are imported from application modules (`./`, `../`, `@/`, `~/`). Dialogs are not visible at first, so they should stay out of the importing bundle. Tests and stories are ignored.

| Option          | Default                         | Description                                                                                    |
| --------------- | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| `ignorePattern` | `(^\|/)src/components/ui(/\|$)` | Resolved import paths that may be imported statically, such as the UI kit's dialog primitives. |

### `taito/no-redundant-stack`

Reports a `Stack` that lays out at most one child (when it sets only `gap`, `direction` or `wrap`), and Panda `styled()` calls without a style config.

| Option                | Default                        | Description                                                                                                    |
| --------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `stackModules`        | `['@/components/ui/stack']`    | Import specifiers of the project's Stack component. Relative imports that resolve to the same path also match. |
| `styledModulePattern` | `(design\|styled)-system/jsx$` | Import sources that export Panda's `styled`.                                                                   |

### `taito/no-ssr-guards`

Disallows `typeof window === 'undefined'` and `'document' in globalThis` guards for browser globals. Enable it only in client-only (SPA) code that never runs on a server.

### `taito/graphql-no-typename-selection`

Disallows `__typename` in `graphql(...)` documents. Apollo Client adds it to every selection set automatically.

### `taito/no-internal-test-mocks`

Keeps application code real in Vitest tests and limits mocking to the network boundary. In files that import `vitest`, it reports:

- `vi.mock`, `vi.spyOn`, mock implementations, `Object.assign` and assignments that replace internal modules (`./`, `../`, `@/`, `~/`);
- mocks of database and framework packages that should stay real;
- `fetch`/`XMLHttpRequest`/`WebSocket` stubs and network client mocks: client tests should rely on API or end-to-end tests, and server tests should use MSW;
- alternative HTTP mocking libraries (`nock`, `fetch-mock`, ...), and MSW or Apollo `MockedProvider` in client code;
- mocks of any external module in server integration tests.

| Option                   | Default                                             | Description                                                                           |
| ------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `boundary`               | `'application'`                                     | `'client'` or `'server'`. Selects the guidance and the built-in real-dependency list. |
| `networkPackages`        | `[]`                                                | Extra packages treated as network clients.                                            |
| `realDependencies`       | `[]`                                                | Extra packages that must never be mocked.                                             |
| `integrationTestPattern` | `\.test\.(?:integration\|(?:rest\|graphql)\.api)\.` | Server test files in which no external module may be mocked.                          |

```ts
rules: {
  'taito/no-internal-test-mocks': ['error', { boundary: 'server', realDependencies: ['unpdf'] }],
}
```

### `taito/helpers-after-main`

In test files (`*.test.*`), helper function declarations must come after the tests, under a `// Helpers` comment. In service and DAO files, private helpers must come after the exported `xService`/`xDao` object. The file then reads top-down from the public behavior.

| Option               | Default                         | Description                                   |
| -------------------- | ------------------------------- | --------------------------------------------- |
| `serviceFilePattern` | `\.(service\|dao)\.[cm]?[jt]s$` | Basename pattern for service and DAO modules. |

### `taito/graphql-mutation-returns-entity`

In `*.resolver.ts` files, Pothos `builder.mutationField(s)` must return the changed entity, not a scalar (`Boolean`, `String`, `Int`, `Float`), so that the client cache updates without a refetch. Deletions return the deleted `ID`.

### `taito/graphql-no-description`

Disallows `description` options in Pothos schema builders (`builder.*`, field builders, enum values). Use it only for internal APIs, where code comments are the better place for documentation. Fixable.
