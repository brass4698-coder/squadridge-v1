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
      exclude: ['@xenova/transformers'],
    },
  };
});
