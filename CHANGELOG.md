# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- CSP tightened: `script-src` no longer allows `'unsafe-inline'` or `'unsafe-eval'`
  (retained `'wasm-unsafe-eval'` for Semaphore/snarkjs WASM). See `vercel.json`,
  `netlify.toml`.
- `CODEOWNERS` expanded from a single catch-all to per-path ownership for
  `supabase/migrations/`, `supabase/functions/`, cryptography (`messageCrypto`,
  `messagePayload`, `squadMessageKey`, `liveMessageRedaction`, `moderation/`,
  `redaction-engine/`), ZK (`zk/`, `zkAdapter`, `zkVerifier`), auth
  (`AuthContext`, `auth/`, `authUrls`, `sessionClaim`), env validation
  (`env.ts`, `env-bootstrap.ts`, Sentry), hosting headers, CI, and public
  trust docs (`SECURITY.md`, `PRIVACY_POLICY.md`, `DATA_RETENTION.md`, …).
- `PRIVACY_POLICY.md` no longer claims the in-product "Leave and forget"
  control triggers a server-side delete; reconciled against `DATA_RETENTION.md`
  so the three trust docs (policy, retention, threat model) agree.
- Supabase clients consolidated: single `createClient` call in
  `src/lib/supabase.ts`; `src/utils/supabase.ts`, `src/lib/supabaseClient.ts`,
  and `src/onboarding/lib/supabase/client.ts` now re-export (or delegate to)
  the canonical singleton. Eliminates the risk of two auth sessions in the
  same browser tab.

### Removed

- `docker-compose.yml` (optional local Redis stub that was never on the
  product path; rate limiting uses Upstash REST via the `rate-limit` Edge
  Function, and matchmaking uses Postgres + RPCs).
- `src/lib/ephemeral/matchingQueue.ts` and `src/lib/ephemeral/rateLimit.ts` —
  dead code with zero callers (`allowClientBurst`, `createSupabaseMatchingQueue`,
  `createNoOpMatchingQueue`, `createMatchingSnapshotReader`,
  `createRedisMatchingQueueFromEnv`). Matchmaking ships through
  `src/lib/matchmakingClient.ts`; Edge rate limits through
  `src/lib/rateLimitEdge.ts`.

### Moved

- `INVESTOR_READINESS_AUDIT.md` → `docs/business/investor-readiness-audit.md`
  (retrospective polish notes, not a root-level partner doc).

## [0.1.0] — 2026-04-30

Pilot readiness and security hardening. Not yet a tagged release in CI until
the cleanup above lands; see the `Unreleased` section for post-`0.1.0`
work-in-progress.

### Added

- **Edge-only message ingest** (`supabase/migrations/20260428194500_messages_insert_edge_only.sql`):
  direct authenticated INSERTs into `public.messages` are denied by RLS
  (`WITH CHECK (false)`). All chat writes flow through the `ingest-message`
  Edge Function (`supabase/functions/ingest-message/edgeHandler.ts`), which
  decrypts with the squad key, runs `redactOutgoingLiveMessage`, re-encrypts,
  and service-role inserts. Enforced on every CI `db` run by
  `supabase/tests/database/messages_insert_edge_only.test.sql` (pgTAP).
- **Audited moderator decrypt RPC** (`supabase/migrations/20260428120000_moderator_decrypt_audit_rpc.sql`
  + `20260428250000_moderator_decrypt_audit_hardening.sql`): moderators must
  invoke an RPC that records a `message_plaintext_decrypt_review` row in
  `moderation_audit_log` with a ≥8-character justification **before** returning
  plaintext. Wired through `src/lib/moderation/modDecrypt.ts` and surfaced in
  `ModDashboardPage.tsx`.
- **Archived squad encryption snapshot** (`supabase/migrations/20260428123000_archive_squad_encryption_snapshot.sql`):
  preserves the squad message key + epoch metadata when a squad is archived,
  so historical decrypt-for-review continues to work without keeping the live
  key indefinitely.
- **Issuer-managed anonymity groups implemented end-to-end** (RFC status:
  Draft → Implemented v1): `supabase/migrations/20260428240000_issuer_groups.sql`,
  client manifest verification in `src/lib/zk/issuerManifest.ts` and
  `src/lib/zk/issuerRegistry.ts`, Edge cross-check of `proof.merkleTreeRoot`
  against `public.issuer_groups.current_root` in
  `supabase/functions/_shared/handleZkProofVerification.ts` (rejects
  `STALE_PROOF_ROOT`). Bundled demo decoys are gated behind both
  `VITE_SEMAPHORE_DEMO_GROUP` and `VITE_ALLOW_DEMO_DECOYS_IN_PROD`; CI prod
  release jobs reject the latter via `scripts/ensure-no-demo-decoys-prod.mjs`
  and `vite.config.ts`.
