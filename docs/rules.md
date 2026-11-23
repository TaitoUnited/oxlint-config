# Custom rules

All custom rules live in the `taito` JS plugin that ships with this package. Every preset that uses one of them registers the plugin for you, so rule IDs are always `taito/<rule>`.

- **Preset** says which preset enables the rule. _Opt-in_ rules are not enabled by any preset because they depend on a project's architecture or libraries. Enable them yourself (see [Enabling opt-in rules](#enabling-opt-in-rules)).
- **Fix** marks rules that `oxlint --fix` can fix automatically.

| Rule                                                                                                             | Preset | Fix |
| ---------------------------------------------------------------------------------------------------------------- | ------ | --- |
| [`no-chained-type-assertions`](#taitono-chained-type-assertions)                                                 | base   |     |
| [`readability-padding-no-extra-empty-lines`](#taitoreadability-padding-no-extra-empty-lines)                     | base   | ✓   |
| [`no-object-parameters`](#taitono-object-parameters)                                                             | base   |     |
| [`no-positional-func-args`](#taitono-positional-func-args)                                                       | base   |     |
| [`no-redundant-calc`](#taitono-redundant-calc)                                                                   | base   |     |
| [`readability-padding-around-control-flow`](#taitoreadability-padding-around-control-flow)                       | base   | ✓   |
| [`readability-padding-around-function`](#taitoreadability-padding-around-function)                               | base   | ✓   |
| [`readability-padding-around-multiline-statement`](#taitoreadability-padding-around-multiline-statement)         | base   | ✓   |
| [`readability-padding-around-multiline-variable`](#taitoreadability-padding-around-multiline-variable)           | base   | ✓   |
| [`readability-padding-between-top-level-declarations`](#taitoreadability-padding-between-top-level-declarations) | base   | ✓   |
| [`react-no-function-deps-in-effect`](#taitoreact-no-function-deps-in-effect)                                     | react  |     |
| [`readability-padding-between-jsx-siblings`](#taitoreadability-padding-between-jsx-siblings)                     | react  | ✓   |
| [`lingui-no-module-scope-trans`](#taitolingui-no-module-scope-trans)                                             | lingui |     |
| [`panda-no-pointer-cursor`](#taitopanda-no-pointer-cursor)                                                       | panda  |     |
| [`panda-no-token-css-variables`](#taitopanda-no-token-css-variables)                                             | panda  |     |
| [`panda-no-border-box`](#taitopanda-no-border-box)                                                               | panda  |     |
| [`panda-prefer-combined-properties`](#taitopanda-prefer-combined-properties)                                     | panda  | ✓   |
| [`panda-prefer-text-style`](#taitopanda-prefer-text-style)                                                       | panda  |     |
| [`react-lazy-load-dialogs`](#taitoreact-lazy-load-dialogs)                                                       | opt-in |     |
| [`react-no-redundant-stack`](#taitoreact-no-redundant-stack)                                                     | opt-in |     |
| [`no-ssr-guards`](#taitono-ssr-guards)                                                                           | opt-in |     |
| [`graphql-no-typename-selection`](#taitographql-no-typename-selection)                                           | opt-in |     |
| [`no-internal-test-mocks`](#taitono-internal-test-mocks)                                                         | opt-in |     |
| [`helpers-after-main`](#taitohelpers-after-main)                                                                 | opt-in |     |
| [`graphql-mutation-returns-entity`](#taitographql-mutation-returns-entity)                                       | opt-in |     |
| [`graphql-no-description`](#taitographql-no-description)                                                         | opt-in | ✓   |

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
    'taito/react-no-redundant-stack': [
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

### `taito/readability-padding-no-extra-empty-lines`

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

### `taito/no-redundant-calc`

Disallows `calc()` around a single value that has no arithmetic operator, such as `calc(var(--panel-width))` or `calc(-1px)`. It checks every string and template literal, so it covers inline styles, CSS-in-JS libraries and CSS strings as well as Panda styles.

### `taito/readability-padding-around-control-flow`

Requires exactly one blank line before and after multiline `if`, `for`, `while`, `do`, `switch` and `try` statements.

### `taito/readability-padding-around-function`

Requires exactly one blank line around function declarations, class methods and object methods. Overload signatures stay together.

### `taito/readability-padding-around-multiline-statement`

Requires exactly one blank line around other multiline statements, such as a function call spread over several lines.

### `taito/readability-padding-around-multiline-variable`

Requires exactly one blank line next to multiline variable declarations.

### `taito/readability-padding-between-top-level-declarations`

Requires a blank line between top-level declarations. Consecutive single-line `const` or `type` declarations may stay grouped.

The `readability-padding-*` rules split the work so that each boundary is reported by only one rule, and `readability-padding-no-extra-empty-lines` handles excess blank lines. Together they give a consistent vertical rhythm that a formatter does not enforce.

## React rules

### `taito/react-no-function-deps-in-effect`

Disallows functions in `useEffect` dependency arrays. A changed function reference rarely reflects the intent of an effect. Read the latest callback with `useEffectEvent`, or move the logic. The rule recognizes local functions, function-typed props and parameters, and the known callable outputs of `react-hook-form` (`useForm`, `useFormContext`), Apollo `useMutation` and AI SDK `useChat`.

```tsx
useEffect(() => {
  onChange(value);
}, [value, onChange]); // ✗ onChange
```

### `taito/readability-padding-between-jsx-siblings`

Requires a blank line after multiline JSX children (elements, fragments and expression containers). Elements that contain text are left alone.

## Lingui rules

### `taito/lingui-no-module-scope-trans`

Disallows `<Trans>` from `@lingui/react/macro` outside a function. Module-scope elements are created once at import time, before the active locale is known.

## Panda CSS rules

### `taito/panda-no-pointer-cursor`

Disallows `cursor: 'pointer'` inside Panda `css`, `cva`, `sva` and `styled` calls. Only links show a pointer cursor. Buttons and other controls keep the default cursor.

### `taito/panda-no-token-css-variables`

Disallows Panda's generated token CSS variables (`var(--colors-text)`, `var(--spacing-md)`) in strings. Reference tokens with Panda syntax (`{colors.text}`) or `token.var('colors.text')`, so that renamed or removed tokens fail the Panda build.

### `taito/panda-no-border-box`

Disallows `boxSizing: 'border-box'` inside Panda `css`, `cva`, `sva` and `styled` calls. It assumes a global `border-box` reset, as in the Taito full-stack template.

| Option                | Default                    | Description                                                                        |
| --------------------- | -------------------------- | ---------------------------------------------------------------------------------- |
| `designSystemPattern` | `(^\|/)src/design-system/` | Files that define the design system itself, such as the global reset. Not checked. |

### `taito/panda-prefer-combined-properties`

Requires one combined property when per-side properties in the same Panda style object have the same value. Fixable.

| Properties with the same value                                                          | Combined into                           |
| --------------------------------------------------------------------------------------- | --------------------------------------- |
| `width` and `height` (`w`, `h`)                                                         | `boxSize`                               |
| `paddingTop` and `paddingBottom` (`pt`, `pb`, `paddingBlockStart`, `paddingBlockEnd`)   | `paddingBlock`                          |
| `paddingLeft` and `paddingRight` (`pl`, `pr`, `paddingInlineStart`, `paddingInlineEnd`) | `paddingInline`                         |
| All four `padding*` sides                                                               | `padding`                               |
| The same for `margin*`                                                                  | `marginBlock`, `marginInline`, `margin` |

```ts
// Before
const icon = css({
  width: '10px',
  height: '10px',
  paddingTop: '$md',
  paddingBottom: '$md',
});

// After
const icon = css({ boxSize: '10px', paddingBlock: '$md' });
```

Only literal strings, numbers and tokens such as `'{sizes.4}'` are compared. The rule skips objects that contain a spread, values that are variables or responsive objects, and properties whose sides another property in the object also sets (for example `padding` together with `paddingTop` and `paddingBottom`), because combining them could change which value wins.

### `taito/panda-prefer-text-style`

Disallows `fontSize` in Panda styles. Use a [`textStyle`](https://panda-css.com/docs/theming/text-styles) instead, so that text follows the project's typography scale. Values relative to the surrounding text (`inherit`, `0.9em`, `90%`, `smaller`) are allowed.

| Option                | Default                    | Description                                                                                        |
| --------------------- | -------------------------- | -------------------------------------------------------------------------------------------------- |
| `properties`          | `['fontSize']`             | Typography properties to report. Add `lineHeight`, `fontWeight` or `letterSpacing` to be stricter. |
| `designSystemPattern` | `(^\|/)src/design-system/` | Files that define the design system itself, such as the text styles. Not checked.                  |

## Opt-in rules

### `taito/react-lazy-load-dialogs`

Requires components whose name ends in `Dialog` to be lazy-loaded with [`loadable`](https://loadable-components.com) or React [`lazy`](https://react.dev/reference/react/lazy) when they are imported from application modules (`./`, `../`, `@/`, `~/`). Dialogs are not visible at first, so they should stay out of the importing bundle. Tests and stories are ignored.

The rule reports static imports. The `loader` option only selects which API the message suggests:

```ts
// loader: 'loadable' (default)
const EditDialog = loadable(() =>
  import('./edit-dialog').then(mod => mod.EditDialog)
);

// loader: 'lazy'. Render the dialog inside <Suspense>.
const EditDialog = lazy(() =>
  import('./edit-dialog').then(mod => ({ default: mod.EditDialog }))
);
```

With `lazy`, preload a dialog on user interaction by calling the same `import()` early, for example on hover.

| Option          | Default                         | Description                                                                                    |
| --------------- | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| `ignorePattern` | `(^\|/)src/components/ui(/\|$)` | Resolved import paths that may be imported statically, such as the UI kit's dialog primitives. |
| `loader`        | `'loadable'`                    | `'loadable'` or `'lazy'`: the lazy-loading API that the messages suggest.                      |

### `taito/react-no-redundant-stack`

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
