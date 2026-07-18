# Current Status

> Last updated: July 2026

This document is the fastest honest summary of what SquadRidge is today. It is intended for teammates, pilot partners, security reviewers, and funders who need a current-state snapshot before reading deeper docs.

**Canonical product story:** [`docs/product/platform-description.md`](docs/product/platform-description.md) · **Institutional readiness:** [`docs/audit/institutional-readiness-audit.md`](docs/audit/institutional-readiness-audit.md) · **Phase A checklist:** [`ROADMAP.md`](ROADMAP.md)

## Snapshot

- **Stage:** Private pilot foundation — v2 facilitator platform primary
- **Primary use case:** Facilitator-led protected written dialogue with verifiable public outcomes (Configure → Verify → Facilitate → Release)
- **Institutional maturity:** ~**5/10** — credible for bounded mediator-led pilots with disclosed security boundaries; not procurement-ready for Track II audit-grade or military-adjacent deployment
- **Recommended initial wedge:** Institution-led pilots with professional mediators, peacebuilding NGOs, or Track II facilitators who accept operator-readable room content per the threat model
- **Stack:** React 19, Vite 6, TypeScript, Tailwind CSS 3, Supabase (Postgres, RLS, Auth, Realtime, Edge Functions)
- **CI:** GitHub Actions — lint, typecheck, Vitest, Playwright e2e, CodeQL static analysis, dependency-review, pgTAP DB tests

## Shipped Now (v2 — primary)

- Public marketing site (landing, how-it-works, use cases, security, FAQ, about, contact, legal)
- Pilot access request form → `access_requests`
- Invite-only auth (magic link, profiles, seven roles, RLS)
- Staff invite create / validate / accept / revoke
- Per-role dashboards at `/app/{role}` (`App.v2.tsx`)
- Session create with templates (`/app/sessions/new/setup`)
- Participant invite tokens + facilitator verification review (`ParticipantsReviewPage`)
- Participant contact-hash + document upload via `participant-verification-upload` Edge Function (facilitator review remains authoritative — not automated KYC)
- Live `session_messages` — facilitator control room (`/control`) + participant token path (`/p/room`)
- Enforced session lifecycle guards (DB/RPC blocks invalid Verify → Facilitate / Release without approvals)
- Outcome draft, approvals, `release_outcome` RPC → public ledger query
- Architectural record redaction (facilitator-authored outcomes only; no import-from-room)
- In-app workflow notifications (verify / room open / approval / release) + prefs gate
- v2 metadata-only session audit trail + export UI
- Session resolution workflow (template-gated) with participant support
- Public ledger UI at `/ledger` with illustrative sample labeling when no live records exist
- Facilitator walkthrough (in-app)
- Threat model, public-claims audit, and platform-description aligned with engineering reality
- Design token system v2 (`src/styles/tokens.css`) + `AGENTS.md` for contributors

## Pilot-Ready With Care

- Facilitator-led mediation sessions with 2–6 verified participants and manual facilitator verification
- Staging or controlled production demos for partner diligence
- Pre-registered operational metrics (verification completion, time-to-release, session completion) — not quantitative “lives saved” claims
- Sessions where operator-readable room content and security boundaries are disclosed in partner MOU
- **Deploy prerequisite:** apply migrations through `20260712_*`, deploy Edge Functions (including `participant-verification-upload`), and provision the `participant-verification` storage bucket

## Remaining Gaps (honest unfinished)

- Email delivery for workflow notifications (prefs recorded; pipeline not wired) — **ROADMAP P1 #4**
- E2E covering full facilitator invite → `/p/room` against a live DB — **ROADMAP P0 #2**
- First **real** published ledger record from a pilot session — **ROADMAP P1 #6** (operator step)
- Room-level operator-blind E2E encryption — roadmap / threat model §13, not shipped
- Civic early-warning → automated proposal engine vision — see [`docs/product/civic-early-warning-response-model.md`](docs/product/civic-early-warning-response-model.md) (vision-labeled, not shipped)

## Demo Only Or Requires Extra Validation

