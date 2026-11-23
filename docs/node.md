# Node.js preset

`@taito/oxlint-config/node` is for servers, workers and scripts that run on Node.js. It sets the `node` environment and enables Oxlint's `node` plugin.

```ts
import base from '@taito/oxlint-config';
import node from '@taito/oxlint-config/node';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base, node],
  env: { ...base.env, ...node.env },
});
```

## Built-in rules

- **Configuration:** `node/no-process-env` keeps `process.env` reads in one config module.
- **Blocking I/O:** `node/no-sync` disallows synchronous `fs` and `child_process` calls.
- **Modules:** no `require()` outside the top level, no `new require()`, no `exports = ...` and consistent `module.exports` style.
- **Paths and callbacks:** no string concatenation with `__dirname`/`__filename`, and Node-style callbacks must handle `err` and return.
- `node/no-top-level-await`.

See [`configs/node.js`](../configs/node.js) for the full list.

## Opt-in rules

These rules follow the server conventions of the [Taito full-stack template](https://github.com/TaitoUnited/full-stack-template). Enable them yourself:

```ts
rules: {
  'taito/helpers-after-main': 'error',
}
```

### `taito/helpers-after-main`

Orders a file top-down from its public behavior:

- In test files (`*.test.*`), helper function declarations come after the tests.
- In service and DAO files (`*.service.ts`, `*.dao.ts`), private helpers come after the exported `xService` or `xDao` object.

<!-- filename: src/user/user.service.ts -->

**Bad**

```ts
async function assertUniqueEmail(email: string) {
  if (await userDao.findByEmail(email)) {
    throw new Error('Email is already in use');
  }
}

export const userService = {
  async createUser(input: CreateUserInput) {
    await assertUniqueEmail(input.email);

    return userDao.insert(input);
  },
};
```

**Good**

```ts
export const userService = {
  async createUser(input: CreateUserInput) {
    await assertUniqueEmail(input.email);

    return userDao.insert(input);
  },
};

async function assertUniqueEmail(email: string) {
  if (await userDao.findByEmail(email)) {
    throw new Error('Email is already in use');
  }
}
```

| Option               | Default                         | Description                                   |
| -------------------- | ------------------------------- | --------------------------------------------- |
| `serviceFilePattern` | `\.(service\|dao)\.[cm]?[jt]s$` | Basename pattern for service and DAO modules. |
