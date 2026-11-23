# Lingui preset

`@taito/oxlint-config/lingui` is for React apps localized with [Lingui](https://lingui.dev). Extend it **after** the [React preset](react.md), because it repeats and extends that preset's `no-restricted-imports` entries.

```ts
import base from '@taito/oxlint-config';
import lingui from '@taito/oxlint-config/lingui';
import react from '@taito/oxlint-config/react';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base, react, lingui],
  env: { ...base.env, ...react.env },
});
```

## Built-in rules

- **Macros only:** `Trans` and `useLingui` must be imported from `@lingui/react/macro`, not from the `@lingui/react` runtime.
- **Translatable messages:** no expressions inside messages, no messages that are only a variable or a single tag, and no `<Trans>` inside `<Trans>`.
- **Locale-aware calls:** `t` must be called inside a function, after the locale is active.

See [`configs/lingui.js`](../configs/lingui.js) for the full list.

## Custom rules

| Rule                                                                 | Fix |
| -------------------------------------------------------------------- | --- |
| [`lingui-no-module-scope-trans`](#taitolingui-no-module-scope-trans) |     |

### `taito/lingui-no-module-scope-trans`

Disallows `<Trans>` from `@lingui/react/macro` outside a function. Module-scope elements are created once at import time, before the active locale is known, so they never change language.

**Bad**

```tsx
import { Trans } from '@lingui/react/macro';

const emptyState = <Trans>No projects yet</Trans>;

export function ProjectList({ projects }: { projects: Project[] }) {
  return projects.length === 0 ? emptyState : <List items={projects} />;
}
```

**Good**

```tsx
import { Trans } from '@lingui/react/macro';

export function ProjectList({ projects }: { projects: Project[] }) {
  return projects.length === 0 ? (
    <Trans>No projects yet</Trans>
  ) : (
    <List items={projects} />
  );
}
```
