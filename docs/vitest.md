# Vitest preset

`@taito/oxlint-config/vitest` is for projects tested with [Vitest](https://vitest.dev). It enables Oxlint's `vitest` plugin.

```ts
import base from '@taito/oxlint-config';
import vitest from '@taito/oxlint-config/vitest';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base, vitest],
  env: base.env,
});
```

## Built-in rules

- **No leftovers:** no focused (`.only`), disabled (`.skip`) or commented-out tests.
- **Meaningful tests:** every test asserts something, with no conditional `expect` calls, no conditional tests and no standalone `expect` outside a test.
- **Valid API use:** valid `describe` callbacks, titles and `expect` calls, awaited `expect.poll`, and `vi.hoisted`/`vi.mock` at the top of the file.
- **Clearer assertions:** `toBe` for primitives, messages for `toThrow`, and type parameters for `vi.fn()`.

See [`configs/vitest.js`](../configs/vitest.js) for the full list.

## Opt-in rules

Enable this rule for the test files of a client or a server:

```ts
overrides: [
  {
    files: ['src/**/*.test.ts'],
    rules: {
      'taito/no-internal-test-mocks': ['error', { boundary: 'server' }],
    },
  },
],
```

### `taito/no-internal-test-mocks`

Keeps application code real in tests and limits mocking to the network boundary. In files that import `vitest`, it reports:

- `vi.mock`, `vi.spyOn`, mock implementations, `Object.assign` and assignments that replace internal modules (`./`, `../`, `@/`, `~/`);
- mocks of database and framework packages that should stay real;
- `fetch`, `XMLHttpRequest` and `WebSocket` stubs, and network client mocks. Client tests should rely on API or end-to-end tests, and server tests should use [MSW](https://mswjs.io);
- other HTTP mocking libraries (`nock`, `fetch-mock`, ...), and MSW or Apollo `MockedProvider` in client code;
- mocks of any external module in server integration tests.

<!-- filename: src/user/user.test.ts -->

**Bad**

```ts
import { expect, it, vi } from 'vitest';

import { userDao } from './user.dao';
import { userService } from './user.service';

vi.mock('./user.dao');

it('creates a user', async () => {
  vi.mocked(userDao.insert).mockResolvedValue({ id: '1', name: 'Ada' });

  expect(await userService.createUser({ name: 'Ada' })).toEqual({
    id: '1',
    name: 'Ada',
  });
});
```

**Good**

```ts
import { expect, it } from 'vitest';

import { userService } from './user.service';

it('creates a user', async () => {
  const user = await userService.createUser({ name: 'Ada' });

  expect(user.name).toBe('Ada');
});
```

| Option                   | Default                                             | Description                                                                           |
| ------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `boundary`               | `'application'`                                     | `'client'` or `'server'`. Selects the guidance and the built-in real-dependency list. |
| `networkPackages`        | `[]`                                                | Extra packages treated as network clients.                                            |
| `realDependencies`       | `[]`                                                | Extra packages that must never be mocked.                                             |
| `integrationTestPattern` | `\.test\.(?:integration\|(?:rest\|graphql)\.api)\.` | Server test files in which no external module may be mocked.                          |
