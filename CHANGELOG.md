# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Production readiness: `npm run check:prod-readiness` script; Playwright E2E (`npm run e2e`) with `playwright.config.ts` and `e2e/onboarding.spec.ts`.
- Staging-oriented GitHub Actions workflow `.github/workflows/deploy-staging.yml` (build, Vitest, prod check, Playwright; deploy steps left as comments for project secrets).
- Edge Function `rate-limit` (Upstash Redis) and client `assertEdgeRateLimit` before matchmaking, message send, and moderator flag.
- Shared Edge CORS helper `supabase/functions/_shared/cors.ts` using `ALLOWED_ORIGINS`.
- Migrations: `profiles.role_other_detail` CHECK (8–100 chars); message/match_queue `expires_at`, TTL triggers, indexes, hourly `pg_cron` cleanup; `REVOKE` `matchmaking_enqueue_and_try` from `anon`.
- CSP headers in `netlify.toml` and `vercel.json`.
- Bundle analysis: `rollup-plugin-visualizer` when `ANALYZE=1`.
- `getOrCreateSessionIdentity({ inMemoryOnly })` for non-persistent Semaphore identity.
- `.gitignore` entries for Playwright `test-results/` and reports.

### Changed

- **Repo:** `.agents/` is gitignored and no longer tracked (keep local IDE skills on your machine only).
- **Security:** Removed public `/dev/supabase`; health UI is `/admin/health` behind `RequireAuth` + `RequireModerator`. Navigation and README updated.
- ZK Edge handlers: CORS no longer uses `*`; origins must match `ALLOWED_ORIGINS`.
- **Sentry:** Production builds require `VITE_SENTRY_DSN` (`initSentry` throws if missing).
- **AI:** Optional tone path uses `@xenova/transformers` sentiment when `VITE_ENABLE_AI=true`, with heuristic fallback.
- **Docs:** `docs/technical/infrastructure.md` aligned with application-layer encryption, TTL, and operational model.

## [0.0.1] — 2026-04-17

### Added

- Initial public snapshot: Vite + React SPA, Supabase auth/realtime, Semaphore ZK path, demo walkthrough, session/squad messaging, ledger and moderator routes.
