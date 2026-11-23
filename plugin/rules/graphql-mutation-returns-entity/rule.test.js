import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { rule } from './rule.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { lang: 'ts' },
    sourceType: 'module',
  },
});

const filename = 'meeting.resolver.ts';

function scalarError(type) {
  return { messageId: 'scalarMutation', data: { type } };
}

ruleTester.run('graphql-mutation-returns-entity', rule, {
  valid: [
    {
      filename,
      code: "builder.mutationField('updateMeeting', t => t.withAuth({ authenticated: true }).field({ type: Meeting, args: { title: t.arg({ type: 'String' }) }, resolve: () => meeting }));",
    },
    {
      filename,
      code: "builder.mutationField('deleteMeeting', t => t.field({ type: 'ID', resolve: () => id }));",
    },
    {
      filename,
      code: "builder.queryField('meetingCount', t => t.field({ type: 'Int', resolve: () => 1 }));",
    },
    // Scalar arguments and nested object fields are not mutation results.
    {
      filename,
      code: "builder.mutationField('saveMeeting', t => t.field({ type: builder.simpleObject('Saved', { fields: f => ({ ok: f.boolean() }) }), args: { id: t.arg.string() }, resolve: () => ({ ok: true }) }));",
    },
    {
      filename: 'meeting.schema.ts',
      code: "builder.mutationField('sendReminder', t => t.field({ type: 'Boolean', resolve: () => true }));",
    },
  ],
  invalid: [
    {
      filename,
      code: "builder.mutationField('recallMeetingSigning', t => t.withAuth({ authenticated: true }).field({ type: 'Boolean', resolve: () => true }));",
      errors: [scalarError('Boolean')],
    },
    {
      filename,
      code: "builder.mutationField('renameMeeting', t => { return t.field({ type: 'String', resolve: () => 'name' }); });",
      errors: [scalarError('String')],
    },
    {
      filename,
      code: "builder.mutationFields(t => ({ archive: t.boolean({ resolve: () => true }), rename: t.field({ type: Meeting, resolve: () => meeting }), score: t.field({ type: 'Float', resolve: () => 1 }) }));",
      errors: [scalarError('Boolean'), scalarError('Float')],
    },
  ],
});
