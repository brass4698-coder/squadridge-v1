# SquadRidge — investor and partner narrative source

Program fit and application strategy: [program-map.md](program-map.md).

Use this file as the shared source for decks, accelerator forms, partner one-pagers, and diligence answers. Every claim below is intended to stay aligned with [`CURRENT_STATUS.md`](../../CURRENT_STATUS.md), [`DILIGENCE_OVERVIEW.md`](../../DILIGENCE_OVERVIEW.md), and the engineering source of truth in [`docs/security/threat-model.md`](../security/threat-model.md).

---

## One-line description

SquadRidge is a pilot-stage platform for **verified access, facilitator-led dialogue, and bounded cross-border cohorts** where institutions need more trust structure than generic chat or meeting tools provide.

## Core deck family

| Deck | Best use | What it should prove |
| ---- | -------- | -------------------- |
| **Company overview** | First investor, advisor, or partner conversation | What SquadRidge is, why the wedge matters, and why the current stage is still credible |
| **Core investor deck** | Fundraising and accelerator conversations | Market wedge, product reality, use of funds, and the difference between shipped facts and scenario-model assumptions |
| **Pilot / partner deck** | NGOs, labs, facilitators, Track II operators | Pilot shape, operator boundaries, runbook expectations, and measurable outcomes |
| **Technical / security deck** | Security reviewers, technical diligence, enterprise buyers | Threat model alignment, verification path, encryption scope, logging, and known limitations |
| **Policy / peacebuilding deck** | Governments, multilaterals, peacebuilding programs | Governance, records posture, evaluation discipline, and deployment constraints |

---

## 1. What the repository proves today

These are the strongest repo-defensible facts to repeat across decks:

- **Stage:** advanced MVP / pilot foundation, best suited to bounded, facilitator-led pilots rather than broad public launch.
- **Shipped product surfaces:** landing, onboarding, verification, intent selection, matching, session, ledger, profile, moderator, and admin routes.
- **Backend posture:** React + Vite + TypeScript frontend with Supabase for Postgres, RLS, Auth, Realtime, and Edge Functions.
- **Verification:** Semaphore-based proofs are verified server-side; proof submissions are tied to a logged-in account.
- **Messaging:** message bodies are encrypted before storage, but the current release is **not** operator-blind end-to-end encryption; moderators and privileged operator paths still matter.
- **Pilot operations:** the repo already contains runbooks, launch checklists, incident guidance, partner one-pagers, and a data-room index.
- **Conflict Severity Index (CSI):** moderator-facing read surfaces exist for authenticated moderator users; automated ingestion, public feeds, and broad early-warning claims remain roadmap.

## 2. What must stay labeled as roadmap or pilot design

Do **not** upgrade any of the following into current-state product claims:

- operator-proof or Signal-style E2E messaging
- full anonymity or “no server-side identity”
- broad self-serve onboarding for high-risk populations
- population-scale early-warning infrastructure
- automated CSI ingestion or public conflict feeds
- validated peace impact, "lives saved," or field-proven AI de-escalation claims
- named customer, partner, revenue, or usage claims that are not already on record

---

## 3. Problem framing that remains credible

The strongest framing is not “more chat.” It is the gap between:

- **public identity**, which can silence participants when retaliation or stigma is real; and
- **unverified anonymity**, which can undermine trust, moderation leverage, and downstream usability.

SquadRidge sits in the middle: enough verification to support accountable process, enough pseudonymity to reduce unnecessary exposure, and enough structure for facilitators or sponsors to run serious cohorts.

---

## 4. Why now

Use the “why now” story that the repo can support today:

- institutions are under more pressure to explain identity, safety, and governance in digital programs
- privacy-preserving verification has become practical enough to ship in real product flows
- buyers increasingly need documented risk boundaries, not vague security marketing
- the repo already shows uncommon diligence discipline for an early-stage product: threat model, runbooks, release gates, and investor/partner collateral exist together

---

## 5. Best-fit buyers, partners, and users

### Best near-term buyer / sponsor archetypes

- peacebuilding organizations
- academic or policy labs running structured cohorts
- Track II / Track 1.5 facilitators
- mission-aligned programs that can support bounded pilots, facilitation, and review cycles

### Best near-term user posture

- vetted participants in bounded cohorts
- moderator- or facilitator-supported sessions
- programs that need reporting, readouts, or durable proposals after sessions

