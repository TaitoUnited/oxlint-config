// @vitest-environment node

import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { rule } from './rule.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' }, sourceType: 'module' },
});

ruleTester.run('graphql-no-string-refetch-queries', rule, {
  valid: [
    'mutate({ refetchQueries: [TasksQuery, TaskAssigneesQuery] });',
    'mutate({ refetchQueries: [{ query: TasksQuery, variables: { id } }] });',
    "mutate({ refetchQueries: 'active' });",
    'mutate({ refetchQueries: result => [TasksQuery] });',
    'const refetchQueries = [TasksQuery];\nmutate({ refetchQueries });',
    "const options = ['Tasks'];\nselect({ options });",
  ],
  invalid: [
    {
      code: "mutate({ refetchQueries: ['Tasks', TaskAssigneesQuery] });",
      errors: [
        {
          message:
            'Pass the query document instead of the operation name "Tasks". Documents are type-checked, so renaming or removing the query cannot silently stop the refetch.',
        },
      ],
    },
    {
      code: "useMutation(CreateTask, { refetchQueries: ['Tasks', `TaskAssignees`] });",
      errors: [
        { messageId: 'stringRefetchQuery', data: { name: 'Tasks' } },
        { messageId: 'stringRefetchQuery', data: { name: 'TaskAssignees' } },
      ],
    },
    {
      code: "const refetchQueries = ['Tasks'];\nmutate({ refetchQueries });",
      errors: [{ messageId: 'stringRefetchQuery' }],
    },
  ],
});
