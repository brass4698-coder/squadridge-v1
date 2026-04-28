# Due Diligence Guide

*For investors, advisors, and pilot partners reviewing SquadRidge. Last updated: 2026-04-28.*

---

This document is a map, not a marketing pitch. It points you to the right file for each diligence question and is honest about what's finished, what's scaffolded, and what's still on the roadmap.

## What SquadRidge Is

SquadRidge is a verified-anonymous dialogue platform for small, structured, cross-border cohorts — primarily suited for facilitated pilots where trusted organizations need a safer alternative to generic chat for sensitive dialogue work.

The stack: React/Vite/TypeScript frontend, Supabase backend (PostgreSQL, RLS, Auth, Realtime, Edge Functions), Semaphore ZK proofs for identity verification, and AES-256-GCM application-layer message encryption.

## Investment / partnership readiness checklist

### Product & tech

| Question | Where to look | Status |
|---|---|---|
| What does the product do? | docs/product-overview.md, README.md | ✅ |
| Is there working code, not just a deck? | Run `npm ci && npm run dev` | ✅ Working |
| What's the architecture? | docs/Architecture.md, docs/architecture-overview.md | ✅ |
| What's the data model? | docs/technical/data-model.md | ✅ |
| Is there a threat model? | docs/security/threat-model.md | ✅ Thorough |
| What encryption is used? | docs/security/encryption-scope.md | ✅ Honest |
| Is it E2EE? | **No.** AES-GCM at app layer, operator-readable. See §5 of threat model | ✅ Documented |
| What's the ZK verification? | docs/technical/zk-implementation.md | ✅ |
| Does CI pass? | .github/workflows/ci.yml | ✅ |
| Are there tests? | `npm test` (171 passing) | ✅ |
| Is TypeScript strict? | tsconfig.app.json ("strict": true) | ✅ |

### Security & privacy

| Question | Where to look | Status |
|---|---|---|
| How are vulnerabilities disclosed? | SECURITY.md | ✅ |
| What data is collected? | PRIVACY_POLICY.md | ✅ Scaffold, needs legal review |
| How long is data retained? | DATA_RETENTION.md | ✅ Windows defined, automation partial |
| Is there a secrets policy? | docs/security/secrets-rotation.md, .env.example | ✅ |
| Supply chain / dependency hygiene | .github/dependabot.yml, docs/security/dependency-advisories.md | ✅ |
| Sentry PII scrubbing | src/lib/sentry.ts (beforeSend hook) | ✅ |
| Moderation audit trail | 20260428120000_moderator_decrypt_audit_rpc.sql | ✅ |
| Rate limiting | supabase/functions/rate-limit/ (Upstash Redis) | ✅ |
| Request anonymization middleware | src/middleware/anonymizeRequest.ts | ✅ Scaffold |
| KMS-backed field encryption | src/utils/encryption.ts | 🔶 Scaffold — needs KMS wiring |

### Business & compliance

| Question | Where to look | Status |
|---|---|---|
| Business model | docs/business/revenue-model.md | ✅ |
| Go-to-market | docs/business/go-to-market.md | ✅ |
| Investor pitch | docs/pitch/squadridge-pitch.md | ✅ |
| Competitive landscape | docs/product/competitive-analysis.md | ✅ |
| Impact metrics | docs/business/impact-metrics.md | ✅ |
| Partnership strategy | docs/business/partnership-strategy.md | ✅ |
| GDPR / legal compliance | PRIVACY_POLICY.md | 🔶 Good-faith scaffold, not yet legally reviewed |
| SOC2 / audit readiness | Not started | ❌ On roadmap (see ROADMAP.md) |
| LICENSE | MIT | ✅ |

## Demo script

To run a live demo:

1. `npm ci && npm run dev`
2. Sign in with a magic link to any email address.
3. Navigate to `/session/demo-session-001` for the offline demo squad (no real users needed).
4. Walk through the demo flow at `/demo` for the guided investor walkthrough.
5. Show the moderation console at `/mod` (moderator role required).

Full walkthrough: `docs/technical/demo-walkthrough.md` and `docs/operations/zk-verify-demo-script.md`

**What the demo proves:**
- Anonymous sign-up and session with ZK verification
- Message encryption (AES-GCM), though not E2E against the operator
- Conflict Severity Index in action
- Demo squad and invite flow
- Moderator audit trail

**What the demo doesn't show yet:**
- Real multi-party live sessions (you need two real signed-in users)
- Full institutional issuer integration for ZK groups
- Automated message retention / deletion jobs
- KMS-backed key management

## Key metrics to ask about

- MAU and squad retention (7/30/90 days): tracked in pilot environments; not yet published.
- Crisis intervention rate: tracked manually during pilots; automated metrics spec in docs/product/metrics-spec.md.
- Moderation response time: on the roadmap for automated dashboarding.

## Known limitations (honest list)

1. **Not E2E.** Squad keys live in the database. Operator can read message content. This is documented in the threat model and user-facing materials.
2. **Single-region infra.** No geographic data residency beyond Supabase's project region.
3. **No SOC2.** On the 12-month roadmap; documentation is ahead of the audit.
4. **Automated retention jobs.** Schema is partitioned; pg_cron jobs are scaffolded but need deployment.
5. **Legal review pending.** PRIVACY_POLICY.md and DATA_RETENTION.md are good-faith documents, not yet lawyer-reviewed.
6. **Key management.** No KMS integration today; encryption.ts is a scaffold showing the pattern.
7. **Scale testing.** Load and soak tests are in `scripts/matchmaking-soak.mjs` but not run as part of CI.

## What's coming

See ROADMAP.md for the full timeline. The highest-priority items for investors to evaluate:

- Forward secrecy / true E2E option (Signal-style MLS) — 6-12 months
- SOC2 Type I documentation — 6-9 months
- KMS integration (AWS/GCP key management for field encryption) — 3-6 months
- Self-service account deletion UI — 2-3 months
- Geographic data residency options — depends on scale and partner requirements

## Questions

If you're doing diligence and have questions this doc doesn't answer, open an issue (using the diligence template) or reach out via the contact in SECURITY.md. We'd rather have a direct conversation than have you make assumptions.
