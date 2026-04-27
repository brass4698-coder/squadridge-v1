import { defineConfig } from '@playwright/test';

const previewPort = 4173;
const previewOrigin = `http://127.0.0.1:${previewPort}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  webServer: {
    /** `build:e2e` loads `.env.e2e` so `/match?demo=1` works without relying on shell env (Windows-safe). */
    command: `npm run build:e2e && npm run preview -- --port ${previewPort} --strictPort --host 127.0.0.1`,
    url: previewOrigin,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? previewOrigin,
    trace: 'on-first-retry',
  },
});
