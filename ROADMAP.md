# Roadmap

_Status: living document — update quarterly. Dates are targets, not commitments._

This roadmap reflects SquadRidge's engineering and product priorities. It is structured around the four pillars that make the platform defensible: **privacy**, **safety**, **scale**, and **trust**.

---

## Now (Q2 2026)

### Security and privacy hardening
- [x] Server-side AES-GCM message encryption with KMS-wrapped keys
- [x] Request anonymizer middleware (no raw IPs in logs)
- [x] Rate-limiting middleware (Redis-backed, hashed tokens)
- [x] Sentry integration with PII scrubbing
- [x] Secrets scan pre-commit hook
- [x] Message partitioning and retention job (30-day drop)
- [ ] Legal review of PRIVACY_POLICY.md and DATA_RETENTION.md
- [ ] Finalize Data Processing Addendum template for enterprise customers
- [ ] Wire Sentry DSN, Redis URL, and KMS ARN as production secrets

### Developer experience and quality
- [x] TypeScript strict mode (tsconfig.app.json)
- [x] ESLint + Prettier enforced in CI
- [x] Vitest unit test suite (38 files, 171 tests passing)
- [x] OpenAPI specification scaffold
- [ ] Increase test coverage to 80%+ on critical paths
- [ ] Integration tests against test database (Docker Compose)

### Go-to-market
- [ ] Private beta with 3 NGO partners
- [ ] Waitlist to product onboarding flow
- [ ] Facilitator onboarding documentation

---

## Next (Q3 2026)

### Privacy
- [ ] Client-side end-to-end encryption (E2EE) design spike — evaluate Signal double-ratchet vs. libsodium sealed-box for squad conversations
- [ ] Differential-privacy analytics so we can measure impact without re-identification
- [ ] Region-aware crisis resource database (local hotlines, opt-in region detection)

### Safety
- [ ] Content moderation pipeline v1: keyword heuristics + LLM classifier (privacy-preserving, local inference where possible)
- [ ] Human-in-the-loop moderation dashboard (anonymised transcripts, triage workflow)
- [ ] Crisis escalation flow: auto-show crisis resource card on high-risk signal, region-aware

### Scale
- [ ] Horizontal scaling of matchmaking Edge Function
- [ ] Upstash Redis rate-limiter (connect `src/middleware/rateLimiter.ts` to production Upstash)
- [ ] Message partition archive to cold storage (S3/R2) before drop

### Trust and governance
- [ ] SOC 2 readiness documentation and gap analysis
- [ ] Bug bounty program launch (HackerOne or similar)
- [ ] First external security audit / pentest

---

## Later (Q4 2026 and beyond)

### Privacy
- [ ] E2EE implementation for private squad conversations
- [ ] Zero-knowledge proof integration for credential-scoped matching (extending existing ZK work)
- [ ] Privacy-preserving ML on message patterns (federated or on-device)

### Product
- [ ] Volunteer moderator certification program
- [ ] Squad history and longitudinal wellbeing tracking (opt-in, E2EE)
- [ ] Multi-language support (expanding existing translation worker)
- [ ] Mobile apps (React Native or PWA-first)

### Business
- [ ] Enterprise B2B packaging (NGO, university, EAP)
- [ ] SOC 2 Type II audit
- [ ] ISO 27001 gap assessment
- [ ] First Series A materials and data room

---

## Completed (historical)

- [x] Anonymous session flow (no email required)
- [x] Real-time messaging with Supabase Realtime
- [x] Matchmaking queue and squad bootstrap
- [x] ZK-based session attribute verification (stub + Semaphore paths)
- [x] CI pipeline: lint, typecheck, unit tests, production build guard
- [x] Dependabot dependency scanning
- [x] Investor pitch deck hub (multi-audience decks)
- [x] Threat model and security documentation

---

> **How to contribute to the roadmap:** Open a GitHub issue with the `roadmap` label and describe the capability, the user need it addresses, and any security or privacy implications. See `CONTRIBUTING.md`.
