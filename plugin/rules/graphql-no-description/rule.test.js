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

const error = { messageId: 'noDescription' };

ruleTester.run('graphql-no-description', rule, {
  valid: [
    // GraphQL fields and arguments may be named `description`.
    "builder.simpleObject('Assistant', { fields: t => ({ description: t.string() }) });",
    "builder.mutationField('save', t => t.field({ type: 'Boolean', args: { description: t.arg.string() }, resolve: () => true }));",
    "builder.inputType('Input', { fields: t => ({ description: t.string({ required: true }) }) });",
    // Non-Pothos objects such as AI tool declarations are unaffected.
    "const tool = { name: 'search', description: 'Search meetings.' };",
    "declareTool({ description: 'Search meetings.' });",
    "t.field({ description: 'Not inside a Pothos builder call.' });",
    "builder.enumType('Status', { values: ['A', 'B'] });",
    // Resolver parameters carry application data, not Pothos field builders.
    "builder.queryField('item', t => t.field({ type: 'String', resolve: (parent, args, ctx) => ctx.save({ description: args.description }) }));",
    "builder.mutationField('save', t => t.field({ type: 'Boolean', resolve: (_, args, ctx) => db.transaction(tx => tx.update(table).set({ description: args.description })) }));",
    "builder.queryField('items', t => t.field({ type: ['String'], resolve: (_, args) => args.items.map(item => item.with({ description: 'Item.' })) }));",
    "builder.simpleObject('Project', { fields: (t, extra) => ({ name: t.string({ resolve: () => extra.with({ description: 'Data.' }) }) }) });",
  ],
  invalid: [
    {
      code: [
        "builder.queryField('projects', t =>",
        '  t.withAuth({ authenticated: true }).field({',
        '    type: [Project],',
        '    description:',
        "      'Projects of every housing community the user can read.',",
        '    resolve: () => [],',
        '  })',
        ');',
      ].join('\n'),
      output: [
        "builder.queryField('projects', t =>",
        '  t.withAuth({ authenticated: true }).field({',
        '    type: [Project],',
        '    resolve: () => [],',
        '  })',
        ');',
      ].join('\n'),
      errors: [error],
    },
    {
      code: "builder.simpleObject('Project', { description: 'A project.', fields: t => ({}) });",
      output: "builder.simpleObject('Project', { fields: t => ({}) });",
      errors: [error],
    },
    {
      code: "builder.simpleObject('Project', { fields: t => ({ name: t.string({ nullable: true, description: 'Name.' }) }) });",
      output:
        "builder.simpleObject('Project', { fields: t => ({ name: t.string({ nullable: true }) }) });",
      errors: [error],
    },
    {
      code: "builder.mutationField('save', t => t.field({ type: 'Boolean', args: { id: t.arg.id({ required: true, description: 'Id.' }) }, resolve: () => true }));",
      output:
        "builder.mutationField('save', t => t.field({ type: 'Boolean', args: { id: t.arg.id({ required: true }) }, resolve: () => true }));",
      errors: [error],
    },
    {
      code: "builder.objectField(Meeting, 'agenda', field => field.exposeString('agenda', { description: 'Agenda.' }));",
      output:
        "builder.objectField(Meeting, 'agenda', field => field.exposeString('agenda', { }));",
      errors: [error],
    },
    {
      code: "builder.enumType('Status', { description: 'Status.', values: { DRAFT: { value: 'DRAFT', description: 'Draft.' } } });",
      output:
        "builder.enumType('Status', { values: { DRAFT: { value: 'DRAFT' } } });",
      errors: [error, error],
    },
    {
      code: "builder.enumType('Status', { values: { DRAFT: { value: 'DRAFT', description: 'Draft.' } } as const });",
      output:
        "builder.enumType('Status', { values: { DRAFT: { value: 'DRAFT' } } as const });",
      errors: [error],
    },
    {
      code: "builder.inputType('Input', { // preserve this comment\n  description: 'Input.', fields: t => ({}) });",
      output:
        "builder.inputType('Input', { // preserve this comment\n   fields: t => ({}) });",
      errors: [error],
    },
    {
      code: "builder.inputType('Input', { fields: t => ({}), // preserve this comment\n  description: 'Input.' });",
      output:
        "builder.inputType('Input', { fields: t => ({}), // preserve this comment\n   });",
      errors: [error],
    },
    {
      code: "builder.inputType('Input', { 'description': 'Input.', fields: t => ({}) });",
      output: "builder.inputType('Input', { fields: t => ({}) });",
      errors: [error],
    },
  ],
});
