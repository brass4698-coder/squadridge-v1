# Current Status

> Last updated: June 2026

This document is the fastest honest summary of what SquadRidge is today. It is intended for teammates, pilot partners, security reviewers, and funders who need a current-state snapshot before reading deeper docs.

## Snapshot

- **Stage:** Advanced MVP / pilot foundation
- **Primary use case:** Verified-anonymous, facilitator-guided cross-border dialogue in small squads
- **Recommended initial wedge:** Institution-led pilots with peacebuilding organizations, academic labs, or Track II facilitators
- **Stack:** React 19, Vite 6, TypeScript, Tailwind CSS 3, Supabase (Postgres, RLS, Auth, Realtime, Edge Functions), Semaphore ZK v4
- **CI:** GitHub Actions — lint, typecheck, Vitest, Playwright e2e, CodeQL static analysis, dependency-review, pgTAP DB tests

## Shipped Now

- Web application with landing, onboarding, verification, intent selection, matching, session, ledger, profile, and moderator/admin routes
- Supabase-backed schema (42 applied migrations), RLS on all 23 tables, and Edge Functions in [`supabase/`](./supabase/)
- Semaphore ZK v4 verification path with production guardrails around `VITE_ZK_STUB`
- Anonymous and passwordless sign-in flows
- Matchmaking, squad, message, moderation, and ledger data model
- CI workflows: lint, typecheck, test, build, Playwright e2e, CodeQL static analysis, dependency review, Supabase deploys
- Threat model and security/architecture documentation that explicitly describe current limits
- Demo and walkthrough flows for investor and partner conversations
- **Design token system v2** (`src/styles/tokens.css`): OKLCH-based surfaces, semantic ink levels, motion timing constants (`--sr-ease-*`, `--sr-duration-*`), layered elevation shadows, focus-ring token, radius scale — fully bridged to Tailwind utilities in `tailwind.config.ts`
- **AI agent context** (`AGENTS.md`): stack summary, directory map, and hard coding rules for Cursor / Copilot / Claude
- **Conflict Severity Index (CSI):** database tables and RLS (`conflict_severity_snapshots`, `escalation_alerts`); mediator-facing read UI at `/admin/csi`. Automated ingestion and partner API are still roadmap — see [`docs/product/conflict-severity-index.md`](./docs/product/conflict-severity-index.md).

## Pilot-Ready With Care

- Facilitator-led small cohort pilots with bounded participant groups
- Staging or controlled production demos for partner diligence
- Measurement of basic operational metrics such as verification completion, time to match, session completion, and repeat participation
- Moderator-supported sessions where operator visibility and current security boundaries are clearly disclosed

## Demo Only Or Requires Extra Validation

- Broad self-serve public onboarding for high-risk populations
- Any positioning that implies Signal-grade end-to-end encryption against the platform operator
- Large-scale institutional analytics or early-warning claims beyond basic SQL-derivable metrics
- Claims that AI de-escalation effectiveness or peace impact have already been validated in the field
- Any high-risk deployment that has not passed a dedicated security review and operational readiness check

## Strategic Narrative (Roadmap)

Long-term **prevention / early-signal** positioning and partner archetypes live in [`docs/business/strategic-positioning-early-warning.md`](docs/business/strategic-positioning-early-warning.md). That document is **strategy and fundraising context**, not a product spec.

**Not shipped** as a full product line until explicitly called out here: **automated** CSI ingestion at scale, public CSI maps or feeds, and quantitative "lives saved" claims. Mediator read surfaces and **draft** methodology remain scoped to pilot operations.

## Roadmap Priorities

1. Pilot operations: facilitator tooling, runbooks, incident handling, cohort support
2. Security maturity: external review, key-management roadmap, stronger release gates, auditability
3. Metrics and evidence: instrumentation, partner reporting, pilot outcome capture
4. Institutional packaging: partner one-pager, data room, legal/privacy artifacts, pilot playbooks
5. Privacy architecture evolution: either remain explicit about operator-readable content or invest in a true E2E design path

## Known Risks

- Current message confidentiality is not true operator-proof E2E; see [`docs/security/threat-model.md`](./docs/security/threat-model.md)
- Metadata and privileged-access risks remain material for higher-risk deployments
- Demo and roadmap narratives are stronger than current pilot evidence
- Operational maturity for live pilots still depends on written process and disciplined environment management
- Some business and funding docs are still strategy-forward and should not be treated as validated traction

## Recommended Near-Term Positioning

Use this product story in the next 30–90 days:

> SquadRidge is a pilot-stage trust and dialogue platform for structured, facilitator-led cross-border cohorts. It combines verified access, small-group matching, and safety-conscious workflows for institutions running sensitive dialogue programs.

Avoid these stronger claims unless and until they are separately demonstrated:

- "full anonymity"
- "operator-proof encryption"
- "proven peace impact at scale"
- "global early-warning infrastructure"

## Go / No-Go For Real Pilots

Before any real pilot, confirm:

- release checklist passes (`npm run check:all`)
- threat model claims are reflected in partner-facing materials
- incident owner and moderator owner are assigned
- pilot runbook exists for the exact cohort format being used
- success metrics and post-session surveys are defined in advance

## Key Documents

- Repo setup and shipping notes: [`README.md`](./README.md)
- AI agent context and coding rules: [`AGENTS.md`](./AGENTS.md)
- Changelog: [`CHANGELOG.md`](./CHANGELOG.md)
- Strategic positioning (roadmap narrative): [`docs/business/strategic-positioning-early-warning.md`](./docs/business/strategic-positioning-early-warning.md)
- Security source of truth: [`docs/security/threat-model.md`](./docs/security/threat-model.md)
- Architecture summary: [`docs/technical/architecture-overview.md`](./docs/technical/architecture-overview.md)
- Production checklist: [`docs/operations/production-checklist.md`](./docs/operations/production-checklist.md)
- Diligence summary: [`DILIGENCE_OVERVIEW.md`](./DILIGENCE_OVERVIEW.md)
