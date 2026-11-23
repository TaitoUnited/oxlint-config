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

ruleTester.run('padding-around-control-flow', rule, {
  valid: [
    `if (active) {
  deactivate();
} else {
  activate();
}

recordChange();`,
    `switch (status) {
  case 'active':
    activate();
    break;
  case 'inactive':
    deactivate();
    break;
}`,
    `let something = 1;

if (another) {
  something = 2;
}`,
    `const options = {
  enabled: true,
};
if (options.enabled) {
  work();
}`,
  ],
  invalid: [
    {
      code: `if (active) {
  deactivate();
}
recordChange();`,
      output: `if (active) {
  deactivate();
}

recordChange();`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `try {
  save();
} catch (error) {
  report(error);
}
return member;`,
      output: `try {
  save();
} catch (error) {
  report(error);
}

return member;`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `let something = 1;
if (another) {
  something = 2;
}`,
      output: `let something = 1;

if (another) {
  something = 2;
}`,
      errors: [{ messageId: 'expected' }],
    },
    {
      code: `function run() {
  prepare(); // Keep this with preparation.
  while (active) {
    work();
  }
}`,
      output: `function run() {
  prepare(); // Keep this with preparation.

  while (active) {
    work();
  }
}`,
      errors: [{ messageId: 'expected' }],
    },
  ],
});
