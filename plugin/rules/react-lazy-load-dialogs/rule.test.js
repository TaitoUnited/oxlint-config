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

const filename = '/repo/client/src/features/meeting/meeting-dialog-details.tsx';

ruleTester.run('react-lazy-load-dialogs', rule, {
  valid: [
    ...[
      'import loadable from "@loadable/component"; const MeetingEditDialog = loadable(() => import("./meeting-dialog-edit").then(mod => mod.MeetingEditDialog));',
      'import { Dialog, useScopedDialog } from "@/components/ui/dialog";',
      'import type { MeetingEditDialog } from "./meeting-dialog-edit";',
      'import { type MeetingEditDialog } from "./meeting-dialog-edit";',
      'import { MeetingDialogHeader } from "./meeting-dialog-header";',
      'import { useMeetingDialog } from "./use-meeting-dialog";',
      'import { SomeDialog } from "react-aria-components";',
    ].map(code => ({ code, filename })),
    {
      code: 'import { Dialog } from "../dialog";',
      filename: '/repo/client/src/components/ui/alert-dialog/index.tsx',
    },
    {
      code: 'import { FeatureFlagDialog } from "./feature-flag-dialog";',
      filename: '/repo/client/src/feature-flags/feature-flags.test.tsx',
    },
    {
      code: 'import { MeetingEditDialog } from "./meeting-dialog-edit";',
      filename:
        '/repo/client/src/features/meeting/meeting-dialog-edit.stories.tsx',
    },
  ],
  invalid: [
    ...[
      'import { MeetingEditDialog } from "./meeting-dialog-edit";',
      'import { CreateMeetingAgendaDialog } from "../meeting-agenda/meeting-agenda-dialog-create";',
      'import { CreateProjectDialog as Create } from "@/features/projects/project-dialog-create";',
    ].map(code => ({
      code,
      filename,
      errors: [{ messageId: 'staticDialogImport' }],
    })),
    {
      code: 'import FeatureFlagDialog from "@/feature-flags/feature-flag-dialog";',
      filename,
      errors: [{ messageId: 'staticDefaultDialogImport' }],
    },
  ],
});

ruleTester.run('react-lazy-load-dialogs with ignorePattern', rule, {
  valid: [
    {
      code: 'import { ConfirmDialog } from "~/design-system/confirm-dialog";',
      filename: '/repo/src/views/settings.tsx',
      options: [{ ignorePattern: String.raw`design-system` }],
    },
  ],
  invalid: [
    {
      // The default UI kit path is no longer ignored once the pattern is replaced.
      code: 'import { ConfirmDialog } from "@/components/ui/confirm-dialog";',
      filename: '/repo/src/views/settings.tsx',
      options: [{ ignorePattern: String.raw`design-system` }],
      errors: [{ messageId: 'staticDialogImport' }],
    },
  ],
});

ruleTester.run('react-lazy-load-dialogs with React lazy', rule, {
  valid: [
    {
      code: 'import { lazy } from "react"; const MeetingEditDialog = lazy(() => import("./meeting-dialog-edit").then(mod => ({ default: mod.MeetingEditDialog })));',
      filename,
      options: [{ loader: 'lazy' }],
    },
  ],
  invalid: [
    {
      code: 'import { MeetingEditDialog } from "./meeting-dialog-edit";',
      filename,
      options: [{ loader: 'lazy' }],
      errors: [
        {
          message:
            'Lazy-load "MeetingEditDialog" with `lazy(() => import("./meeting-dialog-edit").then(mod => ({ default: mod.MeetingEditDialog })))` and preload it on user interaction. Dialogs are not initially visible and should stay out of the importing bundle.',
        },
      ],
    },
    {
      code: 'import FeatureFlagDialog from "@/feature-flags/feature-flag-dialog";',
      filename,
      options: [{ loader: 'lazy' }],
      errors: [
        {
          message:
            'Lazy-load "FeatureFlagDialog" with `lazy(() => import("@/feature-flags/feature-flag-dialog"))` and preload it on user interaction. Dialogs are not initially visible and should stay out of the importing bundle.',
        },
      ],
    },
    {
      // loadable stays the default.
      code: 'import { MeetingEditDialog } from "./meeting-dialog-edit";',
      filename,
      errors: [
        {
          message:
            'Lazy-load "MeetingEditDialog" with `loadable(() => import("./meeting-dialog-edit").then(mod => mod.MeetingEditDialog))` and preload it on user interaction. Dialogs are not initially visible and should stay out of the importing bundle.',
        },
      ],
    },
  ],
});
