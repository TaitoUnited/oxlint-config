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

ruleTester.run('padding-around-multiline-statement', rule, {
  valid: [
    `function run() {
  return buildMember(
    memberId,
  );
}`,
    `export {
  ChatContainer,
  type ChatContainerProps,
} from './chat-container';
export { ChatMarkdown } from './chat-markdown';`,
  ],
  invalid: [
    {
      code: `function run() {
  members.forEach(member => {
    activate(member);
  });
  recordActivation();
}`,
      output: `function run() {
  members.forEach(member => {
    activate(member);
  });

  recordActivation();
}`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `async function run() {
  await repository
    .query()
    .execute();
  recordQuery();
}`,
      output: `async function run() {
  await repository
    .query()
    .execute();

  recordQuery();
}`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `function run() {
  throw new AuthorizationError(
    'Access denied',
  );
  recover();
}`,
      output: `function run() {
  throw new AuthorizationError(
    'Access denied',
  );

  recover();
}`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `export type AssistantSummary = {
  id: string;
  description: string;
};
export type ChatMessageItem = {
  id: string;
  content: string;
};`,
      output: `export type AssistantSummary = {
  id: string;
  description: string;
};

export type ChatMessageItem = {
  id: string;
  content: string;
};`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `async function run() {
  prepare();
  await save({
    value: 1,
  });
}`,
      output: `async function run() {
  prepare();

  await save({
    value: 1,
  });
}`,
      errors: [{ messageId: 'expected' }],
    },
  ],
});
