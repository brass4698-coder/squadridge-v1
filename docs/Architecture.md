# Architecture and Threat Model

This document provides a high-level architecture summary and a condensed threat model for SquadRidge. For the full engineering detail see [docs/technical/architecture-overview.md](./technical/architecture-overview.md) and [docs/security/threat-model.md](./security/threat-model.md).

---

## Component diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser / Client                        │
│                                                                 │
│  ┌────────────────────────┐   ┌──────────────────────────────┐  │
│  │  React / Vite SPA      │   │  Web Crypto (AES-256-GCM)    │  │
│  │  (TypeScript, strict)  │   │  Semaphore ZK proof gen      │  │
│  └──────────┬─────────────┘   └──────────────┬───────────────┘  │
│             │                                │                  │
└─────────────┼────────────────────────────────┼──────────────────┘
              │ HTTPS / WSS                    │ HTTPS
              ▼                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Supabase Cloud                           │
│                                                                 │
│  ┌─────────────┐  ┌───────────────┐  ┌────────────────────┐    │
│  │  Auth       │  │  PostgREST    │  │  Realtime          │    │
│  │  (JWT, ZK)  │  │  (RLS gates)  │  │  (subscriptions)   │    │
│  └──────┬──────┘  └───────┬───────┘  └────────┬───────────┘    │
│         │                 │                   │                 │
│         └─────────┬───────┘                   │                 │
│                   ▼                           │                 │
│  ┌────────────────────────────────────────────┴───────────────┐ │
│  │  PostgreSQL (RLS enforced, pg_cron retention jobs)         │ │
│  │  Encrypted at rest; squad keys in squads.message_enc_key   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Edge Functions (Deno)                                  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │ verify-zk    │  │ ingest-msg   │  │ rate-limit   │  │   │
│  │  │ -proof       │  │ (encrypt +   │  │ (Upstash     │  │   │
│  │  │              │  │  store)      │  │  Redis)      │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  │  ┌──────────────┐  ┌──────────────┐                     │   │
│  │  │ crisis-alert │  │ match-notify │                     │   │
│  │  └──────────────┘  └──────────────┘                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
              │
              │ Error events (PII-scrubbed)
              ▼
┌─────────────────────────┐
│  Sentry (observability)  │
│  before-send hook strips │
│  user text, long fields  │
└─────────────────────────┘
```

---

## Data flows

### 1. User joins a squad session

1. Browser generates Semaphore ZK proof (no identity revealed).
2. Proof sent to `verify-zk-proof` Edge Function → stored as `zk_proof_submissions` (commitment hash only).
3. `auth.users` row created / updated; session token issued.
4. Matchmaking queue entry inserted via `assertEdgeRateLimit` guard.

### 2. Message sent

1. Client retrieves squad AES-256-GCM key via `get_or_create_message_key` RPC (validated by RLS).
2. Message encrypted client-side → ciphertext sent to `ingest-message` Edge Function.
3. Edge Function stores ciphertext in `messages`; plaintext never touches the server.
4. Realtime subscription delivers ciphertext to other squad members, who decrypt in-browser.

### 3. Moderation review

1. Flagged content forwarded to `moderation_audit` (metadata only; no key access by default).
2. Authorised moderators use `moderator_decrypt_audit` RPC (logged, access-controlled).
3. Moderator actions append to immutable audit trail.

---

## Threat model (condensed)

| Threat | Mitigation | Residual risk |
|---|---|---|
| Re-identification via IP / UA logs | Request anonymisation middleware (hash + truncate); no raw IPs in persistent storage | Platform-layer Supabase logs (7-day TTL); restrict dashboard access |
| Message content breach | AES-256-GCM server-side encryption; keys in Postgres (restricted RLS) | Operator with service_role can access keys — KMS wrapping on roadmap |
| Double-spend / Sybil | ZK nullifier uniqueness enforced at DB level | Requires issuer to control group; demo decoys reduce anonymity set if enabled |
| Account enumeration | No username/email exposure; pseudonymous handles only | Auth timing side-channels (mitigated by Supabase JWT) |
| Denial of service | Redis-backed rate limiter (10 req/60 s per user per action) | Limits unauthenticated flood; CAPTCHA not yet implemented |
| Supply-chain compromise | Dependabot + dependency-review-action blocks new high/critical advisories | Transitive advisories documented in docs/security/dependency-advisories.md |
| Secrets in repository | Pre-commit hooks (lint-staged); gitleaks config; `.env.example` only | Manual rotation required if history contains secrets; see scripts/scan-git-secrets.sh |
| Sentry PII leakage | before-send hook strips user text, long strings, raw UUIDs | Operator must set VITE_SENTRY_DSN only in trusted environments |
| Moderator over-reach | Audit trail for all decrypt actions; access limited to authorised roles | No real-time monitoring of audit log access yet |
| Crisis disclosure mishandling | Crisis alert Edge Function; in-app resource card | Region-aware hotlines and auto-escalation on roadmap |

**Non-goals (explicit):**
- Signal-style E2EE against the platform operator (roadmap item).
- Protection against a fully compromised Supabase service-role credential.
- Content moderation at scale without human review.

See [docs/security/threat-model.md](./security/threat-model.md) for the full treatment including adversary profiles and pre-deployment gates.

---

## Environment configuration summary

All required environment variables are documented in [.env.example](../.env.example). Key variables for security-sensitive components:

| Variable | Required | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon/publishable key |
| `VITE_SENTRY_DSN` | Prod recommended | Sentry error reporting |
| `VITE_SENTRY_USER_HASH_SALT` | Prod required if DSN set | Salt for user ID hashing in Sentry |
| `UPSTASH_REDIS_REST_URL` | Prod recommended | Redis rate-limit backend |
| `UPSTASH_REDIS_REST_TOKEN` | Prod recommended | Redis auth token |
| `VITE_ZK_STUB` | Dev only (false in prod) | Disables real ZK proofs |

All secrets are consumed from environment variables. **Never commit secrets to the repository.** Use a cloud secret manager (AWS Secrets Manager, GCP Secret Manager, Vercel/Netlify env vars, Supabase Edge Function secrets) for production deployments.
