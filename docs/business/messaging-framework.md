# MENDguild messaging framework (Pitch Deck Hub)

## Purpose

This document explains how **Pitch Deck Hub** messaging in the app ([`src/pitch-deck-hub/initialState.ts`](../../src/pitch-deck-hub/initialState.ts)) relates to:

- **Current product reality** — [`../../CURRENT_STATUS.md`](../../CURRENT_STATUS.md)
- **Strategic prevention / early-warning narrative** — [strategic-positioning-early-warning.md](strategic-positioning-early-warning.md)
- **Draft product concepts (not shipped)** — [`../product/csi-spec.md`](../product/csi-spec.md) (Conflict Severity Index)

The hub uses **one shared [`MessagingLayer`](../../src/pitch-deck-hub/types.ts)** for all deck variants. Audience differences are in **slide emphasis and tone** (see below), not in contradicting facts about what is shipped.

## Master narrative (shared)

- **Headline:** Conflict prevention and early-warning *posture*—listening across lines, rapid de-escalation when tensions rise.
- **Thesis field:** Always separate **shipped product** (verified access, squads, facilitator-led sessions, moderation, ledger-style outcomes) from **pilot / roadmap** (CSI, broad real-time listening at scale, guaranteed response SLOs, third-party impact validation as *achieved* outcomes).
- **Trust:** Current message confidentiality is **operator-readable** for safety and policy reasons; never describe as Signal-grade or operator-proof E2EE unless the product matches that claim. See [`../security/threat-model.md`](../security/threat-model.md) and `/security` in the app.

## Four pillars (where they live in the hub)

| Pillar | Hub field(s) | Notes |
|--------|----------------|--------|
| Detection | `detectionMechanism` | Grassroots / cross-line listening—label pilot scope and roadmap (CSI) honestly. |
| Intervention | `interventionProtocol` | “Within hours” is a **design target** with facilitators where applicable, not a global SLA. |
| Measurement | `impactMeasurement` | Third-party validation is a **discipline and goal**; “lives saved” is not a realized claim without methodology. |
| Prevention / ROI | `mission`, `coreDifferentiators` | “Conflict prevention is the highest-ROI investment in peace” as economic/moral framing—still bounded to evidence. |

## Six deck audiences (`DeckAudience`)

Use the same factual spine for all; shift **weight** and **depth**, not **truth**.

### `investors`

- **Emphasize:** Category (prevention infra), pilot path, capital use, team, scenario model discipline.
- **De-emphasize:** Implied scale without assumptions; any “lives saved” without study design.
- **Diligence hooks:** Tie claims to `CURRENT_STATUS`, financial scenario labels, and security disclosure.

### `pilots_partners`

- **Emphasize:** Operations, facilitator workflows, success criteria to co-define, risk controls, cadence.
- **De-emphasize:** Global infrastructure claims; anything that sounds like an unconditional service-level promise.
- **Diligence hooks:** Implementation checklist, runbooks, incident handling.

### `policy_government`

- **Emphasize:** Governance, ethics, records, evaluation, deployment constraints, stability of institutions.
- **De-emphasize:** Overclaiming early-warning as deployed national infrastructure.
- **Diligence hooks:** Lawful process, transparency boundaries, link to security limits.

### `technical_diligence`

- **Emphasize:** Architecture, verification, encryption at rest, squad keys, moderation, what is *not* E2EE today.
- **De-emphasize:** Marketing superlatives; conflate “encryption” with “operator cannot read.”
- **Diligence hooks:** `docs/technical/architecture-overview.md`, threat model, RLS posture.

### `facilitators_demos`

- **Emphasize:** Session flow, demo script, what to cite externally, calm de-escalation UX.
- **De-emphasize:** Unbounded “real time” or “we prevent all violence” language.
- **Diligence hooks:** Demo scope, UI under development captions.

### `financial_appendix`

- **Emphasize:** Assumptions, labels (scenario model vs input required), tie to use of funds.
- **De-emphasize:** Narrative that looks like historical revenue; invented traction.
- **Diligence hooks:** `FinancialAssumptions` in the hub, audit trail in model output.

## Evidence boundaries

- **Internal-only:** draft CSI spec, strategic ambitions, and fundraising hypotheses—**unless** explicitly approved for external use and supported by evidence.
- **External-ready:** only claims with approved sources, or explicit assumption/scenario labels. Use [`impact-metrics.md`](impact-metrics.md) for how impact language should evolve.

## Cross-links

- [strategic-positioning-early-warning.md](strategic-positioning-early-warning.md) — roadmap vs shipped table and partner archetypes.
- [`../product/csi-spec.md`](../product/csi-spec.md) — CSI (draft, not a shipped product claim).
- [`../../CURRENT_STATUS.md`](../../CURRENT_STATUS.md) — single source of what is shipped today and what to avoid saying.
