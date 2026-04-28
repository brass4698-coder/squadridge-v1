/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (mode === 'production' && env.VITE_ZK_STUB === 'true') {
    throw new Error(
      'Production build blocked: VITE_ZK_STUB=true ships hash-only ZK stubs (no Semaphore, no Edge verification). Remove it from .env.production and hosting env for release builds.',
    );
  }
  if (
    mode === 'production' &&
    env.VITE_SEMAPHORE_DEMO_GROUP === 'true' &&
    env.VITE_ALLOW_DEMO_DECOYS_IN_PROD !== 'true'
  ) {
    throw new Error(
      'Production build blocked: VITE_SEMAPHORE_DEMO_GROUP=true ships bundled Squadridge Semaphore decoys, ' +
        'which collapses the anonymity set (see docs/technical/rfc-issuer-managed-anonymity-group.md). ' +
        'Either unset the flag for production or set VITE_ALLOW_DEMO_DECOYS_IN_PROD=true ' +
        'for a deliberate internal-demo build (CI prod release jobs must not set this).',
    );
  }

  return {
    plugins: [
      react(),
      process.env.ANALYZE === '1' &&
        visualizer({
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
          open: false,
        }),
    ].filter(Boolean),
    test: {
      environment: 'jsdom',
      globals: false,
      include: ['src/**/*.{test,spec}.{ts,tsx}', 'supabase/functions/**/*.{test,spec}.ts'],
      setupFiles: ['./src/test/setupTests.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary', 'html', 'lcov'],
        reportsDirectory: './coverage',
        /**
         * Critical paths measured for baseline thresholds (auth guard, session gate, ZK helpers, squad bootstrap).
         * Excludes `zkAdapter.runVerification` (Edge + dynamic imports); stub path is covered via `zkVerifier` tests.
         */
        include: [
          'src/components/auth/RequireAuth.tsx',
          'src/components/session/SessionAccess.tsx',
          'src/lib/authUrls.ts',
          'src/lib/squad.ts',
          'src/lib/zkVerifier.ts',
          'src/lib/zk/buildAnonymityGroup.ts',
          'src/lib/zk/semaphoreFieldEncoding.ts',
          'src/lib/zk/semaphoreIdentityStorage.ts',
          'src/lib/zk/serializeSemaphoreProof.ts',
        ],
        exclude: ['**/*.d.ts', '**/*.test.*', '**/*.spec.*', '**/test/**'],
        thresholds: {
          lines: 60,
          statements: 60,
          functions: 55,
          branches: 50,
        },
      },
    },
    worker: {
      format: 'es',
    },
    optimizeDeps: {
      // Dev-only: pre-bundling can break Transformers.js; keep it out of the optimizer.
      // The translation worker dynamically imports `translationWorkerImpl`, which pulls
      // `@xenova/transformers` into a separate async chunk — it is not part of the main bundle.
      exclude: ['@xenova/transformers'],
    },
  };
});
