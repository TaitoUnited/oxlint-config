# Rule ideas

Candidate rules that are not implemented yet. They came from reviewing how a Taito project (Fluxio) uses Panda CSS. Each idea notes what it would check, why, and what makes it tricky. Pick one up by following [Adding a rule](../CONTRIBUTING.md#adding-a-rule), and remove it from this list in the same change.

## Panda CSS

### `panda-no-raw-colors`

Disallow hex (`'#fff'`), `rgb()`/`rgba()`/`hsl()` and named colors (`'white'`) in Panda styles, and require color tokens instead.

- **Why:** colors outside the token set do not follow theme changes or dark mode, and they drift from the design. In Fluxio, `rgba(0, 0, 0, 0.025)` and `color: 'white'` appear in shared UI components.
- **Design notes:**
  - Skip design-system files with a `designSystemPattern` option, like `panda-no-border-box`, because that is where the tokens are defined.
  - Colors inside composite values such as `boxShadow` or gradients are harder to judge. Start with color properties only (`color`, `backgroundColor`, `borderColor`, `fill`, `stroke`, `outlineColor`) and consider composite values later.
  - Allow `transparent` and `currentColor`.

### `panda-no-raw-transition-values`

Require duration and easing tokens in `transition`, `transitionDuration`, `transitionTimingFunction`, `animationDuration` and `animationTimingFunction`.

- **Why:** consistent motion comes from shared durations (`$fast`, `$regular`) and easings (`$out`). Fluxio has these tokens, but some components still hard-code values such as `'opacity 200ms, transform 300ms'` and `'max-height 0.3s ease'`.
- **Design notes:**
  - The `transition` shorthand mixes properties, durations and easings in one string. Report only time values (`200ms`, `0.3s`) and CSS easing keywords or `cubic-bezier()` in it.
  - Allow `'none'` and `0s`.

### `panda-no-raw-spacing`

Require spacing tokens instead of `px`, `rem` or numeric values in `padding*`, `margin*`, `gap`, `rowGap`, `columnGap` and `inset*`.

- **Why:** spacing tokens keep layouts on a shared scale. Fluxio uses tokens in about 95% of cases (557 against 24).
- **Design notes:**
  - Most remaining raw values are small nudges below the smallest token, such as `'2px'` or `'6px'`, so the rule needs an `allow` option (for example `0`, `'1px'`, `'2px'`), or it should report only values that equal an existing token.
  - Knowing a project's token values would need configuration, because JS plugins cannot read the Panda config.

### `panda-no-important`

Disallow `!important` in Panda style values.

- **Why:** `!important` makes styles hard to override and usually works around a missing option. In Fluxio, most of the 28 uses are `textBoxTrim: 'none !important'`, which overrides trimming in a shared `Text` component. A prop on that component would remove the need for them.
- **Design notes:** probably a warning, not an error, with an `allowProperties` option for known exceptions.

### `panda-no-raw-z-index`

Require z-index tokens instead of numbers such as `1000` or `40`.

- **Why:** magic numbers lead to stacking conflicts between dialogs, popovers and toasts. Fluxio uses `1000`/`1001` for dialogs and `100`, `40` and `20` elsewhere.
- **Design notes:**
  - Projects must first define z-index tokens (Panda supports `zIndex` tokens), so the rule should be opt-in.
  - Allow small local values such as `-1`, `0` and `1`, which only order siblings inside one component.

## Considered and rejected

- **Prefer the `Stack` component over `display: 'flex', flexDirection: 'column'`.** Most flex-column styles also set other layout properties, so the rule would be noisy. Not every project has a `Stack` component.
- **Prefer `_hover` and other conditions over `'&:hover'` selectors.** Both work. Fluxio consistently uses raw selectors, so there was no inconsistency to fix.
- **Disallow inline `style={{ ... }}` props.** Nearly all inline styles in Fluxio pass runtime values, which is the right use for them.
