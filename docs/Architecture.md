# Architecture Overview

> This document is a high-level alias/index for investor and partner audiences.
> The full engineering detail lives in [`docs/architecture-overview.md`](architecture-overview.md)
> and the security-specific breakdown is in [`docs/security/threat-model.md`](security/threat-model.md).

---

## System summary

SquadRidge is a privacy-first, real-time peer-support platform. The architecture is designed to:

1. **Minimise identity linkage** — users interact via ephemeral handles, not persistent identities.
2. **Encrypt everything** — messages are encrypted at rest (AES-GCM, KMS-wrapped keys) and in transit (TLS 1.3).
3. **Degrade gracefully** — the app remains functional (offline mode, demo flows) when backend services are unavailable.

---

## High-level components

```
Browser (React / TypeScript)
  │
  ├── Vite SPA bundle
  │     ├── Onboarding + intent capture
  │     ├── Matchmaking UI (waits on Edge queue)
  │     ├── Session / squad room (real-time messages)
  │     └── Pitch deck hub (investor materials)
  │
  ├── src/middleware/      ← request anonymizer, rate-limiter (scaffold — wire to server runtime)
  ├── src/utils/           ← Supabase client, Sentry config, AES-GCM encryption helpers
  │
  ▼
Supabase (BaaS)
  ├── PostgreSQL (partitioned messages table, RLS policies, pg_cron retention)
  ├── Auth (anonymous sign-in, magic-link)
  ├── Realtime (squad messaging channel)
  └── Edge Functions (matchmaking, rate-limit assertions, ZK verification)
  
Upstash Redis (scaffold)   ← rate-limiter token store (wire in production)
AWS KMS / equivalent       ← wraps AES-GCM data-keys for message encryption (scaffold)
Sentry                     ← error monitoring with PII scrubbing (scaffold — wire DSN)
```

---

## Data flow: message send

```
1. User types message in browser
2. SPA applies client-side redaction (email/phone pattern removal)
3. Message passed to encryption helper (src/utils/encryption.ts)
     → KMS data-key fetched (or cached ephemerally)
     → AES-GCM encrypt with random IV
     → ciphertext + IV sent to Supabase via authenticated REST call
4. Supabase RLS policy verifies session token
5. Ciphertext stored in messages partition for current month
6. Supabase Realtime broadcasts ciphertext to squad members
7. Recipients decrypt with same ephemeral data-key
```

---

## Security controls summary

| Control | Status | Detail |
|---------|--------|--------|
| TLS 1.3 in transit | Active | Enforced by hosting (Netlify / Vercel) |
| AES-GCM at rest | Scaffold | `src/utils/encryption.ts` — wire KMS in production |
| Request anonymisation | Scaffold | `src/middleware/anonymizeRequest.ts` |
| Rate limiting | Scaffold | `src/middleware/rateLimiter.ts` — wire Redis |
| RLS (row-level security) | Active | All Supabase tables |
| ZK attribute verification | Active (stub/full) | `src/lib/zkVerifier.ts` |
| Sentry PII scrubbing | Scaffold | `src/utils/sentry.ts` |
| Secrets scan | Active | `scripts/scan-secrets.sh` + pre-commit hook |
| Dependency scanning | Active | Dependabot (`.github/dependabot.yml`) |
| E2EE | Roadmap Q3 2026 | See `ROADMAP.md` |

---

## See also

- [`docs/architecture-overview.md`](architecture-overview.md) — full engineering detail
- [`docs/security/threat-model.md`](security/threat-model.md) — assets, adversaries, current guarantees
- [`docs/security/encryption-scope.md`](security/encryption-scope.md) — what is and is not encrypted
- [`openapi.yaml`](../openapi.yaml) — REST API contract
- [`ROADMAP.md`](../ROADMAP.md) — upcoming architecture changes
