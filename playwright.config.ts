import { defineConfig } from '@playwright/test';

const previewPort = 4173;
const previewOrigin = `http://127.0.0.1:${previewPort}`;

/**
 * Playwright projects:
 *
 *   - `default`   — hermetic e2e suite (`smoke`, `onboarding`, `matchmaking`,
 *                   `ledger`, `pitch-deck-gating`, `session-messaging`).
 *                   `npm run e2e` defaults to this project.
 *   - `staging`   — opt-in staging-only specs (`*-staging.spec.ts`). Run with
 *                   `npx playwright test --project=staging`.
 *   - `demo-capture` — full-page screenshot capture of the scripted tour.
 *                   Run with `npm run demo:capture`. Skipped by default so a
 *                   fast `npm run e2e` doesn't pay the per-step settle window.
 */

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
  projects: [
    {
      name: 'default',
      testIgnore: [/.*-staging\.spec\.ts$/, /demo-capture\.spec\.ts$/],
    },
    {
      name: 'staging',
      testMatch: /.*-staging\.spec\.ts$/,
    },
    {
      name: 'demo-capture',
      testMatch: /demo-capture\.spec\.ts$/,
      retries: 0,
      use: {
        viewport: { width: 1440, height: 900 },
        video: 'on',
      },
    },
  ],
});
