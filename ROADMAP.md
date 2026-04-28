# Roadmap

*Last updated: 2026-04-28. This is a living document — timelines are estimates, not commitments. We update it when priorities shift.*

---

## Where we are now (Q2 2026)

SquadRidge has a working product:
- React/TypeScript frontend with Vite
- Supabase backend (PostgreSQL, RLS, Edge Functions, Realtime)
- AES-256-GCM application-layer message encryption
- Semaphore ZK verification flow for anonymous identity proofs
- Matchmaking, squad sessions, moderator console, Conflict Severity Index
- CI with lint, typecheck, unit tests (171 passing), E2E, dependency review, DB migration tests
- Strong security documentation (threat model, encryption scope, secrets rotation)

What we don't have yet: true E2E, SOC2, KMS key management, automated retention jobs, self-service account deletion, or certified crisis integrations.

---

## Near-term (Q2–Q3 2026)

These are the highest-impact improvements before any serious pilot deployment.

### Security and privacy
- [ ] Wire KMS (AWS KMS or GCP Cloud KMS) for field-level encryption key management — `src/utils/encryption.ts` is the scaffold showing the pattern
- [ ] Deploy pg_cron retention jobs for message partitions and ZK proof records — `scripts/retention_job.sql` is the scaffold
- [ ] Self-service account deletion UI (currently requires operator action)
- [ ] Legal review of PRIVACY_POLICY.md and DATA_RETENTION.md for GDPR and pilot-partner jurisdictions
- [ ] Rate limiter: upgrade from Upstash per-user limit to per-IP (hashed) + per-action composite keys

### Infrastructure
- [ ] Geographic data residency option (EU-hosted Supabase project for EU pilots)
- [ ] Automated backup verification (restore drill, not just backup existence)
- [ ] Secrets management via cloud secret manager (AWS Secrets Manager / GCP Secret Manager) — currently all via environment variables

### Product
- [ ] Crisis resource integration (region-aware hotlines, automated detection handoff)
- [ ] Progressive profiling for matching (reduce upfront friction while improving match quality)
- [ ] Moderator tooling improvements (pre-summaries, suggested actions, rotation system)

---

## Medium-term (Q3–Q4 2026)

### E2EE roadmap

This is the most significant security milestone and the most complex technically. Here's what the path looks like:

**Phase 1 — Hardened server-side encryption (current → Q3)**
- KMS-wrapped data keys (squad key encrypted by KMS, not stored in plaintext in DB)
- Key rotation per squad lifecycle event (archive, member leave)
- Forward secrecy within a squad session via ephemeral ratchet keys

**Phase 2 — Client-held keys (Q3–Q4)**
- Per-user asymmetric key pairs generated client-side (not uploaded to server)
- Squad session key encrypted to each member's public key
- Server stores only ciphertext + wrapped keys; cannot decrypt without client participation
- This is the threshold where we can honestly claim "E2E against the operator"

**Phase 3 — Multi-device and recovery (Q4–Q1 2027)**
- MLS (Messaging Layer Security) or Signal Double Ratchet for forward secrecy and post-compromise security
- Device-linking flow for multi-device access without key escrow
- Recovery path for lost key material (this is hard — be honest with users about the tradeoff)

**Honest note:** Real E2E is hard to get right. We'd rather ship Phase 1 and 2 carefully, with external review, than rush Phase 3 and create false confidence. Until Phase 2 is complete, materials must say "operator-readable."

### Compliance
- [ ] SOC2 Type I documentation package (policies, controls inventory, evidence collection)
- [ ] GDPR DPA template for pilot operators
- [ ] Penetration test (external vendor; schedule after Phase 1 encryption work)

### Product
- [ ] Squad "slow mode" and cool-down affordances
- [ ] Ephemeral reactions (non-identifying, no social graph building)
- [ ] Leave-and-forget flow (immediate disconnect + optional message deletion request)

---

## Longer-term (2027+)

- SOC2 Type II audit
- On-device ZK proof generation (no server intermediary for identity proofs)
- Trust registry for humanitarian issuer organizations (verified issuer list, on-chain or federated)
- Differential privacy for analytics (measure impact without re-identification)
- Tor-friendly access mode (for users in restricted environments)

---

## What we're not building (intentionally)

- A general-purpose chat platform. We are purpose-built for structured, facilitated dialogue.
- Public profile directories or social graphs. Pseudonymity and squad-scoped visibility are features, not limitations.
- AI-generated summaries of message content. The redaction pipeline exists to prevent this from happening accidentally; it's also policy.

---

## How to read this roadmap

Items marked ✅ are done. Items listed here are planned. Timelines slip; we'll update this document when they do. If something here matters to you — whether you're a pilot partner, investor, or contributor — open an issue or reach out. We'd rather have that conversation early than miss what matters.
