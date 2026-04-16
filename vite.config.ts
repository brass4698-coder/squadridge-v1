/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (mode === 'production' && env.VITE_ZK_STUB === 'true') {
    throw new Error(
      'Production build blocked: VITE_ZK_STUB=true ships hash-only ZK stubs (no Semaphore, no Edge verification). Remove it from .env.production and hosting env for release builds.',
    );
  }

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: false,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      setupFiles: ['./src/test/setupTests.ts'],
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