- **Atomic `create_demo_squad` RPC** (`supabase/migrations/20260428220000_create_demo_squad_rpc.sql`),
  **pre-trigger demo squad key rotation** (`20260428210000_rotate_pre_trigger_demo_squad_keys.sql`),
  and **demo claim consent token** (`20260428230000_demo_claim_consent_token.sql`
  + `20260428124500_demo_session_claim.sql`).
- **Atomic `get_or_create_squad_message_key` RPC**
  (`supabase/migrations/20260429120000_squads_get_or_create_message_key_rpc.sql`)
  so matchmaking-created squads never depend on "first client message" for
  key material. Follow-up fix defaults `is_moderator` to `FALSE` in the same
  RPC.
- **Sentry PII hardening**: `src/lib/sentry.ts` beforeSend sanitiser +
  salted SHA-256 user id (`src/lib/sentryUserHash.ts`). `src/lib/env.ts` refuses
  to ship a production build with `VITE_SENTRY_DSN` set but
  `VITE_SENTRY_USER_HASH_SALT` missing.
- **Crisis alerts** (`supabase/migrations/20260428260000_crisis_alerts.sql`,
  `supabase/functions/crisis-alert/index.ts`) with a dedicated Edge rate-limit
  bucket so chat throttling does not suppress emergencies.
- **Ledger publish workflow**
  (`supabase/migrations/20260430120000_ledger_proposal_votes.sql` +
  `supabase/functions/publish-ledger-proposal/`): member voting on
  `ledger_proposal_votes` with RLS-scoped insert and a moderator-gated Edge
  Function that enforces a 2/3 participation + majority-approve threshold
  before flipping `status='published'`.
- **Retention monitoring** (`supabase/migrations/20260429140000_retention_cleanup_metrics.sql`):
  `pilot_retention_cleanup_24h` view surfaces the hourly TTL cron outcome so
  operators can alert when the last bucket is older than 90 minutes.
- **Pilot observability views** (`supabase/migrations/20260428270000_pilot_observability_views.sql`)
  and **Conflict Severity Index** schema
  (`supabase/migrations/20260427120000_conflict_severity_index.sql`) with
  mediator read UI at `/admin/csi`.
- **User notification preferences**
  (`supabase/migrations/20260430130000_user_notification_prefs.sql`).
- **Honest trust docs**: `PRIVACY_POLICY.md`, `DATA_RETENTION.md`, `SECURITY.md`,
  `DILIGENCE_OVERVIEW.md`, `CURRENT_STATUS.md`, and
  `docs/adr/004-defer-operator-blind-e2e.md` formalising the decision to ship
  operator-readable encryption with audited moderator access rather than
  prematurely claiming E2E.
- **Supply-chain hygiene**: `actions/dependency-review-action@v4` on PRs
  (fails on newly introduced high/critical advisories); informational
  `npm audit --omit=dev` summary with dispositions in
  `docs/security/dependency-advisories.md`.
- **Pitch Deck Hub** scaffolding (`src/pitch-deck-hub/`,
  `public/pitch-deck-hub/`) and CSI dev tooling
  (`supabase/functions/admin-csi-sample-insert/index.ts`,
  `src/pages/admin/AdminCsiPage.tsx`).

### Changed

- Landing page, header, mobile drawer, waitlist capture, testimonial/footer
  rebuilt for investor-legible presentation with stronger CTA hierarchy.
- `/admin/health` restricted to moderators; ZK Edge CORS no longer wildcard;
  prod build requires `VITE_SENTRY_DSN` + `VITE_SENTRY_USER_HASH_SALT` (or
  neither).
- `messages.payload_ciphertext` rename
  (`supabase/migrations/20260418120000_messages_payload_ciphertext_rename.sql`)
  replaced ambiguous `payload` naming.
- `infrastructure.md` and `architecture-overview.md` updated to reflect the
  shipped **pure BaaS** pattern (Supabase + Edge, no Node tier, no Redis in
  the product path).

### Security

- Revoked `matchmaking_enqueue_and_try` from `anon`
  (`supabase/migrations/20260418100000_revoke_anon_matchmaking.sql`).
- TTL + `pg_cron` cleanup installed
  (`supabase/migrations/20260418090000_ttl_cleanup.sql`).
- Sweep cron + metrics
  (`supabase/migrations/20260420120000_matchmaking_sweep_cron.sql`,
  `20260420140000_matchmaking_sweep_metrics.sql`).

## [0.0.1] — 2026-04-17

### Added

- Initial public snapshot: Vite + React SPA, Supabase auth/realtime,
  Semaphore ZK path, demo walkthrough, session/squad messaging, ledger and
  moderator routes.
