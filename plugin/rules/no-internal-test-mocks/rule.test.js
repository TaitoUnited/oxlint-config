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

ruleTester.run('no-internal-test-mocks', rule, {
  valid: [
    {
      code: 'import { vi } from "vitest"; import { createFixture } from "./test-utils"; createFixture({ onChange: vi.fn() });',
      options: [{ boundary: 'client' }],
    },
    {
      code: 'import { vi } from "vitest"; import { createSelection } from "./selection"; createSelection({ onChange: () => {} });',
      options: [{ boundary: 'client' }],
    },
    {
      code: 'export type { HttpHandler } from "msw";',
      options: [{ boundary: 'client' }],
    },
    'import { vi } from "vitest"; vi.mock("node:net"); vi.mock("dns");',
    'import { vi } from "vitest"; const patch = { mode: "test" }; import { config } from "./config"; Object.assign(config, { ...patch });',
    {
      code: 'const { setupServer } = await import("msw/node");',
      options: [{ boundary: 'server' }],
    },
    'import { vi } from "vitest"; vi.spyOn(navigator.clipboard, "writeText");',
    'import { vi } from "vitest"; vi.doMock("custom-provider", () => ({}));',
    'import { vi } from "vitest"; vi.spyOn(document, "visibilityState", "get");',
    'import { vi } from "vitest"; vi.spyOn(console, "warn").mockImplementation(() => {});',
    'import { vi } from "vitest"; vi.mock("@tanstack/react-router", () => ({ redirect: () => new Error() }));',
    'import { vi } from "other"; vi.mock("./meeting.dao");',
    'const vi = { mock() {} }; vi.mock("./meeting.dao");',
    'vi.mock("./meeting.dao");',
    'import { vi } from "vitest"; function run(vi) { vi.mock("./meeting.dao"); }',
    'import { vi as mocks } from "vitest"; function run(mocks) { mocks.mock("./meeting.dao"); }',
    'import { vi } from "vitest"; import * as dao from "./meeting.dao"; function run(dao) { vi.spyOn(dao, "save"); }',
    'import { vi } from "vitest"; const local = { save() {} }; vi.spyOn(local, "save");',
    'import { vi } from "vitest"; vi.mock(moduleName);',
    'import { vi } from "vitest"; vi.mock(`./${moduleName}`);',
    'import { vi } from "vitest"; vi.mock("../node_modules/provider/index.js");',
    'import { vi } from "vitest"; let mocks = vi; mocks = other; mocks.mock("./meeting.dao");',
    'import type { vi } from "vitest"; vi.mock("./meeting.dao");',
    'import { type vi } from "vitest"; vi.mock("./meeting.dao");',
    'import { vi } from "vitest"; const first = second; const second = first; first.mock("./meeting.dao");',
    'import { vi } from "vitest"; vi.fn(); vi.clearAllMocks();',
    'import { vi } from "vitest"; vi.stubGlobal("ResizeObserver", vi.fn());',
    'import { vi } from "vitest"; vi.useFakeTimers(); vi.setSystemTime(new Date());',
    'import { vi } from "vitest"; function run(globalThis) { vi.spyOn(globalThis, "fetch"); }',
    'import { vi } from "vitest"; function run(Object) { Object.defineProperty(globalThis, "fetch", { value: vi.fn() }); }',
    'import { vi } from "vitest"; const window = { fetch() {} }; vi.spyOn(window, "fetch");',
    'import { vi } from "vitest"; const target = { fetch() {} }; target.fetch = vi.fn();',
    'import { vi } from "vitest"; import { config } from "./config"; config.BASE_URL = "http://test.local";',
    'import { vi } from "vitest"; import { run } from "./utility"; run(vi.fn());',
    'import { configure } from "./example.service"; configure({ onChange() {} });',
    'import { service } from "./example.service"; service.run = () => {};',
    'import { http, HttpResponse } from "msw"; import { setupServer } from "msw/node"; setupServer(http.get("https://test.local", () => HttpResponse.json({})));',
    {
      code: 'import type { HttpHandler } from "msw";',
      options: [{ boundary: 'client' }],
    },
    {
      code: 'import { type HttpHandler } from "msw";',
      options: [{ boundary: 'client' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mock("custom-provider");',
      filename: '/repo/server/src/adapter.test.unit.ts',
      options: [{ boundary: 'server' }],
    },
  ],
  invalid: [
    {
      code: 'import { vi } from "vitest"; import { service } from "./example.service"; service.load = (async () => []) as any;',
      output: null,
      errors: [{ messageId: 'internalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; import { service } from "./example.service"; service.load = (async () => []) satisfies Loader;',
      output: null,
      errors: [{ messageId: 'internalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; import { service } from "./example.service"; Object.assign(service, ({ ...{ load: async () => [] } }) as Service);',
      output: null,
      errors: [{ messageId: 'internalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; const replacements = { fetch: vi.fn() }; Object.assign(globalThis, { ...replacements });',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; import { createService } from "./example.service"; const replacements = { load: vi.fn() }; createService({ ...replacements });',
      output: null,
      errors: [{ messageId: 'injectedMock' }],
    },
    {
      code: 'import { vi } from "vitest"; import { createService } from "./example.service"; createService({ now: () => new Date(0) });',
      output: null,
      errors: [{ messageId: 'injectedMock' }],
    },
    {
      code: 'import { vi } from "vitest"; const source = "./example.service" satisfies string; vi.mock(source);',
      output: null,
      errors: [{ messageId: 'internalModule' }],
    },
    {
      code: 'export * from "nock";',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'export { default as fake } from "fetch-mock";',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'export * from "msw/node";',
      options: [{ boundary: 'client' }],
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'export { http } from "msw";',
      options: [{ boundary: 'client' }],
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mock("pg-pool");',
      options: [{ boundary: 'server' }],
      output: null,
      errors: [{ messageId: 'realDependency' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mock("postgres");',
      options: [{ boundary: 'server' }],
      output: null,
      errors: [{ messageId: 'realDependency' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mock("http2");',
      options: [{ boundary: 'server' }],
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; import * as fs from "node:fs"; vi.spyOn(fs, "readFileSync");',
      options: [{ boundary: 'server' }],
      filename: '/repo/example.test.integration.ts',
      output: null,
      errors: [{ messageId: 'externalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mock("custom-provider");',
      options: [{ boundary: 'server' }],
      filename: '/repo/example.test.integration.ts',
      output: null,
      errors: [{ messageId: 'externalModule' }],
    },
    {
      code: 'const { setupWorker } = await import("msw/browser");',
      options: [{ boundary: 'client' }],
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'const source = "msw/node"; await import(source);',
      options: [{ boundary: 'client' }],
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'await import("nock");',
      options: [{ boundary: 'server' }],
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mock("pg");',
      options: [{ boundary: 'server' }],
      output: null,
      errors: [{ messageId: 'realDependency' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mock("drizzle-orm/node-postgres");',
      options: [{ boundary: 'server' }],
      output: null,
      errors: [{ messageId: 'realDependency' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.doMock("unpdf");',
      options: [{ boundary: 'server', realDependencies: ['unpdf'] }],
      output: null,
      errors: [{ messageId: 'realDependency' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mock("react");',
      options: [{ boundary: 'client' }],
      output: null,
      errors: [{ messageId: 'realDependency' }],
    },
    {
      code: 'import { vi } from "vitest"; import * as React from "react"; vi.spyOn(React, "useState");',
      options: [{ boundary: 'client' }],
      output: null,
      errors: [{ messageId: 'realDependency' }],
    },
    {
      code: 'import { vi } from "vitest"; import axios from "axios"; axios.get = vi.fn();',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; import * as pg from "pg"; Object.assign(pg, { Pool: vi.fn() });',
      options: [{ boundary: 'server' }],
      output: null,
      errors: [{ messageId: 'realDependency' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.spyOn(navigator.serviceWorker, "register");',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.spyOn(window.navigator.serviceWorker, "register");',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; navigator.serviceWorker = vi.fn();',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; const patches = { fetch: vi.fn() }; Object.assign(globalThis, patches);',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; Object.defineProperties(window, { fetch: { value: vi.fn() } });',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; import { service } from "./meeting.service"; Object.defineProperties(service, { load: { value: vi.fn() } });',
      output: null,
      errors: [{ messageId: 'internalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mock("./meeting" + ".dao");',
      output: null,
      errors: [{ messageId: 'internalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; const target = "./meeting.dao" as const; vi.mock(target);',
      output: null,
      errors: [{ messageId: 'internalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.spyOn(globalThis, "fetch");',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.spyOn(window, "XMLHttpRequest");',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; const root = globalThis; vi.spyOn(root, "WebSocket");',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; const name = "fetch"; const { stubGlobal } = vi; stubGlobal(name, vi.fn());',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import * as tests from "vitest"; tests.vi.stubGlobal("EventSource", class {});',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; globalThis.fetch = vi.fn();',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { expect } from "vitest"; window.fetch = async () => new Response();',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { beforeEach } from "vitest"; const root = globalThis; root["fetch"] = async () => new Response();',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; Object.defineProperty(globalThis, "fetch", { value: vi.fn() });',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; Object.assign(window, { fetch: vi.fn() });',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mocked(fetch).mockResolvedValue(new Response());',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mock("googleapis");',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.doMock("ky", () => ({}));',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.importMock("@apollo/client/react");',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; import * as provider from "googleapis"; vi.spyOn(provider.google, "admin");',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; import client from "axios"; vi.mockObject(client);',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mock("../node_modules/undici/index.js");',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mock("node:https");',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mock("@aws-sdk/client-s3");',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; import { fetch } from "undici"; vi.mocked(fetch).mockImplementation(async () => new Response());',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { fetch } from "nock";',
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.importMock("./meeting.dao");',
      output: null,
      errors: [{ messageId: 'internalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; const path = "./meeting.dao"; vi.mock(path);',
      output: null,
      errors: [{ messageId: 'internalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; import { service } from "./meeting.service"; vi.mockObject(service);',
      output: null,
      errors: [{ messageId: 'internalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; import { service } from "./meeting.service"; service.load = vi.fn();',
      output: null,
      errors: [{ messageId: 'internalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; import { service } from "./meeting.service"; Object.assign(service, { load: vi.fn() });',
      output: null,
      errors: [{ messageId: 'internalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; import { service } from "./meeting.service"; Object.defineProperty(service, "load", { value: vi.fn() });',
      output: null,
      errors: [{ messageId: 'internalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; import { load } from "./meeting.dao"; vi.mocked(load).mockResolvedValue([]);',
      output: null,
      errors: [{ messageId: 'internalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; import { load } from "./meeting.dao"; const typed = vi.mocked(load); typed.mockReturnValue([]);',
      output: null,
      errors: [{ messageId: 'internalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; import { service } from "./meeting.service"; (service as Service).load = () => [];',
      output: null,
      errors: [{ messageId: 'internalModule' }],
    },
    {
      code: 'import { setupServer } from "msw/node";',
      options: [{ boundary: 'client' }],
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { setupWorker } from "msw/browser";',
      options: [{ boundary: 'client' }],
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { http } from "msw";',
      options: [{ boundary: 'client' }],
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { MockedProvider } from "@apollo/client/testing/react";',
      options: [{ boundary: 'client' }],
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mock("unpdf");',
      filename: '/repo/server/src/adapter.test.integration.ts',
      options: [{ boundary: 'server' }],
      output: null,
      errors: [{ messageId: 'externalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mock("my-http-sdk");',
      options: [{ boundary: 'server', networkPackages: ['my-http-sdk'] }],
      output: null,
      errors: [{ messageId: 'networkMock' }],
    },
    {
      code: 'import { vi } from "vitest"; vi.mock("pdf-lib");',
      filename: '/repo/server/src/adapter.test.e2e.ts',
      options: [
        {
          boundary: 'server',
          integrationTestPattern: String.raw`\.test\.e2e\.`,
        },
      ],
      output: null,
      errors: [{ messageId: 'externalModule' }],
    },
    {
      code: 'import { vi } from "vitest"; import { createService } from "./group.service"; const listUsers = vi.fn(); createService({ listUsers });',
      options: [{ boundary: 'server' }],
      output: null,
      errors: [{ messageId: 'injectedMock' }],
    },
    {
      code: 'import { vi } from "vitest"; import { createService } from "./group.service"; createService({ listUsers: async () => [] });',
      options: [{ boundary: 'server' }],
      output: null,
      errors: [{ messageId: 'injectedMock' }],
    },
    ...[
      'import { vi } from "vitest"; vi.mock("./meeting.dao", () => ({}));',
      'import { vi as mocks } from "vitest"; mocks.doMock("~/src/utils/config");',
      'import * as tests from "vitest"; tests.vi.mock("@/hooks/use-user");',
      'import { vitest } from "vitest"; vitest.mock("./index");',
      'import { vi } from "vitest"; const mocks = vi; mocks.mock("./meeting.dao");',
      'import { vi } from "vitest"; const { mock: replace } = vi; replace("./meeting.dao");',
      'import * as tests from "vitest"; const { vi: mocks } = tests; const replace = mocks.mock; replace("./meeting.dao");',
      'import { vi } from "vitest"; vi["mock"]("./meeting.dao");',
      'import { vi } from "vitest"; vi.mock(`./meeting.dao`);',
      'import { vi } from "vitest"; vi.mock(import("./meeting.dao"));',
      'import { vi } from "vitest"; vi.doMock(import("./meeting.dao"));',
      'import { vi } from "vitest"; import * as dao from "./meeting.dao"; vi.spyOn(dao, "save");',
      'import { vi } from "vitest"; import { service } from "~/src/meeting/index"; vi.spyOn(service, "save");',
      'import { vi } from "vitest"; import hook from "@/hooks/use-user"; vi.spyOn(hook, "load");',
      'import { vi } from "vitest"; import { service } from "./meeting.service"; const alias = service; vi.spyOn(alias, "save");',
      'import { vi } from "vitest"; import { services } from "./index"; const { meeting } = services; vi.spyOn(meeting, "save");',
      'import { vi } from "vitest"; import { services } from "./index"; const spy = vi.spyOn; spy(services.meeting, "save");',
      'import { vi } from "vitest"; const dao = await import("./meeting.dao"); vi.spyOn(dao, "save");',
      'import { vi } from "vitest"; vi.spyOn(await import("./meeting.dao"), "save");',
    ].map(code => ({
      code,
      output: null,
      errors: [{ messageId: 'internalModule' }],
    })),
    {
      code: 'import { vi } from "vitest"; vi.mock("@/hooks/use-user");',
      filename: '/repo/client/src/features/auth/auth.test.ts',
      options: [{ boundary: 'client' }],
      output: null,
      errors: [
        {
          messageId: 'internalModule',
          data: {
            method: 'vi.mock',
            target: '@/hooks/use-user',
            boundary: 'client',
          },
        },
      ],
    },
    {
      code: 'import { vi } from "vitest"; import { dao } from "./meeting.dao"; vi.spyOn(dao, "save");',
      filename: '/repo/server/src/meeting/meeting.test.integration.ts',
      options: [{ boundary: 'server' }],
      output: null,
      errors: [
        {
          messageId: 'internalModule',
          data: {
            method: 'vi.spyOn',
            target: './meeting.dao',
            boundary: 'server',
          },
        },
      ],
    },
  ],
});
