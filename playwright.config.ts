import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'src/tests',

  testIgnore: '*test-assets',

  testMatch: '**/*.test.ts',
});