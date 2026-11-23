// @vitest-environment node

import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { rule } from './rule.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { lang: 'tsx' },
    sourceType: 'module',
  },
});

ruleTester.run('no-function-deps-in-effect', rule, {
  valid: [
    'import * as Apollo from "other"; const [mutate] = Apollo.useMutation(query); useEffect(() => {}, [mutate]);',
    'import { useForm } from "react-hook-form"; let { setValue } = useForm(); setValue = other; useEffect(() => {}, [setValue]);',
    'import { useForm } from "react-hook-form"; const { setValue } = useForm(); const useEffect = () => {}; useEffect(() => {}, [setValue]);',

    'import { useForm } from "react-hook-form"; const { formState, control } = useForm(); useEffect(() => {}, [formState, control]);',
    'import { useForm } from "react-hook-form"; const form = useForm(); useEffect(() => {}, [form.formState, form.control, form.unknown]);',
    'import { useMutation } from "@apollo/client/react"; const [mutate, state] = useMutation(query); useEffect(() => {}, [state]);',
    'import { useChat } from "@ai-sdk/react"; const { messages, status, error } = useChat(); useEffect(() => {}, [messages, status, error]);',
    'import { useForm } from "other"; const { setValue } = useForm(); useEffect(() => {}, [setValue]);',
    'import { useForm as makeForm } from "other"; const form = makeForm(); useEffect(() => {}, [form.setValue]);',
    'const { setValue } = useForm(); useEffect(() => {}, [setValue]);',
    'import { useUnknown } from "react-hook-form"; const { setValue } = useUnknown(); useEffect(() => {}, [setValue]);',
    'import { useForm } from "react-hook-form"; function run(useForm) { const { setValue } = useForm(); useEffect(() => {}, [setValue]); }',
    'import { useForm } from "react-hook-form"; const { setValue } = useForm(); function run(setValue: string) { useEffect(() => {}, [setValue]); }',
    'import * as Forms from "react-hook-form"; function run(Forms) { const form = Forms.useForm(); useEffect(() => {}, [form.setValue]); }',
    'import { useMutation } from "other"; const [refreshMeetingSigning] = useMutation(query); useEffect(() => {}, [refreshMeetingSigning]);',
    'import { useMutation } from "@apollo/client/react"; function run(useMutation) { const [mutate] = useMutation(query); useEffect(() => {}, [mutate]); }',
    'import { useForm } from "react-hook-form"; let form = useForm(); form = otherForm; useEffect(() => {}, [form.setValue]);',
    'import { useForm } from "react-hook-form"; const form = useForm(); const field = "setValue"; useEffect(() => {}, [form[field]]);',
    'import type { useForm } from "react-hook-form"; const { setValue } = useForm(); useEffect(() => {}, [setValue]);',
    'import { type useForm } from "react-hook-form"; const { setValue } = useForm(); useEffect(() => {}, [setValue]);',
    'import { useForm } from "react-hook-form"; const first = second; const second = first; useEffect(() => {}, [first.setValue]);',

    'const onSave = "ready"; useEffect(() => {}, [onSave]);',
    'const actions = { onSave: "ready" }; useEffect(() => {}, [actions.onSave]);',
    'const [value] = useState(0); useEffect(() => {}, [value]);',
    'const [value, setValue] = useOtherHook(); useEffect(() => {}, [setValue]);',
    'const useState = () => [0, 1]; const [value, setValue] = useState(); useEffect(() => {}, [setValue]);',
    'import { useState } from "other"; const [value, setValue] = useState(0); useEffect(() => {}, [setValue]);',
    'const useEffect = () => {}; const callback = () => {}; useEffect(() => {}, [callback]);',
    'const useCallback = () => "value"; const callback = useCallback(() => {}); useEffect(() => {}, [callback]);',
    'const onSave = () => {}; function run(onSave: string) { useEffect(() => {}, [onSave]); }',
    'function run(onSave: string) { useEffect(() => {}, [onSave]); }',
  ],
  invalid: [
    {
      code: 'const callback = () => {}; useEffect(() => callback(), [callback]);',
      output: null,
      errors: [{ messageId: 'functionDependency' }],
    },
    {
      code: 'function callback() {} useEffect(() => callback(), [callback]);',
      output: null,
      errors: [{ messageId: 'functionDependency' }],
    },

    ...[
      // Form callbacks, including renamed bindings and object aliases.
      'import { useForm } from "react-hook-form"; const { setValue } = useForm(); useEffect(() => setValue("title", title), [title, setValue]);',
      'import { useForm as useMeetingForm } from "react-hook-form"; const { setValue: update } = useMeetingForm(); useEffect(() => {}, [update]);',
      'import { useFormContext } from "react-hook-form"; const { reset } = useFormContext(); useEffect(() => {}, [reset]);',
      'import * as Forms from "react-hook-form"; const form = Forms.useForm(); useEffect(() => {}, [form.setValue]);',
      'import { useForm } from "react-hook-form"; const form = useForm(); const methods = form; const { setValue: save } = methods; const alias = save; useEffect(() => {}, [alias]);',
      'import { useForm } from "react-hook-form"; const form = useForm(); const save = form.setValue; useEffect(() => {}, [save]);',
      'import { useForm } from "react-hook-form"; const form = useForm(); function run(useForm) { const methods = form; useEffect(() => {}, [methods.setValue]); }',
      // The application imports Apollo mutation callbacks directly.
      'import { useMutation } from "@apollo/client/react"; const [refreshMeetingSigning] = useMutation(query); useEffect(() => {}, [refreshMeetingSigning]);',
      'import { useMutation as useAction } from "@apollo/client/react"; const [mutate] = useAction(query); const refresh = mutate; useEffect(() => {}, [refresh]);',
      'import * as Apollo from "@apollo/client/react"; const mutation = Apollo.useMutation(query); const [mutate] = mutation; useEffect(() => {}, [mutate]);',
      // SDK callbacks should not merge separate message/cleanup triggers.
      'import { useChat } from "@ai-sdk/react"; const { setMessages: setRawMessages } = useChat(); useEffect(() => {}, [setRawMessages]);',
      'import { useChat as useConversation } from "@ai-sdk/react"; const chat = useConversation(); useEffect(() => {}, [chat.stop]);',
    ].map(code => ({
      code,
      output: null,
      errors: [{ messageId: 'functionDependency' }],
    })),

    {
      code: 'import { useEffect as useSideEffect } from "react"; const callback: () => void = getCallback(); useSideEffect(() => {}, [callback]);',
      output: null,
      errors: [{ messageId: 'functionDependency' }],
    },
    {
      code: 'const [value, setValue] = useState(0); useEffect(() => {}, [setValue]);',
      output: null,
      errors: [{ messageId: 'functionDependency' }],
    },
    {
      code: 'import { useState as useLocalState } from "react"; const [value, update] = useLocalState(0); useEffect(() => {}, [update]);',
      output: null,
      errors: [{ messageId: 'functionDependency' }],
    },
    {
      code: 'import ReactAlias from "react"; const [value, update] = ReactAlias.useState(0); useEffect(() => {}, [update]);',
      output: null,
      errors: [{ messageId: 'functionDependency' }],
    },
    {
      code: 'const [state, dispatch] = useReducer(reducer, 0); useEffect(() => {}, [dispatch]);',
      output: null,
      errors: [{ messageId: 'functionDependency' }],
    },
    {
      code: 'const callback: () => void = getCallback(); useEffect(() => {}, [callback]);',
      output: null,
      errors: [{ messageId: 'functionDependency' }],
    },
    {
      code: 'function run(callback: () => void) { useEffect(() => {}, [callback]); }',
      output: null,
      errors: [{ messageId: 'functionDependency' }],
    },
    {
      code: 'function run({ onSave }: { onSave: () => void }) { useEffect(() => {}, [onSave]); }',
      output: null,
      errors: [{ messageId: 'functionDependency' }],
    },
    {
      code: 'function run({ onSave: save }: { onSave: () => void }) { useEffect(() => {}, [save]); }',
      output: null,
      errors: [{ messageId: 'functionDependency' }],
    },
    {
      code: 'const actions = { onSave: () => {} }; useEffect(() => {}, [actions.onSave]);',
      output: null,
      errors: [{ messageId: 'functionDependency' }],
    },
    {
      code: 'const actions = { onSave() {} }; const { onSave } = actions; useEffect(() => {}, [onSave]);',
      output: null,
      errors: [{ messageId: 'functionDependency' }],
    },
    {
      code: 'const actions = { onSave() {} }; const { onSave: save } = actions; useEffect(() => {}, [save]);',
      output: null,
      errors: [{ messageId: 'functionDependency' }],
    },
    {
      code: 'const onSave = () => {}; const callback = onSave; useEffect(() => {}, [callback]);',
      output: null,
      errors: [{ messageId: 'functionDependency' }],
    },
  ],
});
