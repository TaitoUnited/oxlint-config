// @vitest-environment node

import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

import { rule } from './rule.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'tsx' }, sourceType: 'module' },
});

const filename = '/repo/src/features/user/user-toolbar.tsx';

ruleTester.run('tanstack-router-no-route-imports', rule, {
  valid: [
    ...[
      "import type { UserData } from './user.route';",
      "import { type UserData } from './user.route';",
      "export type { UserData } from './user.route';",
      "const UserRoute = lazyRouteComponent(() => import('./user.route'));",
      "import { getRouteApi } from '@tanstack/react-router';\n\nconst userRoute = getRouteApi('/users/$userId');",
      "import { UserCard } from './user-card';",
      "import { router } from './router';",
    ].map(code => ({ code, filename })),
    {
      code: "import { Route as UserRoute } from './features/user/user.route';",
      filename: '/repo/src/route-tree.gen.ts',
    },
    {
      code: "import { Route } from './user.page';",
      filename,
      options: [{ routeModulePattern: String.raw`\.route$` }],
    },
  ],
  invalid: [
    ...[
      "import { Route } from './user.route';",
      "import { UserData, Route } from '@/features/user/user.route.tsx';",
      "import { type UserData, Route } from './user.route';",
      "export { Route } from './user.route';",
      "export * from '../user/user.route';",
    ].map(code => ({
      code,
      filename,
      errors: [{ messageId: 'routeImport' }],
    })),
    {
      code: "import { Route } from './user.page';",
      filename,
      options: [{ routeModulePattern: String.raw`\.page$` }],
      errors: [{ messageId: 'routeImport', data: { source: './user.page' } }],
    },
  ],
});
