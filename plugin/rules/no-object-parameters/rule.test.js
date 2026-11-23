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

ruleTester.run('no-object-parameters', rule, {
  valid: [
    'function save(value: { id: string }) {}',
    'function parse(value: unknown) {}',
    'function save<T extends object>(value: T) {}',
    'function save(value: object & { id: string }) {}',
    'function save(value: Record<string, unknown>) {}',
    'function save(value: object[]) {}',
    'function save({ value }: { value: object }) {}',
    'function create(): object { return {}; }',
    'type Input = { id: string }; function save(value: Input) {}',
    'type Input = object; function save<Input>(value: Input) {}',
    'type Input = object; function save() { type Input = { id: string }; function inner(value: Input) {} }',
    'type Input = Input; function save(value: Input) {}',
    'type Input = Next; type Next = Input; function save(value: Input) {}',
    'type Input<T> = T; function save(value: Input<{ id: string }>) {}',
    'import type { Input } from "provider"; function save(value: Input) {}',
    'function save(value) {}',
  ],
  invalid: [
    'function save(value: object) {}',
    'function save(value?: object) {}',
    'function save(value: object = {}) {}',
    'const save = (value: object | null) => {};',
    'const save = function(value: (object | undefined)) {};',
    'function save({ id }: object) {}',
    'type Save = (value: object) => void;',
    'type Save = { (value: object): void };',
    'type Save = { save(value: object): void };',
    'interface Save { save(value: object): void }',
    'class Save { save(value: object) {} }',
    'abstract class Save { abstract save(value: object): void; }',
    'class Save { constructor(public value: object) {} }',
    'type Save = new(value: object) => Save;',
    'interface Save { new(value: object): Save; }',
    'declare function save(value: object): void;',
    'function save(value: object): void; function save(value: unknown) {}',
    'type Input = object; function save(value: Input) {}',
    'const Input = 1; type Input = object; function save(value: Input) {}',
    'type Input = Next | object; type Next = Input; function save(value: Input) {}',
    'type Input = Next | null; type Next = object; function save(value: Input) {}',
    'type Input = { id: string }; function save() { type Input = object; function inner(value: Input) {} }',
  ].map(code => ({
    code,
    output: null,
    errors: [{ messageId: 'objectParameter' }],
  })),
});
