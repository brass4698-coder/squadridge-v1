# Architecture Overview

**Status: Scaffold — component diagram reflects current MVP architecture**
**Last updated: 2026-04-28**

For the full security analysis see [threat-model.md](../docs/security/threat-model.md). For trust boundaries specifically, see that document's §4.

---

## Component diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Browser client (React + Vite)                                              │
│                                                                             │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────────────────┐ │
│  │  Auth / ZK   │  │  Squad / Chat │  │  Matchmaking / Queue             │ │
│  │  (Semaphore) │  │  (AES-GCM)    │  │  (intent tags → pool_key)        │ │
│  └──────┬───────┘  └──────┬────────┘  └───────────────┬──────────────────┘ │
│         │                 │                           │                      │
└─────────┼─────────────────┼───────────────────────────┼──────────────────────┘
          │ HTTPS            │ HTTPS                     │ HTTPS + Realtime WS
          ▼                 ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Supabase platform                                                          │
│                                                                             │
│  ┌─────────────────────┐    ┌──────────────────────────────────────────┐   │
│  │  Edge Functions     │    │  Postgres (RLS, pgcrypto, pg_cron)       │   │
│  │                     │    │                                          │   │
│  │  verify-zk-proof    │───▶│  auth.users          (identity)         │   │
│  │  ingest-message     │───▶│  messages            (ciphertext)       │   │
│  │  rate-limit         │    │  squads              (keys + metadata)  │   │
│  │  matchmaking sweep  │    │  match_queue         (ephemeral)        │   │
│  │                     │    │  zk_proof_submissions(nullifiers)       │   │
│  └─────────────────────┘    │  moderation_audit_log(tamper-resistant) │   │
│                             └──────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────┐    ┌─────────────────────────────────────────┐    │
│  │  Supabase Auth      │    │  Supabase Realtime                      │    │
│  │  (magic link / anon)│    │  (squad channels, ephemeral presence)   │    │
│  └─────────────────────┘    └─────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
          │                                           │
          ▼                                           ▼
┌────────────────────┐                    ┌─────────────────────────────────┐
│  Upstash Redis     │                    │  Sentry (error telemetry)       │
│  (rate-limit state)│                    │  (PII scrubbed via beforeSend)  │
└────────────────────┘                    └─────────────────────────────────┘
```

---

## Data flow: sending a message

```
Browser                   Edge (ingest-message)           Postgres
  │                               │                           │
  ├── 1. Encrypt plaintext ──────▶│                           │
  │   (AES-256-GCM, squad key)    │                           │
  │                               ├── 2. Verify auth JWT ───▶│
  │                               ├── 3. Rate-limit check ──▶│ (Redis)
  │                               ├── 4. Decrypt ciphertext ─┤
  │                               ├── 5. Server-side redact  │
  │                               ├── 6. Re-encrypt ─────────┤
  │                               ├── 7. INSERT (service role)▶
  │                               │                           │
  │◀── 8. Realtime broadcast ─────────────────────────────────┤
  │   (all squad members receive                              │
  │    the ciphertext; each client                            │
  │    decrypts with the squad key)                           │
```

**Key point:** The server decrypts, redacts (policy enforcement), and re-encrypts before persistence. This is not E2E — the Edge Function sees plaintext. See `docs/security/threat-model.md §5`.

---

## Data flow: ZK proof verification

```
Browser (Semaphore)        Edge (verify-zk-proof)     Postgres
  │                                │                      │
  ├── 1. Generate Semaphore proof  │                      │
  │      (in-browser, ~2–8 s)      │                      │
  ├── 2. POST proof + root ───────▶│                      │
  │                                ├── 3. Verify root ───▶│ (issuer_groups)
  │                                ├── 4. Verify proof    │
  │                                ├── 5. Check nullifier▶│ (dedup)
  │                                ├── 6. INSERT submission▶
  │                                │      (user_id + proof)│
  │◀── 7. verified_attribute_id ───┤                      │
```

---

## Key architectural decisions and tradeoffs

| Decision | Rationale | Tradeoff |
|----------|-----------|----------|
| Supabase (managed Postgres + Auth) | Speed to market; built-in RLS, Realtime, Auth | Operator-readable data; vendor lock-in risk |
| AES-256-GCM with per-squad keys | Simpler than E2E; protects against accidental exposure | Not cryptographically E2E; no forward secrecy |
| Edge-only message inserts | Non-bypassable server-side redaction | Adds latency; single point of failure |
| Semaphore for ZK proofs | Mature library; in-browser proof generation | Proof generation is slow (2–8 s); group management complexity |
| Upstash Redis for rate limiting | Serverless-friendly; compatible with Edge Functions | Additional vendor; extra cost at scale |
| Anonymous Supabase sessions | No friction sign-up; preserves anonymity | Persistent `user_id` still exists server-side |

---

## Infrastructure components (external dependencies)

| Component | Provider | Purpose | Notes |
|-----------|----------|---------|-------|
| Database + Auth | Supabase | All persistent data | See Supabase DPA; primary data processor |
| Edge Functions | Supabase (Deno) | Message ingest, ZK verify, rate limit | Service-role access; part of TCB |
| Realtime | Supabase | Squad message channels | Ephemeral; no persistence on Realtime layer |
| Error monitoring | Sentry | Crash telemetry | PII scrubbed; DSN is optional |
| Rate limiting | Upstash Redis | Abuse prevention | Volatile; fails open if unavailable |
| Hosting (web) | Vercel / Netlify | Static frontend | No server-side rendering |

---

## What this diagram does NOT show

- CDN layer (Vercel/Netlify edge caching for static assets)
- DNS / TLS termination
- Supabase's internal replication and backup infrastructure
- The Semaphore trusted issuer system (see `docs/technical/rfc-issuer-managed-anonymity-group.md`)

---

## Planned changes (roadmap)

1. **KMS-backed key wrapping** — wrap the squad message key with AWS KMS / Cloudflare D1 before storing in Postgres. Reduces "casual read" risk for a compromised DB.
2. **Server-side anonymize middleware** — deploy `src/middleware/anonymizeRequest.ts` in front of any Express/proxy layer handling raw requests.
3. **Partition-based retention** — automated `pg_cron` drops; audit log for each drop.
4. **True E2E** — MLS or Signal-style; plaintext never reaches the server. This restructures the entire data flow above.

---

*This document should be updated whenever the component diagram changes. It is a lagging indicator — if the code changed and this didn't, update this first.*
