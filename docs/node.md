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

Orders a file top-down from its public behavior. Function declarations are hoisted, so helpers can come last:

- In test files, helper function declarations come after the tests.
- In modules with a main export, such as services, private helpers come after that export. The main export is an exported object (`export const userService = { ... }`) or class (`export class UserService`) whose name matches `mainExportPattern`. Functions listed as members of the object are public and may come before it.

The defaults follow the Taito full-stack template (`*.service.ts` and `*.dao.ts` files exporting `xService` or `xDao`). Configure the options for other layouts, for example repositories:

```ts
'taito/helpers-after-main': [
  'error',
  {
    moduleFilePattern: String.raw`\.(service|repository)\.ts$`,
    mainExportPattern: String.raw`(Service|Repository)$`,
  },
],
```

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

| Option              | Default                         | Description                                                                                              |
| ------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `testFilePattern`   | `\.(test\|spec)\.[^/]+$`        | File path pattern for test files. To also cover test folders, use `\.(test\|spec)\.[^/]+$\|/__tests__/`. |
| `moduleFilePattern` | `\.(service\|dao)\.[cm]?[jt]s$` | File path pattern for modules with a main export.                                                        |
| `mainExportPattern` | `(Service\|Dao)$`               | Name pattern for the main exported object or class.                                                      |
