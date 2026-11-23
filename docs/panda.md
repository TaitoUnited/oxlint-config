# Panda CSS preset

`@taito/oxlint-config/panda` is for projects styled with [Panda CSS](https://panda-css.com). It only enables custom rules, which check the objects passed to Panda's `css`, `cva`, `sva` and `styled` functions.

```ts
import base from '@taito/oxlint-config';
import panda from '@taito/oxlint-config/panda';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base, panda],
  env: base.env,
  ignorePatterns: ['styled-system'],
});
```

Some rules skip the files that define the design system itself (`src/design-system/` by default). Change the location with their `designSystemPattern` option.

## Custom rules

| Rule                                                                         | Fix |
| ---------------------------------------------------------------------------- | --- |
| [`panda-no-border-box`](#taitopanda-no-border-box)                           |     |
| [`panda-no-pointer-cursor`](#taitopanda-no-pointer-cursor)                   |     |
| [`panda-no-token-css-variables`](#taitopanda-no-token-css-variables)         |     |
| [`panda-prefer-combined-properties`](#taitopanda-prefer-combined-properties) | ✓   |
| [`panda-prefer-text-style`](#taitopanda-prefer-text-style)                   |     |

### `taito/panda-no-border-box`

Disallows `boxSizing: 'border-box'` in Panda styles, because a global reset already applies it to every element, as in the Taito full-stack template.

**Bad**

```ts
import { css } from 'styled-system/css';

export const card = css({
  boxSizing: 'border-box',
  padding: '4',
});
```

**Good**

```ts
import { css } from 'styled-system/css';

export const card = css({
  padding: '4',
});
```

| Option                | Default                    | Description                                                                        |
| --------------------- | -------------------------- | ---------------------------------------------------------------------------------- |
| `designSystemPattern` | `(^\|/)src/design-system/` | Files that define the design system itself, such as the global reset. Not checked. |

### `taito/panda-no-pointer-cursor`

Disallows `cursor: 'pointer'` in Panda styles. Only links show a pointer cursor. Buttons and other controls keep the default cursor.

**Bad**

```ts
import { css } from 'styled-system/css';

export const button = css({
  cursor: 'pointer',
  paddingInline: '4',
});
```

**Good**

```ts
import { css } from 'styled-system/css';

export const button = css({
  paddingInline: '4',
});
```

### `taito/panda-no-token-css-variables`

Disallows Panda's generated token CSS variables, such as `var(--colors-text)` or `var(--spacing-md)`, in strings. Reference tokens with Panda syntax (`{colors.text}`) or `token.var('colors.text')`, so that a renamed or removed token fails the Panda build instead of silently producing an unset variable.

**Bad**

```ts
import { css } from 'styled-system/css';

export const card = css({
  boxShadow: '0 0 0 1px var(--colors-border)',
});
```

**Good**

```ts
import { css } from 'styled-system/css';

export const card = css({
  boxShadow: '0 0 0 1px {colors.border}',
});
```

### `taito/panda-prefer-combined-properties`

Requires one combined property when per-side properties in the same Panda style object have the same value. Fixable.

| Properties with the same value                                                          | Combined into                           |
| --------------------------------------------------------------------------------------- | --------------------------------------- |
| `width` and `height` (`w`, `h`)                                                         | `boxSize`                               |
| `paddingTop` and `paddingBottom` (`pt`, `pb`, `paddingBlockStart`, `paddingBlockEnd`)   | `paddingBlock`                          |
| `paddingLeft` and `paddingRight` (`pl`, `pr`, `paddingInlineStart`, `paddingInlineEnd`) | `paddingInline`                         |
| All four `padding*` sides                                                               | `padding`                               |
| The same for `margin*`                                                                  | `marginBlock`, `marginInline`, `margin` |

Only literal strings, numbers and tokens such as `'{sizes.4}'` are compared. The rule skips objects that contain a spread, values that are variables or responsive objects, and properties whose sides another property in the object also sets (for example `padding` together with `paddingTop` and `paddingBottom`), because combining them could change which value wins.

**Bad**

```ts
import { css } from 'styled-system/css';

export const avatar = css({
  width: '10',
  height: '10',
  paddingTop: '2',
  paddingBottom: '2',
});
```

**Good**

```ts
import { css } from 'styled-system/css';

export const avatar = css({
  boxSize: '10',
  paddingBlock: '2',
});
```

### `taito/panda-prefer-text-style`

Disallows `fontSize` in Panda styles. Use a [`textStyle`](https://panda-css.com/docs/theming/text-styles) instead, so that text follows the project's typography scale. Values relative to the surrounding text (`inherit`, `0.9em`, `90%`, `smaller`) are allowed.

**Bad**

```ts
import { css } from 'styled-system/css';

export const title = css({
  fontSize: '18px',
  fontWeight: 600,
});
```

**Good**

```ts
import { css } from 'styled-system/css';

export const title = css({
  textStyle: 'heading.sm',
});
```

| Option                | Default                    | Description                                                                                        |
| --------------------- | -------------------------- | -------------------------------------------------------------------------------------------------- |
| `properties`          | `['fontSize']`             | Typography properties to report. Add `lineHeight`, `fontWeight` or `letterSpacing` to be stricter. |
| `designSystemPattern` | `(^\|/)src/design-system/` | Files that define the design system itself, such as the text styles. Not checked.                  |
