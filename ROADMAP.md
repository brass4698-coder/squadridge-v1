# Roadmap

**Last updated: 2026-04-28**
**Status: Living document — adjust dates as priorities evolve**

This is an honest, engineering-informed roadmap. Dates are targets, not promises. Each milestone links to relevant technical documentation. We call out open questions and dependencies explicitly.

---

## Current state (now)

- AES-256-GCM message encryption at the application layer (per-squad keys, server-generated)
- Edge-only message inserts with server-side redaction (`ingest-message` Edge Function)
- Semaphore ZK proofs verified server-side against issuer-managed anonymity groups
- Audited moderator decrypt (justification required, tamper-resistant log)
- Matchmaking with rate-limiting (Upstash Redis via Edge)
- Anonymous auth (Supabase anonymous sessions) — no email required for core flow
- CI with lint, TypeScript strict, tests, dependency review, and production build checks
- Threat model, encryption scope, and secrets rotation documented

**Honest gaps:** Not E2E encrypted. No forward secrecy. IP anonymization is a scaffold (not fully deployed server-side). No automated message partition deletion yet. No formal pentest.

---

## Milestone 1 — Security hardening (0–6 weeks)

**Goal:** Close the most important gaps before any pilot with real users.

- [ ] Deploy anonymize-request middleware server-side (wire `ANON_PEPPER`, test in staging) — see `src/middleware/anonymizeRequest.ts`
- [ ] Deploy Redis-backed rate limiter on all public endpoints — see `src/middleware/rateLimiter.ts`
- [ ] Wire `VITE_SENTRY_DSN` and `VITE_SENTRY_USER_HASH_SALT` in production; verify `beforeSend` scrubbing
- [ ] Automate message partition drops via `pg_cron` — see `scripts/retention_job.sql`
- [ ] Legal review of `PRIVACY_POLICY.md` and `DATA_RETENTION.md`
- [ ] Run gitleaks on repo history (`scripts/scan-secrets.sh`)
- [ ] Set up Dependabot auto-merge for non-breaking patch updates

---

## Milestone 2 — Pilot readiness (6–12 weeks)

**Goal:** Safe to invite the first 50–100 real users.

- [ ] Independent security review / pentest
- [ ] Break-glass procedure for service-role access (documented and tested)
- [ ] Message retention automated and audited (`partition_drop_log`)
- [ ] User-requested account deletion pipeline (automated, not manual)
- [ ] In-app crisis resource cards (region-aware, hotline database)
- [ ] KMS-backed key wrapping for squad keys (replaces raw key in Postgres) — see `src/utils/encryption.ts` scaffold
- [ ] Forward secrecy: per-session key derivation (not full E2E, but reduces blast radius)
- [ ] Honest E2E disclosure in-app ("messages are encrypted, but SquadRidge can read them with privileged access")

---

## Milestone 3 — E2EE roadmap (3–6 months)

**Goal:** Cryptographic end-to-end encryption so the platform cannot bulk-read messages.

This is the hardest and most important long-term privacy improvement. The approach:

### Option A: MLS (Messaging Layer Security, RFC 9420)

- **Pros:** Industry standard, audited, designed for group messaging, supports add/remove members.
- **Cons:** Complex to implement correctly; key distribution and recovery UX is hard.
- **Path:** Evaluate `@matrix-org/mls-ts` or a Rust/WASM binding. Design key distribution (how does a new member get the group key securely?). Handle the "one compromised client" threat.

### Option B: Signal Double Ratchet (per-pair)

- **Pros:** Well-understood, strong forward secrecy and break-in recovery.
- **Cons:** Designed for 1:1 — group messaging adds complexity (sender keys).
- **Path:** Use `libsignal-protocol` (WASM port). Define a group key distribution model.

### Option C: Symmetric key with KMS + client-side decryption only

- **Pros:** Simpler. The server holds the KMS-wrapped key but cannot unwrap without client authorization.
- **Cons:** Not true E2E if KMS is on the same cloud account. Good for "operator can't casually read" but not for "operator compelled by court."
- **Path:** AWS KMS or Cloudflare KV + envelope encryption. Client caches decrypted key in session memory.

**Decision point:** Choose the option that matches pilot user risk profile. For high-risk users (journalists, activists), MLS or Signal is the right answer. For low-risk initial pilots, Option C is pragmatic.

**Timeline:** Design decision in M2; prototype in M3; production in M4 (9–12 months).

---

## Milestone 4 — Scale and compliance (6–12 months)

- [ ] SOC 2 Type I readiness
- [ ] GDPR DPA with all subprocessors formally reviewed
- [ ] Bug bounty program launched
- [ ] Multi-region option for data residency (EU, APAC)
- [ ] Volunteer moderator training program
- [ ] Crisis intervention SLA (<5 min response for flagged crisis content)
- [ ] API v2 with OpenAPI spec, typed clients, rate limits documented

---

## Milestone 5 — Partnerships (12–18 months)

- [ ] NGO partner integration (credential issuance for verified participants)
- [ ] Issuer-managed anonymity groups for partner deployments (pilot with one NGO)
- [ ] White-label / embedded deployment option for humanitarian organizations
- [ ] ZKTls experiments for attribute proofs without issuer dependency

---

## What we are explicitly not doing (yet)

- **On-chain ZK commitments** — adds complexity without clear user benefit at this stage
- **Tor-only mode** — important for some users; we don't want to scope-creep the v1 client
- **On-device key storage** — platform key management for now; client-side key material is v2+
- **Federated server model** — single-tenant first; federation adds significant complexity

---

## Open questions

1. **Who is the right E2E cryptography choice for humanitarian orgs?** (Needs threat modelling with a partner.)
2. **How do we handle key recovery when a user loses their device?** (Every E2E system has this problem. It's not solved yet.)
3. **What's the right retention window for squads with ongoing active members?** (User preference vs. privacy default tension.)

---

*This roadmap is public and honest. If you see a commitment here that isn't reflected in code or docs, open an issue.*
