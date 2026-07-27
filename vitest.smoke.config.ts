import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

/**
 * Backend smoke against local Supabase only.
 * `npm run test:smoke` — does not use the default vite test include globs.
 */
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/lib/__tests__/backend.smoke.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    setupFiles: [],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
