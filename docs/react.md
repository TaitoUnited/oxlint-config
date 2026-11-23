# React preset

`@taito/oxlint-config/react` is for React apps that use [React Compiler](https://react.dev/learn/react-compiler). It sets the `browser` environment and enables Oxlint's `react` and `jsx-a11y` plugins together with [ESLint React](https://eslint-react.xyz) (`react-x`, `react-jsx`, `react-dom`, `react-web-api` and `react-naming-convention`).

```ts
import base from '@taito/oxlint-config';
import react from '@taito/oxlint-config/react';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base, react],
  env: { ...base.env, ...react.env },
});
```

> [!WARNING]
> The preset does not work with TypeScript 7 yet, because ESLint React depends on `@typescript-eslint`, which supports TypeScript 6.0 at most. Keep React projects on TypeScript 6 for now.

## Built-in rules

- **React Compiler:** no manual memoization. `useCallback`, `useMemo` and `memo` are restricted (also as `React.*`), and the compiler rules (`purity`, `immutability`, `refs`, `set-state-in-render`, `static-components`, ...) are on.
- **Hooks and effects:** rules of hooks, no state set in effects, and no derived state in effects. `exhaustive-deps` is off, because the compiler handles dependencies and [`taito/react-no-function-deps-in-effect`](#taitoreact-no-function-deps-in-effect) covers the common mistake.
- **Modern APIs:** no `forwardRef`, `<Context.Provider>`, `useContext`, `createRef` or legacy lifecycle methods.
- **Leaks:** event listeners, intervals, timeouts and resize observers must be cleaned up.
- **Accessibility:** most `jsx-a11y` rules, including alt text, valid ARIA, keyboard support for click handlers and labels for form controls.
- **Safety:** no `dangerouslySetInnerHTML`, `javascript:` URLs, unsafe `target="_blank"` or unsandboxed iframes.

See [`configs/react.js`](../configs/react.js) for the full list. To add your own `no-restricted-imports` entries without losing the preset's, see [Customizing](../README.md#customizing).

## Custom rules

| Rule                                                                                         | Fix |
| -------------------------------------------------------------------------------------------- | --- |
| [`react-no-function-deps-in-effect`](#taitoreact-no-function-deps-in-effect)                 |     |
| [`readability-padding-between-jsx-siblings`](#taitoreadability-padding-between-jsx-siblings) | ✓   |

### `taito/react-no-function-deps-in-effect`

Disallows functions in `useEffect` dependency arrays. A new function reference on every render rarely reflects what the effect depends on, and it makes the effect run too often. Read the latest callback with `useEffectEvent`, or move the logic into the effect. The rule recognizes local functions, function-typed props and parameters, and the known callable outputs of `react-hook-form` (`useForm`, `useFormContext`), Apollo `useMutation` and AI SDK `useChat`.

**Bad**

```tsx
import { useEffect } from 'react';

export function SearchField({
  query,
  onSearch,
}: {
  query: string;
  onSearch: (query: string) => void;
}) {
  useEffect(() => {
    onSearch(query);
  }, [query, onSearch]);

  return <input value={query} readOnly />;
}
```

**Good**

```tsx
import { useEffect, useEffectEvent } from 'react';

export function SearchField({
  query,
  onSearch,
}: {
  query: string;
  onSearch: (query: string) => void;
}) {
  const search = useEffectEvent(onSearch);

  useEffect(() => {
    search(query);
  }, [query]);

  return <input value={query} readOnly />;
}
```

### `taito/readability-padding-between-jsx-siblings`

Requires a blank line after multiline JSX children (elements, fragments and expression containers), so that the structure of a component reads in blocks. Elements that contain text are left alone. Fixable.

**Bad**

```tsx
export const profile = (
  <article>
    <header>
      <h2>Ada Lovelace</h2>
    </header>
    <p>Mathematician</p>
  </article>
);
```

**Good**

```tsx
export const profile = (
  <article>
    <header>
      <h2>Ada Lovelace</h2>
    </header>

    <p>Mathematician</p>
  </article>
);
```

## Opt-in rules

These rules depend on a project's libraries or rendering setup. Enable them yourself:

```ts
rules: {
  'taito/no-ssr-guards': 'error',
  'taito/react-lazy-load-dialogs': ['error', { loader: 'lazy' }],
  'taito/react-no-redundant-stack': ['error', { stackModules: ['~/components/stack'] }],
}
```

### `taito/react-lazy-load-dialogs`

Requires components whose name ends in `Dialog` to be lazy-loaded with [`loadable`](https://loadable-components.com) or React [`lazy`](https://react.dev/reference/react/lazy) when they are imported from application modules (`./`, `../`, `@/`, `~/`). Dialogs are not visible at first, so they should stay out of the importing bundle. Preload a dialog on user interaction, for example on hover. Tests and stories are ignored.

<!-- filename: src/features/user/user-page.tsx -->

**Bad**

```tsx
import { EditUserDialog } from './edit-user-dialog';

export function UserPage() {
  return <EditUserDialog />;
}
```

**Good**

```tsx
import loadable from '@loadable/component';

const EditUserDialog = loadable(() =>
  import('./edit-user-dialog').then(mod => mod.EditUserDialog)
);

export function UserPage() {
  return <EditUserDialog />;
}
```

With `loader: 'lazy'`, the rule suggests React `lazy` instead. Render the dialog inside `<Suspense>`, and preload it by calling the same `import()` early:

```tsx
const EditUserDialog = lazy(() =>
  import('./edit-user-dialog').then(mod => ({ default: mod.EditUserDialog }))
);
```

| Option          | Default                         | Description                                                                                    |
| --------------- | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| `ignorePattern` | `(^\|/)src/components/ui(/\|$)` | Resolved import paths that may be imported statically, such as the UI kit's dialog primitives. |
| `loader`        | `'loadable'`                    | `'loadable'` or `'lazy'`: the lazy-loading API that the messages suggest.                      |

### `taito/react-no-redundant-stack`

Reports a `Stack` component that lays out at most one child when it sets only `gap`, `direction` or `wrap`, because there is nothing to stack. It also reports Panda `styled()` calls without a style config.

**Bad**

```tsx
import { Stack } from '@/components/ui/stack';

export const field = (
  <Stack gap="2">
    <input name="email" />
  </Stack>
);
```

**Good**

```tsx
import { Stack } from '@/components/ui/stack';

export const field = (
  <Stack gap="2">
    <label htmlFor="email">Email</label>
    <input id="email" name="email" />
  </Stack>
);
```

| Option                | Default                        | Description                                                                                                    |
| --------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `stackModules`        | `['@/components/ui/stack']`    | Import specifiers of the project's Stack component. Relative imports that resolve to the same path also match. |
| `styledModulePattern` | `(design\|styled)-system/jsx$` | Import sources that export Panda's `styled`.                                                                   |

### `taito/no-ssr-guards`

Disallows `typeof window === 'undefined'` and `'document' in globalThis` guards for browser globals. Enable it only in client-only (SPA) code that never runs on a server, where such guards are dead code.

**Bad**

```ts
export function getViewportWidth() {
  return typeof window === 'undefined' ? 0 : window.innerWidth;
}
```

**Good**

```ts
export function getViewportWidth() {
  return window.innerWidth;
}
```
