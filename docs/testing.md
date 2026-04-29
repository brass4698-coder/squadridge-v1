# Testing

**Unit and integration tests:** [Vitest](https://vitest.dev/) — `npm test` / `npm run test:watch` / `npm run test:coverage`.

- Config: [vite.config.ts](../vite.config.ts) (`test` block).
- Tests: `src/**/*.{test,spec}.{ts,tsx}`.
- Setup: [src/test/setupTests.ts](../src/test/setupTests.ts).

**End-to-end:** [Playwright](https://playwright.dev/) — `npm run e2e` / `npm run e2e:ui`.

- Config: [playwright.config.ts](../playwright.config.ts) runs `npm run build:e2e` (uses [.env.e2e](../.env.e2e) so `/match?demo=1` is enabled in the preview bundle).
- Specs: [e2e/](../e2e/).
- **Optional staging-only specs.** Two specs are gated on `PLAYWRIGHT_STAGING_BASE_URL` so `npm run e2e` stays hermetic against placeholder Supabase creds. They run when the env var points at a deployed app:
  - [`e2e/verification-staging.spec.ts`](../e2e/verification-staging.spec.ts) renders `/verify` against a real ZK-enabled host.
  - [`e2e/ingest-message-staging.spec.ts`](../e2e/ingest-message-staging.spec.ts) covers the authenticated ingest-message + Realtime path: anonymous sign-in, `create_demo_squad`, message send via the Edge Function, and Realtime round-trip. Requires the deploy to have anonymous auth, `VITE_ENABLE_DEMO_SQUAD=true`, the `ingest-message` Edge Function deployed, and Realtime enabled on `public.messages`.

  Run with `PLAYWRIGHT_STAGING_BASE_URL=https://staging.example.com npm run e2e -- e2e/ingest-message-staging.spec.ts`.

**CI:** [.github/workflows/ci.yml](../.github/workflows/ci.yml) runs lint, Vitest, production build, Playwright, and applies Supabase migrations locally to catch SQL errors.

**Production readiness script:** `node scripts/check-prod-readiness.mjs`
