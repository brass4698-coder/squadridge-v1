# Testing

**Unit and integration tests:** [Vitest](https://vitest.dev/) — `npm test` / `npm run test:watch` / `npm run test:coverage`.

- Config: [vite.config.ts](../vite.config.ts) (`test` block).
- Tests: `src/**/*.{test,spec}.{ts,tsx}`.
- Setup: [src/test/setupTests.ts](../src/test/setupTests.ts).

**End-to-end:** [Playwright](https://playwright.dev/) — `npm run e2e` / `npm run e2e:ui`.

- Config: [playwright.config.ts](../playwright.config.ts) runs `npm run build:e2e` (uses [.env.e2e](../.env.e2e) so `/match?demo=1` is enabled in the preview bundle).
- Specs: [e2e/](../e2e/).

**CI:** [.github/workflows/ci.yml](../.github/workflows/ci.yml) runs lint, Vitest, production build, Playwright, and applies Supabase migrations locally to catch SQL errors.

**Production readiness script:** `node scripts/check-prod-readiness.mjs`
