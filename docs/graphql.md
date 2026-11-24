# GraphQL preset

`@taito/oxlint-config/graphql` is for GraphQL clients that use [Apollo Client](https://www.apollographql.com/docs/react) and servers that build their schema with [Pothos](https://pothos-graphql.dev). It only enables custom rules. The client rule only checks `graphql(...)` documents and the server rules only check Pothos `builder` calls, so the same preset works in both packages.

```ts
import base from '@taito/oxlint-config';
import graphql from '@taito/oxlint-config/graphql';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base, graphql],
  env: base.env,
});
```

`graphql-no-description` assumes an internal API, where code comments document the schema. For a public API, turn it off:

```ts
rules: {
  'taito/graphql-no-description': 'off',
}
```

## Custom rules

| Rule                                                                           | Side   | Fix |
| ------------------------------------------------------------------------------ | ------ | --- |
| [`graphql-no-typename-selection`](#taitographql-no-typename-selection)         | client |     |
| [`graphql-mutation-returns-entity`](#taitographql-mutation-returns-entity)     | server |     |
| [`graphql-no-description`](#taitographql-no-description)                       | server | ✓   |
| [`graphql-no-string-refetch-queries`](#taitographql-no-string-refetch-queries) | client |     |

### `taito/graphql-no-typename-selection`

Disallows `__typename` in `graphql(...)` documents. Apollo Client adds it to every selection set automatically.

**Bad**

```ts
export const userQuery = graphql(`
  query User($id: ID!) {
    user(id: $id) {
      __typename
      id
      name
    }
  }
`);
```

**Good**

```ts
export const userQuery = graphql(`
  query User($id: ID!) {
    user(id: $id) {
      id
      name
    }
  }
`);
```

### `taito/graphql-no-string-refetch-queries`

Requires query documents instead of operation name strings in Apollo's `refetchQueries`. A string such as `'Tasks'` is not type-checked, so renaming or removing the query silently stops the refetch. The rule also follows a `const` array passed as `refetchQueries`.

**Bad**

```ts
await createTask({
  variables: { input },
  refetchQueries: ['Tasks', 'TaskAssignees'],
});
```

**Good**

```ts
await createTask({
  variables: { input },
  refetchQueries: [TasksQuery, TaskAssigneesQuery],
});
```

### `taito/graphql-mutation-returns-entity`

In `*.resolver.ts` files, Pothos `builder.mutationField` and `builder.mutationFields` must return the changed entity instead of a scalar (`Boolean`, `String`, `Int` or `Float`), so that the client cache updates without a refetch. Deletions return the deleted `ID`.

<!-- filename: src/user/user.resolver.ts -->

**Bad**

```ts
builder.mutationField('renameUser', t =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id({ required: true }),
      name: t.arg.string({ required: true }),
    },
    resolve: async (_root, args) => {
      await userService.renameUser(args);

      return true;
    },
  })
);
```

**Good**

```ts
builder.mutationField('renameUser', t =>
  t.field({
    type: User,
    args: {
      id: t.arg.id({ required: true }),
      name: t.arg.string({ required: true }),
    },
    resolve: (_root, args) => userService.renameUser(args),
  })
);
```

### `taito/graphql-no-description`

Disallows `description` options in Pothos schema builders (`builder.*`, field builders and enum values). Use it for internal APIs, where code comments are the better place for documentation. Fixable.

**Bad**

```ts
builder.objectType(User, {
  description: 'A person who can sign in.',
  fields: t => ({
    name: t.exposeString('name', { description: 'Full name.' }),
  }),
});
```

**Good**

```ts
// A person who can sign in.
builder.objectType(User, {
  fields: t => ({
    name: t.exposeString('name'),
  }),
});
```
