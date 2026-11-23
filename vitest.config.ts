import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['plugin/**/*.test.js', 'test/**/*.test.js'],
    exclude: ['**/node_modules/**', 'test/.tmp-*/**'],
    passWithNoTests: false,
    // Preset tests spawn the Oxlint CLI with the type-aware backend.
    testTimeout: 60_000,
  },
});
