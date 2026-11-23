# GraphQL rules

Opt-in rules for GraphQL clients that use [Apollo Client](https://www.apollographql.com/docs/react) and servers that build their schema with [Pothos](https://pothos-graphql.dev). No preset enables them. Enable the ones that match your stack:

```ts
rules: {
  // Client
  'taito/graphql-no-typename-selection': 'error',
  // Server
  'taito/graphql-mutation-returns-entity': 'error',
  'taito/graphql-no-description': 'error',
}
```

| Rule                                                                       | Side   | Fix |
| -------------------------------------------------------------------------- | ------ | --- |
| [`graphql-no-typename-selection`](#taitographql-no-typename-selection)     | client |     |
| [`graphql-mutation-returns-entity`](#taitographql-mutation-returns-entity) | server |     |
| [`graphql-no-description`](#taitographql-no-description)                   | server | ✓   |

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
