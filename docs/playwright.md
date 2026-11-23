# Playwright preset

`@taito/oxlint-config/playwright` is for [Playwright](https://playwright.dev) end-to-end test packages. It sets the `node` environment and enables [`eslint-plugin-playwright`](https://github.com/mskelton/eslint-plugin-playwright).

```ts
import base from '@taito/oxlint-config';
import playwright from '@taito/oxlint-config/playwright';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base, playwright],
  env: { ...base.env, ...playwright.env },
});
```

## Built-in rules

Errors:

- **Missing awaits:** missing `await` on Playwright actions and assertions.
- **Flaky waits:** `networkidle` waits, and non-web-first assertions where a web-first one retries (`prefer-web-first-assertions`).
- **Leftovers:** focused tests.
- **Valid API use:** valid `describe` callbacks, titles and `expect` calls, and no `expect` outside a test.
- **No reloads:** `page.reload()` and other `reload` calls. Assert that the current page updates instead.

Warnings:

- **Flaky patterns:** `waitForTimeout`, `waitForSelector`, element handles, `force: true` and conditionals in tests.
- **Leftovers:** skipped tests and `page.pause()`.
- **Redundant code:** useless `await` and `.not`, and deeply nested `describe` blocks.

See [`configs/playwright.js`](../configs/playwright.js) for the full list. The preset has no custom rules.
