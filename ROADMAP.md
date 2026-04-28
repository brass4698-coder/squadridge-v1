# Roadmap

This document outlines the planned development trajectory for SquadRidge, grouped by time horizon. It is updated as priorities evolve.

## Current state (Q2 2026)

- ✅ React/Vite/TypeScript frontend with full CI (lint, type-check, unit tests, production build)
- ✅ Supabase backend: PostgreSQL with RLS, Auth, Realtime, Edge Functions
- ✅ ZK verification flow (Semaphore-based proofs, in-browser + Edge verify)
- ✅ Squad matchmaking, session management, ledger, moderation surfaces
- ✅ Server-side AES-256-GCM message encryption (squad-scoped keys)
- ✅ PII scrubbing in Sentry before-send hooks; hashed user identifiers
- ✅ Request anonymisation utilities (truncated IP hash, header redaction)
- ✅ Redis-backed Edge rate limiter (Upstash) with environment-configurable limits
- ✅ Dependency review on PRs (blocks high/critical new advisories)
- ✅ Security documentation: threat model, encryption scope, secrets rotation
- ✅ Privacy policy, data retention policy, and diligence overview

## Near-term (Q3 2026)

- [ ] **KMS-backed key wrapping**: integrate AWS KMS / GCP Cloud KMS to wrap squad message keys; remove keys from Postgres storage into a dedicated secrets backend.
- [ ] **Crisis resource system**: region-aware hotline database and in-session resource card triggered by moderation classifier.
- [ ] **Moderation ML pipeline v1**: keyword + embedding classifier for harmful content; human-in-the-loop review queue.
- [ ] **OpenAPI client generation**: generate typed fetch client from `docs/technical/openapi.yaml` and use in frontend.
- [ ] **SOC 2 Type I readiness**: gap assessment, evidence collection, and first control mapping.
- [ ] **Penetration test**: first external pentest of auth, ZK verify, messaging, and moderation surfaces.
- [ ] **Message partitioning**: deploy partitioned messages table (see `migrations/20260428_message_partitioning.sql`) on production for efficient retention job and scalability.

## Medium-term (Q4 2026 – Q1 2027)

- [ ] **Client-side E2EE path**: design and implement double-ratchet (Signal-like) or Olm-based E2EE for private conversations; maintain operator-visible metadata only.
- [ ] **Issuer-managed anonymity group**: full deployment of RFC (see `docs/technical/rfc-issuer-managed-anonymity-group.md`) for pilot partner proofs.
- [ ] **Differential privacy analytics**: implement privacy-preserving aggregate metrics for pilot impact reporting.
- [ ] **Multi-region deployment**: geo-routing for latency and data residency requirements.
- [ ] **B2B portal**: operator onboarding flow, usage dashboards, SLA tooling.
- [ ] **Bug bounty programme**: launch responsible-disclosure bug bounty (HackerOne or similar).

## Long-term (2027+)

- [ ] **SOC 2 Type II audit**.
- [ ] **Global crisis hotline integrations**: real-time partner APIs for in-product crisis referrals.
- [ ] **Forward-secrecy key rotation**: automated key rotation without message re-encryption for archived sessions.
- [ ] **Regulatory certifications**: GDPR DPA templates, HIPAA alignment for healthcare pilots, UK Cyber Essentials.
- [ ] **Open protocol / federation**: publish the SquadRidge squad protocol as an open standard.

## KPIs tracked toward investor milestones

| Metric | Target (12 months) |
|---|---|
| Monthly active squads | 500 |
| 30-day squad retention | ≥ 40 % |
| Moderator escalation SLA (24 h) | ≥ 95 % |
| Crisis intervention response rate | ≥ 90 % |
| Mean time to resolve flagged content | < 4 h |
| Pentest critical/high findings fixed | 100 % within 30 days |

See [DILIGENCE_OVERVIEW.md](./DILIGENCE_OVERVIEW.md) and [INVESTOR_READINESS_AUDIT.md](./INVESTOR_READINESS_AUDIT.md) for investor-facing context.
