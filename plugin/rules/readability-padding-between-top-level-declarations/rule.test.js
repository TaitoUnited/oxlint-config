// @vitest-environment node

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

ruleTester.run('readability-padding-between-top-level-declarations', rule, {
  valid: [
    `import { value } from './value.js';
type Identifier = string;`,
    `const minimum = 1;
const maximum = 10;`,
    `export type DBMeeting = typeof meetingTable.$inferSelect;
export type DBMeetingParticipant = typeof meetingParticipantTable.$inferSelect;
export type DBMeetingStatus = DBMeeting['status'];
export type DBMeetingType = DBMeeting['type'];`,
    `type ButtonSize = 'small' | 'normal' | 'large';
type ButtonColor = 'primary' | 'success' | 'error' | 'neutral';
type ButtonIconPlacement = 'start' | 'end';`,
    `export { ChatContainer, type ChatContainerProps } from './chat-container';
export { ChatInput, type ChatInputProps } from './chat-input';
export { ChatMarkdown } from './chat-markdown';`,
    `export * from './chat-container';
export * from './chat-input';`,
    `function parse(value: string): string;
function parse(value: unknown): string {
  return String(value);
}`,
  ],
  invalid: [
    {
      code: `type Identifier = string;
const defaultIdentifier = 'default';`,
      output: `type Identifier = string;

const defaultIdentifier = 'default';`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `const defaultIdentifier = 'default';
function getIdentifier() {
  return defaultIdentifier;
}`,
      output: `const defaultIdentifier = 'default';

function getIdentifier() {
  return defaultIdentifier;
}`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `type ButtonSize = 'small' | 'large';
type ButtonOptions = {
  size: ButtonSize;
};`,
      output: `type ButtonSize = 'small' | 'large';

type ButtonOptions = {
  size: ButtonSize;
};`,
      errors: [{ messageId: 'expected' }],
    },
  ],
});
