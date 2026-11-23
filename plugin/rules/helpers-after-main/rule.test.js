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

const testFilename = 'src/meeting/meeting.service.test.integration.ts';

ruleTester.run('helpers-after-main', rule, {
  valid: [
    ...[
      "describe('meeting', () => { test('saves', () => createMeeting()); });\n\n// Helpers\n\nfunction createMeeting() { return 1; }",
      "const createMeeting = () => 1; test('saves', () => {});",
      // Utility modules shared by tests have no tests to place first.
      'export function createMeeting() { return 1; }',
    ].map(code => ({ code, filename: testFilename })),
    ...[
      'function getMeeting() {} function saveMeeting() {} export const meetingService = { getMeeting, save: saveMeeting }; function validateMeeting() {}',
      'export function isOpenMeeting() {} export const meetingService = {};',
      'const MAX_PARTICIPANTS = 200; export const meetingService = {};',
      // Without the exported object there is no public surface to order around.
      'function validateMeeting() {} export function getMeeting() {}',
      'function validateMeeting() {} export const meetingConfig = {};',
      "function createMeeting() {} describe('meeting', () => {});",
    ].map(code => ({ code, filename: 'src/meeting/meeting.service.ts' })),
    {
      code: 'function getMeetingRow() {} export const meetingDao = { getMeetingRow };',
      filename: 'src/meeting/meeting.dao.ts',
    },
    {
      code: 'function validateMeeting() {} export const meetingService = { getMeeting };',
      filename: 'src/meeting/meeting.utils.ts',
    },
  ],
  invalid: [
    ...[
      "function createMeeting() {} describe('meeting', () => {});",
      "export function createMeeting() {} it('saves', () => {});",
      "async function createMeeting() {} describe.skip('meeting', () => {});",
      "function createMeeting() {} describe.each([1])('meeting %s', () => {});",
      "beforeEach(() => {}); function createMeeting() {} test('saves', () => {});",
    ].map(code => ({
      code,
      filename: testFilename,
      errors: [{ messageId: 'testHelperBeforeTests' }],
    })),
    {
      code: "function createMeeting() {} function createAgenda() {} test('saves', () => {}); function createUser() {}",
      filename: testFilename,
      errors: [
        { messageId: 'testHelperBeforeTests', data: { name: 'createMeeting' } },
        { messageId: 'testHelperBeforeTests', data: { name: 'createAgenda' } },
      ],
    },
    {
      code: 'function getMeeting() {} async function validateMeeting() {} export const meetingService = { getMeeting };',
      filename: 'src/meeting/meeting.service.ts',
      errors: [
        {
          messageId: 'privateHelperBeforeExport',
          data: { name: 'validateMeeting', exportName: 'meetingService' },
        },
      ],
    },
    {
      code: 'function* getBatches() {} const toRow = () => 1; export const avaaSyncDao = {};',
      filename: 'src/avaa/avaa-sync.dao.ts',
      errors: [
        {
          messageId: 'privateHelperBeforeExport',
          data: { name: 'getBatches', exportName: 'avaaSyncDao' },
        },
      ],
    },
  ],
});

ruleTester.run('helpers-after-main with other module shapes', rule, {
  valid: [
    {
      code: 'export class UserService { save() { return validate(); } } function validate() {}',
      filename: 'src/user/user.service.ts',
    },
    {
      code: 'function getUser() {} export const userService = { getUser } satisfies Service; function validate() {}',
      filename: 'src/user/user.service.ts',
    },
    {
      code: "describe('user', () => {}); function createUser() {}",
      filename: 'src/user/user.spec.ts',
    },
  ],
  invalid: [
    {
      code: 'function validate() {} export class UserService { save() { return validate(); } }',
      filename: 'src/user/user.service.ts',
      errors: [
        {
          message:
            'Move "validate" below `UserService`. Private helpers follow the main export, so the file reads from its public API down.',
        },
      ],
    },
    {
      code: 'function validate() {} export const userService = { getUser } as const;',
      filename: 'src/user/user.service.ts',
      errors: [{ messageId: 'privateHelperBeforeExport' }],
    },
    {
      code: "function createUser() {} describe('user', () => {});",
      filename: 'src/user/user.spec.ts',
      errors: [{ messageId: 'testHelperBeforeTests' }],
    },
  ],
});

ruleTester.run('helpers-after-main with options', rule, {
  valid: [
    {
      // Not a module file once the pattern is replaced.
      code: 'function validate() {} export const userService = {};',
      filename: 'src/user/user.service.ts',
      options: [{ moduleFilePattern: String.raw`\.repository\.ts$` }],
    },
    {
      code: "function createUser() {} describe('user', () => {});",
      filename: 'src/user/user.spec.ts',
      options: [{ testFilePattern: String.raw`\.test\.` }],
    },
  ],
  invalid: [
    {
      code: 'function toRow() {} export const userRepository = {};',
      filename: 'src/user/user.repository.ts',
      options: [
        {
          moduleFilePattern: String.raw`\.repository\.ts$`,
          mainExportPattern: String.raw`Repository$`,
        },
      ],
      errors: [
        {
          messageId: 'privateHelperBeforeExport',
          data: { name: 'toRow', exportName: 'userRepository' },
        },
      ],
    },
    {
      code: "function createUser() {} test('saves', () => {});",
      filename: 'src/user/__tests__/user.ts',
      options: [{ testFilePattern: String.raw`/__tests__/` }],
      errors: [{ messageId: 'testHelperBeforeTests' }],
    },
  ],
});