- Broad self-serve public onboarding for high-risk populations
- Any positioning that implies Signal-grade end-to-end encryption against the platform operator
- Quantitative impact claims (% conflict prevented, lives saved) without methodology and real pilot data
- Automated early-warning or CSI as a public product line (internal `/admin/csi` moderator console only)
- Legacy squad matchmaking (`/match`, `/session/:squadId`) as the institutional product story
- Any high-risk deployment that has not passed dedicated security review and operational readiness check

## Legacy Routes Inventory

Still mounted or referenced in the codebase — **disclose in diligence**; do not lead institutional pitches with these.

| Route | Status |
| ----- | ------ |
| `/match` | Legacy — intent-pool citizen matchmaking |
| `/session/:squadId` | Legacy — squad encrypted chat |
| `/session/demo-session-001` | Demo — gated by `VITE_ENABLE_DEMO_SQUAD` in production |
| `/incident`, `/incident/:slug` | Legacy — not in `App.v2.tsx` router |
| `/ledger-legacy` | Legacy — pre-v2 proposal ledger |
| `/admin/csi` | Internal — moderator-rostered CSI read console |

## Strategic Narrative (context only)

Long-term **prevention / early-signal** positioning lives in [`docs/business/strategic-positioning-early-warning.md`](docs/business/strategic-positioning-early-warning.md) and [`docs/product/civic-early-warning-response-model.md`](docs/product/civic-early-warning-response-model.md). Those documents are **strategy and vision**, not the v2 product spec.

**Not shipped** as a product line: automated CSI ingestion at scale, public CSI maps, quantitative “lives saved” claims, or citizen open matchmaking at institutional scale.

## Roadmap Priorities (Phase A)

See [`ROADMAP.md`](ROADMAP.md) for acceptance criteria. Most P0/P1 engineering items are complete; remaining work is email delivery, full participant-path e2e against live DB, first real ledger publish, and pilot ops.

## Known Risks

- Current message confidentiality is not true operator-proof E2E; see [`docs/security/threat-model.md`](docs/security/threat-model.md)
- Facilitator manual review is authoritative for participant verification (by design for pilot)
- No live published ledger records yet — samples are labeled illustrative
- Legacy routes and old README narratives can confuse institutional buyers if not disclosed
- Operational maturity for live pilots depends on written process and disciplined environment management (migrations + Edge Function deploy)

## Recommended Near-Term Positioning

Use this product story in the next 30–90 days:

> SquadRidge is a private-pilot facilitator-led dialogue platform. Parties speak in a protected written room; only facilitator-approved outcomes are released with a verification anchor — not a transcript. We are inviting mediators and peacebuilding teams.

Avoid these stronger claims unless separately demonstrated:

- “full anonymity”
- “operator-proof encryption”
- “proven peace impact at scale” or “lives saved”
- “global early-warning infrastructure”
- Email workflow notifications as fully shipped

## Go / No-Go For Real Pilots

Before any real pilot, confirm:

- release checklist passes (`npm run check:all` with local Supabase for type drift, or CI green)
- threat model claims are reflected in partner-facing materials
- incident owner and facilitator owner are assigned
- pilot runbook exists for the exact session format being used ([`docs/operations/v2-pilot-checklist.md`](docs/operations/v2-pilot-checklist.md))
- success metrics and post-session surveys are defined in advance
- partner MOU references operator-readable content boundaries
- migrations `20260710`–`20260712` and `participant-verification-upload` are deployed to the pilot project

## Key Documents

- Full platform description: [`docs/product/platform-description.md`](docs/product/platform-description.md)
- Civic early-warning → proposal vision: [`docs/product/civic-early-warning-response-model.md`](docs/product/civic-early-warning-response-model.md)
- Institutional readiness audit: [`docs/audit/institutional-readiness-audit.md`](docs/audit/institutional-readiness-audit.md)
- Phase A checklist: [`ROADMAP.md`](ROADMAP.md)
- Repo setup: [`README.md`](README.md)
- AI agent context: [`AGENTS.md`](AGENTS.md)
- Security source of truth: [`docs/security/threat-model.md`](docs/security/threat-model.md)
- Pilot runbook: [`docs/operations/pilot-runbook.md`](docs/operations/pilot-runbook.md)
- Diligence summary: [`DILIGENCE_OVERVIEW.md`](DILIGENCE_OVERVIEW.md)
