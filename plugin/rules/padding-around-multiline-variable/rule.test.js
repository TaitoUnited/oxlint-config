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

ruleTester.run('padding-around-multiline-variable', rule, {
  valid: [
    `function run() {
  const options = {
    secure: true,
  };
}`,
    `const first = 1;
const second = 2;`,
    `function useAgenda() {
  const { t } = useLingui();

  const [initialize, state] = useMutation(InitializeMeetingAgendaMutation, {
    refetchQueries: [MeetingAgendaWorkspaceQuery],
    onCompleted: () => {
      toast(t\`Esityslista aloitettu.\`, { variant: 'success' });
    },
  });
}`,
    `function createAgenda() {
  return {
    id: createAgendaId(),
  };
}
const [initialize] = useMutation(InitializeMeetingAgendaMutation, {
  refetchQueries: [MeetingAgendaWorkspaceQuery],
});`,
    `namespace Values {
  const options = {
    enabled: true,
  };
}`,
    `function create() {}
const options = {
  enabled: true,
};`,
  ],
  invalid: [
    {
      code: `function useAgenda() {
  const { t } = useLingui();
  const [initialize, state] = useMutation(InitializeMeetingAgendaMutation, {
    refetchQueries: [MeetingAgendaWorkspaceQuery],
    onCompleted: () => {
      toast(t\`Esityslista aloitettu.\`, { variant: 'success' });
    },
  });
}`,
      output: `function useAgenda() {
  const { t } = useLingui();

  const [initialize, state] = useMutation(InitializeMeetingAgendaMutation, {
    refetchQueries: [MeetingAgendaWorkspaceQuery],
    onCompleted: () => {
      toast(t\`Esityslista aloitettu.\`, { variant: 'success' });
    },
  });
}`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `function run() {
  const sessionId = createSessionId(); // Created before the request.
  const options = {
    secure: true,
  };
}`,
      output: `function run() {
  const sessionId = createSessionId(); // Created before the request.

  const options = {
    secure: true,
  };
}`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `function run() {
  const options = {
    secure: true,
  };
  createSession(options);
}`,
      output: `function run() {
  const options = {
    secure: true,
  };

  createSession(options);
}`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `function run(context: Context) {
  const {
    member,
  } = context;
  useMember(member);
}`,
      output: `function run(context: Context) {
  const {
    member,
  } = context;

  useMember(member);
}`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: 'function run() {\r\n  const options = {\r\n    secure: true,\r\n  };\r\n  createSession(options);\r\n}',
      output:
        'function run() {\r\n  const options = {\r\n    secure: true,\r\n  };\r\n\r\n  createSession(options);\r\n}',
      errors: [{ messageId: 'expected' }],
    },
  ],
});
