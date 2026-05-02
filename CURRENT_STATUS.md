# Current Status

This document is the fastest honest summary of what SquadRidge is today. It is intended for teammates, pilot partners, security reviewers, and funders who need a current-state snapshot before reading deeper docs.

## Snapshot

- Stage: advanced MVP / pilot foundation
- Primary use case: verified-anonymous, facilitator-guided cross-border dialogue in small squads
- Recommended initial wedge: institution-led pilots with peacebuilding organizations, academic labs, or Track II facilitators
- Stack: React, Vite, TypeScript, Tailwind, Supabase (Postgres, RLS, Auth, Realtime, Edge Functions)

## Shipped Now

- Web application with landing, onboarding, verification, intent selection, matching, session, ledger, profile, and moderator/admin routes
- Supabase-backed schema, migrations, and Edge Functions in [`supabase/`](./supabase/)
- Semaphore-style ZK verification path with production guardrails around `VITE_ZK_STUB`
- Anonymous and passwordless sign-in flows
- Invite-code redemption with server-side matchmaking enforcement for live queue entry
- Matchmaking, squad, message, moderation, participant report/blocking, and ledger data model
- CI workflows for lint, test, build, frontend deploy artifact creation, and Supabase deploys
- Threat model and security/architecture documentation that explicitly describe current limits
- Demo and walkthrough flows for investor and partner conversations
- **Conflict Severity Index (CSI):** database tables + RLS (`conflict_severity_snapshots`, `escalation_alerts`), mediator read UI at `/admin/csi`, **automated ingestion** via `supabase/functions/csi-ingest-snapshot` (hourly pg_cron + `csi_aggregate_signals` SQL aggregator over `facilitator_signal_codes` + `sentiment_metrics`), per-region band calibration in `csi_band_thresholds`, and a **scoped partner export** Edge Function (`supabase/functions/csi-partner-export`) gated by hashed API keys, region/dimension allow-lists, audit log (`csi_export_audit_log`), and Upstash rate limiting. Public maps and broad self-serve CSI feeds remain explicitly out of scope — see [`docs/product/conflict-severity-index.md`](./docs/product/conflict-severity-index.md) and [`docs/product/csi-spec.md`](./docs/product/csi-spec.md).
- **Squad message key rotation + interim forward secrecy:** `squad_key_epochs` table, audited `rotate_squad_key` RPC, and a daily pg_cron purge of retired-epoch keys (Tracks A and B, migrations `20260502120000`–`20260503120100`). Replaces the previous "no key rotation" posture in the threat model. Operator-blind E2E remains deferred per [ADR 004](./docs/adr/004-defer-operator-blind-e2e.md).
- **Pilot metrics surface:** `/admin/metrics` (moderator-only) reads from a set of read-only views — verification rate, return rate, intervention usage, report rate, moderator hours per squad, match latency. Definitions in [`docs/business/impact-metrics.md`](./docs/business/impact-metrics.md).

## Pilot-Ready With Care

- Facilitator-led small cohort pilots with bounded participant groups
- Staging or controlled production demos for partner diligence
- Measurement of basic operational metrics such as verification completion, time to match, session completion, and repeat participation
- Moderator-supported sessions where operator visibility and current security boundaries are clearly disclosed
- Invite-gated cohorts, participant-submitted reports, participant blocking, and moderator report disposition when the pilot team has named owners

## Demo Only Or Requires Extra Validation

- Broad self-serve public onboarding for high-risk populations
- Any positioning that implies Signal-grade end-to-end encryption against the platform operator
- Large-scale institutional analytics or early-warning claims beyond basic SQL-derivable metrics
- Claims that AI de-escalation effectiveness or peace impact have already been validated in the field
- Any high-risk deployment that has not passed a dedicated security review and operational readiness check

## Strategic narrative (roadmap)

Long-term **prevention / early-signal** positioning and partner archetypes live in [`docs/business/strategic-positioning-early-warning.md`](docs/business/strategic-positioning-early-warning.md). That document is **strategy and fundraising context**, not a product spec.

**Not shipped** as a full product line until explicitly called out here: **automated** CSI ingestion at scale, public CSI maps or feeds, and quantitative “lives saved” claims. Mediator read surfaces and **draft** methodology remain scoped to pilot operations. Specs: [`docs/product/csi-spec.md`](docs/product/csi-spec.md), [`docs/product/conflict-severity-index.md`](docs/product/conflict-severity-index.md).

## Roadmap Priorities

1. Pilot operations: facilitator tooling, runbooks, incident handling, cohort support
2. Security maturity: external review, key-management roadmap, stronger release gates, auditability
3. Metrics and evidence: instrumentation, partner reporting, pilot outcome capture
4. Institutional packaging: partner one-pager, data room, legal/privacy artifacts, pilot playbooks
5. Privacy architecture evolution: either remain explicit about operator-readable content or invest in a true E2E design path

## Known Risks

- Current message confidentiality is not true operator-proof E2E; see [`docs/security/threat-model.md`](./docs/security/threat-model.md). Productized key rotation + retired-epoch purge bound the future-DB-snapshot attack window but do not change the operator-readable trust posture.
- Metadata and privileged-access risks remain material for higher-risk deployments
- Demo and roadmap narratives are stronger than current pilot evidence
- Operational maturity for live pilots still depends on written process and disciplined environment management
- Report/block workflows are now first-class primitives, but repeat-abuse policy, facilitator staffing, and partner escalation playbooks still need pilot-specific ownership
- Some business and funding docs are still strategy-forward and should not be treated as validated traction

## Recommended Near-Term Positioning

Use this product story in the next 30-90 days:

> SquadRidge is a pilot-stage trust and dialogue platform for structured, facilitator-led cross-border cohorts. It combines verified access, small-group matching, and safety-conscious workflows for institutions running sensitive dialogue programs.

Avoid these stronger claims unless and until they are separately demonstrated:

- "full anonymity"
- "operator-proof encryption"
- "proven peace impact at scale"
- "global early-warning infrastructure"

## Go / No-Go For Real Pilots

Before any real pilot, confirm:

- release checklist passes
- threat model claims are reflected in partner-facing materials
- incident owner and moderator owner are assigned
- pilot runbook exists for the exact cohort format being used
- success metrics and post-session surveys are defined in advance

## Key Documents

- Repo setup and shipping notes: [`README.md`](./README.md)
- Strategic positioning (roadmap narrative): [`docs/business/strategic-positioning-early-warning.md`](./docs/business/strategic-positioning-early-warning.md)
- Security source of truth: [`docs/security/threat-model.md`](./docs/security/threat-model.md)
- Architecture summary: [`docs/technical/architecture-overview.md`](./docs/technical/architecture-overview.md)
- Production checklist: [`docs/operations/production-checklist.md`](./docs/operations/production-checklist.md)
- Diligence summary: [`DILIGENCE_OVERVIEW.md`](./DILIGENCE_OVERVIEW.md)
