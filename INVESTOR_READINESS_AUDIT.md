# Investor Readiness Audit

## What was weak before

- Landing and nav sometimes read like an advanced prototype rather than deliberation infrastructure.
- Security, ledger, and request-access were easy to miss for a first diligence pass.
- Some docs and copy still leaned on legacy matchmaking / waitlist / ZK framing.
- Encoding and polish issues hurt perceived maturity on marketing surfaces.
- Diligence materials lagged the honesty already present in the threat model and implementation registry.

## What was improved

- Public site and docs reframed around **private deliberation infrastructure** and Configure → Verify → Facilitate → Release.
- Implementation Status Registry (`src/data/implementationStatus.ts`) backs LIVE / SCAFFOLDED / PLANNED claims.
- Investor start-here pack added: [`docs/business/investor-brief.md`](./docs/business/investor-brief.md), competitive wedge, use-of-funds & milestones, diligence architecture one-pager, external-review placeholder, pilot evidence pack template.
- [`DILIGENCE_OVERVIEW.md`](./DILIGENCE_OVERVIEW.md) and [`docs/business/data-room-index.md`](./docs/business/data-room-index.md) aligned to the v2 spine.
- Security page, threat model, and platform description remain the engineering honesty anchors.

## Remaining gaps

- **Evidence, not decks:** first real private pilot + filled [`docs/operations/pilot-evidence-pack-template.md`](./docs/operations/pilot-evidence-pack-template.md) still required for higher fundability.
- **External review:** placeholder only — [`docs/security/external-review.md`](./docs/security/external-review.md); no completed third-party review in-repo.
- **Ops gaps:** email delivery for workflow notifications and first live private release still called out in [`CURRENT_STATUS.md`](./CURRENT_STATUS.md).
- **Secondary surfaces:** some older business docs (e.g. legacy funding thesis language) may still need a pass so they do not contradict the investor brief.
- **Demo continuity:** facilitator walkthrough exists; keep staging dry-runs aligned with [`docs/operations/v2-pilot-checklist.md`](./docs/operations/v2-pilot-checklist.md) rather than reviving waitlist/match journeys as the investor story.

## Recommended next steps

1. Open diligence with [`docs/business/investor-brief.md`](./docs/business/investor-brief.md) → [`CURRENT_STATUS.md`](./CURRENT_STATUS.md) → threat model → `/security`.
2. Run a staging dry-run and file an evidence pack for the first private memo pilot.
3. Commission a scoped external review (RLS, auth, release path) using the external-review template.
4. Keep public claims synchronized with `implementationStatus.ts` — no invented LIVE crypto or traction.
5. Treat first paying organisation as a **labeled hypothesis** in [`docs/business/use-of-funds-and-milestones.md`](./docs/business/use-of-funds-and-milestones.md), not a present fact.
