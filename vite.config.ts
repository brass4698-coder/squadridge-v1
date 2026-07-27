/// <reference types="vitest/config" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

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
      'Production build blocked: VITE_SEMAPHORE_DEMO_GROUP=true ships bundled SquadRidge Semaphore decoys, ' +
        'which collapses the anonymity set (see docs/technical/rfc-issuer-managed-anonymity-group.md). ' +
        'Either unset the flag for production or set VITE_ALLOW_DEMO_DECOYS_IN_PROD=true ' +
        'for a deliberate internal-demo build (CI prod release jobs must not set this).',
    );
  }
  if (mode === 'production' && env.VITE_ENABLE_DEMO_LOGIN === 'true') {
    throw new Error(
      'Production build blocked: VITE_ENABLE_DEMO_LOGIN=true exposes password demo login in the client bundle. ' +
        'Unset for release builds or use a non-production staging environment.',
    );
  }
  if (mode === 'production' && env.VITE_V2_MOCK_DATA === 'true') {
    throw new Error(
      'Production build blocked: VITE_V2_MOCK_DATA=true serves facilitator session fixtures as the live workspace. ' +
        'Unset or set false for pilot and production builds.',
    );
  }

  return {
    resolve: {
      alias: {
        '@': path.resolve(rootDir, 'src'),
      },
    },
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
      // Local Docker smoke suite — run via `npm run test:smoke` (vitest.smoke.config.ts).
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.smoke.test.ts'],
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
    build: {
      rollupOptions: {
        output: {
          /**
           * Conservative vendor splits — keep React together; isolate heavy optional stacks
           * (charts / ZK / ML) so marketing first load does not pay for them.
           */
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/scheduler/')
            ) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('node_modules/motion') || id.includes('framer-motion')) {
              return 'motion';
            }
            if (id.includes('recharts') || id.includes('/d3-')) return 'charts';
            if (id.includes('@semaphore-protocol')) return 'zk';
            if (id.includes('@xenova/transformers')) return 'ml';
            if (id.includes('@sentry')) return 'sentry';
          },
        },
      },
    },
    optimizeDeps: {
      // Dev-only: pre-bundling can break Transformers.js; keep it out of the optimizer.
      // The translation worker dynamically imports `translationWorkerImpl`, which pulls
      // `@xenova/transformers` into a separate async chunk — it is not part of the main bundle.
      exclude: ['@xenova/transformers'],
    },
  };
});
