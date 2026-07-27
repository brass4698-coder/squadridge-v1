# Diligence Overview

Short overview for partners, funders, and advisors evaluating SquadRidge **as it exists today**. For a fuller investor start-here, use [`docs/business/investor-brief.md`](./docs/business/investor-brief.md).

## What SquadRidge Is

SquadRidge is **private deliberation infrastructure**: facilitator-led, structured written sessions in an enclosed room, with a hard **release gate**, then an optional **integrity-anchored** private memo or public ledger entry. The product spine is **Configure → Verify → Facilitate → Release** (Enclosed → Release gate → Published).

The architectural line: **the room and the record are separate by design** — not a policy toggle.

This is **not** a consumer messenger, a video mediation suite, or (today) Signal-grade operator-blind encryption. Legacy citizen matchmaking / ZK routes are soft-retired from the v2 product story.

## Current Product State

The repository contains a substantial working application with:

- React/Vite/TypeScript frontend (`App.v2` facilitator + participant paths)
- Supabase backend with PostgreSQL, RLS, Auth, Realtime, and Edge Functions
- Invite-only auth, verification review, live session messaging, outcome approvals, and `release_outcome` with SHA-256 anchors
- Public marketing site, security claims surface, and ledger UI (illustrative specimens until a real opt-in publish)
- CI pipelines, deployment workflows, and honest security documentation

This is not just a concept repo. It is also **pre-pilot** for first real private releases — not a finished institution-grade procurement platform.

Honesty source for LIVE / SCAFFOLDED / PLANNED: [`src/data/implementationStatus.ts`](./src/data/implementationStatus.ts). Snapshot: [`CURRENT_STATUS.md`](./CURRENT_STATUS.md).

## Recommended Initial Wedge

- **Buyer / operator:** NGO, board, or HR/compliance teams running sensitive internal deliberation
- **User group:** Small, invite-linked cohorts (typically 2–6) under a facilitator
- **Job to be done:** Deliberate in a controlled written room; release a **private anchored decision memo** first; public ledger only if the organisation opts in
- **Must disclose:** room content is **operator-readable** today (see threat model)

## Security And Privacy Boundaries

Engineering source of truth: [`docs/security/threat-model.md`](./docs/security/threat-model.md). Architecture one-pager: [`docs/technical/diligence-architecture.md`](./docs/technical/diligence-architecture.md).

Most important diligence points:

- Release anchors (SHA-256) prove integrity of **approved outcome text**, not who said what in the room
- RFC 3161 trusted time is **scaffolded**, not production-live — do not claim court-admissible time
- Room confidentiality is **not** Signal-style E2E against the platform operator today; operator-blind encryption is **planned** (ADR 005)
- Operator, service-role, facilitator, and database-access boundaries matter materially
- Production must not rely on demo/mock/stub modes
- **No external security review is complete yet** — template: [`docs/security/external-review.md`](./docs/security/external-review.md)

## What Is Fundable About This

- A distinct category thesis: **private deliberation infrastructure** with a deliberate release gate
- Unusually honest security documentation and an Implementation Status Registry for public claims
- A built v2 product surface (not only a deck), with CI and ops checklists aimed at bounded pilots
- A credible beachhead where process integrity and disclosure matter more than mass-market growth

## What Still Needs To Be Proven

- Pilot evidence with real partners (use [`docs/operations/pilot-evidence-pack-template.md`](./docs/operations/pilot-evidence-pack-template.md))
- First private released memo from a live pilot session
- Scoped external security review beyond internal documentation
- Operational maturity (email delivery gaps, facilitator ops discipline)
- Paying organisation traction — **hypothesis only; none claimed today**

## Current Risks

- Overclaiming privacy, time proofs, or impact ahead of evidence
- Confusing illustrative ledger specimens with live pilot outcomes
- Mixing legacy matchmaking/ZK diligence surfaces with the v2 deliberation story
- Institution-facing materials drifting from `implementationStatus.ts`

## Near-Term Milestones

See [`docs/business/use-of-funds-and-milestones.md`](./docs/business/use-of-funds-and-milestones.md). In short:

1. Staging dry-run on a fixed deploy SHA  
2. First private NGO/board/HR memo pilot with MOU honesty  
3. 2–3 additional bounded pilots + evidence packs  
4. Scoped external security review  
5. First paying org (**hypothesis**)

## Supporting Docs

- Investor brief: [`docs/business/investor-brief.md`](./docs/business/investor-brief.md)
- Competitive wedge: [`docs/business/competitive-wedge.md`](./docs/business/competitive-wedge.md)
- Data room index: [`docs/business/data-room-index.md`](./docs/business/data-room-index.md)
- Current state: [`CURRENT_STATUS.md`](./CURRENT_STATUS.md)
- Platform description: [`docs/product/platform-description.md`](./docs/product/platform-description.md)
- Threat model: [`docs/security/threat-model.md`](./docs/security/threat-model.md)
- v2 pilot checklist: [`docs/operations/v2-pilot-checklist.md`](./docs/operations/v2-pilot-checklist.md)