### Weak near-term fit

- mass-market consumer growth motions
- high-risk public onboarding without dedicated security review
- buyers expecting operator-blind encryption today

---

## 6. Evidence and traction language

### Repo-backed proof points

Use these before you reach for speculative market language:

- current-state summary in [`CURRENT_STATUS.md`](../../CURRENT_STATUS.md)
- diligence framing in [`DILIGENCE_OVERVIEW.md`](../../DILIGENCE_OVERVIEW.md)
- threat model and encryption scope in [`docs/security/threat-model.md`](../security/threat-model.md)
- pilot playbooks and runbooks in [`docs/operations/`](../operations)
- demo and walkthrough flows in [`src/demo/demoScript.ts`](../../src/demo/demoScript.ts) and related routes
- partner one-pager, GTM notes, and data-room index in [`docs/business/`](../business)

### Honest traction language when numbers are still thin

Say some version of:

> The repo substantiates a serious pilot foundation and a complete diligence story. We are strongest today on shipped product surface, security honesty, and partner-readiness artifacts; real external cohort metrics should only be named when they are date-bounded and on record.

If you do not have customer counts, say so plainly. “Internal QA, guided-tour demos, and partner-prep materials are ready” is better than vague “strong traction.”

---

## 7. Diligence-safe metrics

Use metrics that the current product and operations can support now or with light pilot process:

| Metric | Why it matters | Safe posture today |
| ------ | -------------- | ------------------ |
| **Verification completion** | Shows whether the proof flow is usable in practice | Safe to measure in pilot cohorts |
| **Time to match** | Captures queue friction and dropout risk | Safe to derive from queue + squad timestamps |
| **Session completion rate** | Shows operational reliability | Safe to track through bounded pilot cohorts |
| **Repeat participation** | Indicates user willingness to return | Safe if scoped to cohort windows |
| **Incidents / moderator interventions** | Safety and ops load | Safe if severity rules are defined in advance |
| **Facilitator feedback** | Core buyer signal in early pilots | Best captured with written post-session review |

Avoid vanity metrics unless you define them carefully and can explain what counts as demo data versus real pilot data.

---

## 8. Market framing without invented TAM

The cleanest market story is a **buyer-first wedge**, not a giant top-down TAM slide.

Use language like:

- “We start where sensitive dialogue programs already spend money on facilitation, safety review, and cohort operations.”
- “We compete for the budget line that currently patches together chat, moderation process, and partner reporting.”
- “Market expansion depends on proving repeatable pilot operations before claiming broad category ownership.”

If you add market numbers, they must be cited to named public sources and clearly labeled as context rather than “SquadRidge TAM.”

---

## 9. Business model posture

The current repo supports a **pilot-first revenue narrative**:

- scoped cohort or seat-month pilot packaging
- setup / enablement / reporting work disclosed honestly when services are included
- repeatable expansion within the same sponsor only after pilot evidence exists
- financial appendix figures treated as **scenario models**, not historical actuals

---

## 10. Defensibility / moat (honest version)

The best moat story today is operational and product-specific:

- facilitator-led workflow and governance discipline
- security honesty that survives diligence
- verification integrated into real product flows rather than only a whitepaper claim
- partner-facing artifacts (runbooks, data room, reporting templates) that reduce pilot friction

Future moats such as stronger privacy architecture, CSI scale-up, or regional compliance depth should stay labeled as roadmap until shipped.

---

## 11. Solo founder paragraph

Use this where a founder paragraph is required:

> SquadRidge is currently founder-led. The strength of that structure is speed, product coherence, and direct accountability for security claims. The constraint is bandwidth, so the near-term operating model is explicit: keep the core build tight, bring in specialist support for security review, design, and partner operations, and expand only against real pilot demand rather than vanity headcount.

---

## 12. What never to say

Never describe the current release as:

- “full anonymity”
- “operator-proof encryption”
- “Signal-grade E2EE”
- “proven peace impact at scale”
- “global early-warning infrastructure”
- “AI de-escalation proven in the field”
- “named traction” unless the names and numbers are cleared for use

---

## Revision note

If any investor, partner, or policy copy diverges from [`docs/security/threat-model.md`](../security/threat-model.md) or [`CURRENT_STATUS.md`](../../CURRENT_STATUS.md), fix the copy or the product story before you send the deck.
