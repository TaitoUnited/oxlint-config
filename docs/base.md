# Base preset

`@taito/oxlint-config` is the preset for every JavaScript and TypeScript project. Extend it first and add the other presets after it.

```ts
import base from '@taito/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base],
  env: base.env,
});
```

The preset turns on type-aware linting, so install `tsrs` next to `oxlint`.

## Built-in rules

The preset enables every Oxlint `correctness` rule and about 360 more from the `eslint`, `typescript`, `unicorn`, `import`, `oxc` and `promise` plugins. Highlights:

- **Type-aware TypeScript rules:** no floating or misused promises, no unsafe `any` flow, `switch` exhaustiveness, `strict-void-return`, `prefer-nullish-coalescing` and `no-unnecessary-condition`.
- **Consistency:** `type` instead of `interface`, inline `type` imports, function declarations instead of function expressions (`func-style`), and no barrel files.
- **No default exports**, except in tooling config files (`*.config.*`), Storybook files and stories.
- **Unused code:** unused variables, arguments and caught errors may be prefixed with `_`.

See [`configs/base.js`](../configs/base.js) for the full list.

## Custom rules

| Rule                                                                                                             | Fix |
| ---------------------------------------------------------------------------------------------------------------- | --- |
| [`no-chained-type-assertions`](#taitono-chained-type-assertions)                                                 |     |
| [`no-object-parameters`](#taitono-object-parameters)                                                             |     |
| [`no-positional-func-args`](#taitono-positional-func-args)                                                       |     |
| [`no-redundant-calc`](#taitono-redundant-calc)                                                                   |     |
| [`require-disable-reason`](#taitorequire-disable-reason)                                                         |     |
| [`readability-padding-around-control-flow`](#taitoreadability-padding-around-control-flow)                       | ✓   |
| [`readability-padding-around-function`](#taitoreadability-padding-around-function)                               | ✓   |
| [`readability-padding-around-multiline-statement`](#taitoreadability-padding-around-multiline-statement)         | ✓   |
| [`readability-padding-around-multiline-variable`](#taitoreadability-padding-around-multiline-variable)           | ✓   |
| [`readability-padding-between-top-level-declarations`](#taitoreadability-padding-between-top-level-declarations) | ✓   |
| [`readability-padding-no-extra-empty-lines`](#taitoreadability-padding-no-extra-empty-lines)                     | ✓   |

### `taito/no-chained-type-assertions`

Disallows chained assertions such as `value as unknown as Shape`, which skip TypeScript's compatibility check. `as const` chains are allowed.

**Bad**

```ts
const user = response as unknown as User;
```

**Good**

```ts
const user = parseUser(response);
```

### `taito/no-object-parameters`

Disallows the broad `object` type in parameter annotations, including through local type aliases and unions. `object` gives no property contract. Use a concrete type, or `unknown` at a validation boundary. Generic constraints such as `<T extends object>` are allowed.

**Bad**

```ts
export function saveUser(user: object) {
  return database.insert(user);
}
```

**Good**

```ts
export function saveUser(user: { id: string; name: string }) {
  return database.insert(user);
}
```

### `taito/no-positional-func-args`

Function declarations may take at most two positional parameters, and two parameters may not share the same primitive type (`string`, `number`, `boolean`), because call sites can swap them silently. Use a single object parameter instead. Inline callbacks are ignored because they usually implement a third-party signature.

**Bad**

```ts
export function renameFile(from: string, to: string) {
  return fs.rename(from, to);
}
```

**Good**

```ts
export function renameFile({ from, to }: { from: string; to: string }) {
  return fs.rename(from, to);
}
```

### `taito/no-redundant-calc`

Disallows `calc()` around a single value that has no arithmetic operator. It checks every string and template literal, so it covers inline styles, CSS-in-JS libraries and CSS strings as well as Panda styles.

**Bad**

```ts
const panelWidth = 'calc(var(--panel-width))';
```

**Good**

```ts
const panelWidth = 'var(--panel-width)';
const contentWidth = 'calc(100% - var(--panel-width))';
```

### `taito/require-disable-reason`

Requires a reason after `--` in every `oxlint-disable` and `eslint-disable` comment. A disabled rule is an exception to the team's conventions, and the reason tells reviewers and later readers why it is safe. This matches `typescript/ban-ts-comment`, which requires a description for `@ts-expect-error`.

**Bad**

```ts
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const user = response.data as User;
```

**Good**

```ts
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the API schema guarantees this shape
const user = response.data as User;
```

### Readable spacing

The `readability-padding-*` rules add blank lines that a formatter does not enforce, so that a file reads in clear blocks. Each boundary is reported by only one rule, and `readability-padding-no-extra-empty-lines` removes excess blank lines. All of them are fixable.

### `taito/readability-padding-around-control-flow`

Requires exactly one blank line before and after multiline `if`, `for`, `while`, `do`, `switch` and `try` statements.

**Bad**

```ts
export function clamp(value: number) {
  const limit = 10;
  if (value > limit) {
    return limit;
  }
  return value;
}
```

**Good**

```ts
export function clamp(value: number) {
  const limit = 10;

  if (value > limit) {
    return limit;
  }

  return value;
}
```

### `taito/readability-padding-around-function`

Requires exactly one blank line around function declarations, class methods and object methods. Overload signatures stay together.

**Bad**

```ts
export function first() {
  return 1;
}
export function second() {
  return 2;
}
```

**Good**

```ts
export function first() {
  return 1;
}

export function second() {
  return 2;
}
```

### `taito/readability-padding-around-multiline-statement`

Requires exactly one blank line around other multiline statements, such as a function call spread over several lines.

**Bad**

```ts
export function saveUser(user: User) {
  database.insert(user);
  logger.info({
    message: 'User saved',
    userId: user.id,
  });
  return user;
}
```

**Good**

```ts
export function saveUser(user: User) {
  database.insert(user);

  logger.info({
    message: 'User saved',
    userId: user.id,
  });

  return user;
}
```

### `taito/readability-padding-around-multiline-variable`

Requires exactly one blank line next to multiline variable declarations.

**Bad**

```ts
export function createUser(name: string) {
  const id = createId();
  const user = {
    id,
    name,
  };
  return user;
}
```

**Good**

```ts
export function createUser(name: string) {
  const id = createId();

  const user = {
    id,
    name,
  };

  return user;
}
```

### `taito/readability-padding-between-top-level-declarations`

Requires a blank line between top-level declarations. Consecutive single-line declarations of the same kind, such as several `const` or `type` declarations, may stay grouped.

**Bad**

```ts
type UserId = string;
const defaultUserId: UserId = 'anonymous';
```

**Good**

```ts
type UserId = string;

const defaultUserId: UserId = 'anonymous';
const systemUserId: UserId = 'system';
```

### `taito/readability-padding-no-extra-empty-lines`

Disallows more than one consecutive blank line, and blank lines directly inside the start or end of blocks, classes, objects, arrays, type literals and JSX elements.

**Bad**

<!-- prettier-ignore -->
```ts
export function getUser(id: string) {

  return database.find(id);


}
```

**Good**

```ts
export function getUser(id: string) {
  return database.find(id);
}
```
