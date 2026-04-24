# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Investor-readiness repo artifacts: `INVESTOR_READINESS_AUDIT.md`, current-state and diligence docs, pilot-runbook docs, metrics spec, and partner-facing support docs.
- Prod checks: `npm run check:prod-readiness`; Playwright `npm run e2e`; staging workflow scaffold (`.github/workflows/deploy-staging.yml`).
- Edge: `rate-limit` (Upstash) + `assertEdgeRateLimit`; shared CORS via `ALLOWED_ORIGINS`.
- DB: `role_other_detail` CHECK; message/match_queue TTL + `pg_cron` cleanup where available; revoke `matchmaking_enqueue_and_try` from `anon`.
- CSP on Netlify/Vercel; bundle stats via `rollup-plugin-visualizer` when `ANALYZE=1`; optional in-memory Semaphore identity.
- Gitignore Playwright output dirs.

### Changed

- Landing flow upgraded for clearer investor-storytelling, stronger CTA hierarchy, richer motion/surface polish, and improved request-access presentation.
- Header and mobile navigation now surface request access, ledger, and security paths more directly.
- Waitlist capture UX upgraded with a stronger visual container and clearer feedback states.
- `.agents/` gitignored (not shipped in repo).
- `/admin/health` mod-only; ZK Edge CORS not wildcard; prod build requires `VITE_SENTRY_DSN`.
- Optional sentiment uses `@xenova/transformers` when `VITE_ENABLE_AI=true`; infra doc matches app-layer crypto + TTL.

## [0.0.1] — 2026-04-17

### Added

- Initial public snapshot: Vite + React SPA, Supabase auth/realtime, Semaphore ZK path, demo walkthrough, session/squad messaging, ledger and moderator routes.
