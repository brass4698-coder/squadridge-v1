# MENDguild: strategic repositioning — early warning and prevention

## How to read this document

| Scope | Meaning |
| ----- | ------- |
| **Aligned with shipped product today** | Capabilities that exist in the codebase, subject to limits in [`../security/threat-model.md`](../security/threat-model.md) and [`../../CURRENT_STATUS.md`](../../CURRENT_STATUS.md). |
| **Strategic direction (not yet product-complete)** | Category vision, partner archetypes, and roadmap hypotheses. **Not** a commitment of current features, integrations, or validated impact. |

**Quantitative targets** in this doc (e.g. risk reduction percentages, lives saved, funding asks) are **hypotheses and planning anchors** until backed by a published methodology, pilot data, and third-party review. Do not cite them as realized outcomes in partner-facing materials without that evidence.

For the **honest current-state** story, use [`../../CURRENT_STATUS.md`](../../CURRENT_STATUS.md) and the [pilot one-pager](pilot-partner-one-pager.md).

---

## Aligned with shipped product today

The live product already supports:

- **Verified access** without exposing real-world identity in the dialogue surface (see threat model for operator visibility).
- **Small, structured squads** and facilitator-oriented session UX (turns, safety affordances, moderation).
- **Operator-mediated safety** (reports, moderator routes) appropriate for bounded pilots.
- **Ledger / published outcomes** as a path to **citable accountability** for what groups agree to release publicly—not a transcript archive.

These elements are compatible with a **prevention-minded** narrative *if* copy stays bounded: structured dialogue at sensitive moments, not “global early-warning infrastructure” as a shipped claim.

---

## Strategic direction (not yet product-complete)

### Pillar 1 — Reframe the category: detection and de-escalation, not “chat”

**Narrative shift (external):** From “dialogue platform” toward **infrastructure for timely, structured contact across conflict lines** when tensions matter—always with human facilitation and clear privacy boundaries.

**Hero-level language (examples for decks, not unqualified product claims):**

- Emphasize **moments when tensions rise** and **mediated structure** rather than generic connection.
- Pair every bold sentence with **pilot scope**, **facilitator role**, and a pointer to the **security disclosure**.

### Pillar 2 — Conflict Severity Index (CSI) — **roadmap concept** (with **partial** shipped plumbing)

A **full** partner-facing Conflict Severity Index would synthesize *allowed, ethically governed* signals (e.g. de-identified dialogue-derived metrics where enabled, facilitator inputs, and external data partners) into a **regional or program-level** view for vetted partners.

**Shipped in MVP form (not a public or institutional product line yet):** Postgres tables, RLS, and an internal **moderator-only** console at `/admin/csi` for rostered staff — see [`../../CURRENT_STATUS.md`](../../CURRENT_STATUS.md). **Not shipped:** public maps or APIs, broad automated ingestion, partner export, and any claim that CSI is a validated early-warning system at scale. Specification and privacy review: [`../product/csi-spec.md`](../product/csi-spec.md), [`../product/conflict-severity-index.md`](../product/conflict-severity-index.md) (draft methodology).

### Pillar 3 — Peace rapid response — **roadmap concept**

A **future** rapid-response protocol would link elevated signals (human-confirmed) to **facilitator workflows**: who to brief, how to convene, how to document outcomes. Automation (“auto-form squads”) is a **design option**, not a commitment; ethics and false positives must be resolved first.

### Pillar 4 — Partner archetypes (outreach targets, not integrations)

**Tier 1 (operational peace infrastructure)** — *targets for conversation*, not active relationships unless recorded elsewhere:

- UN regional mechanisms and mediation support units  
- Humanitarian and protection actors with field presence  
- Conflict analysis and rights organizations (evidence and diligence culture)  

**Tier 2 (scale and validation)** — *targets for conversation*:

- Academic peace and conflict research labs  
- Local NGO coalitions in bounded geographies  
- Peace-tech and data-governance consortia  

**Pitch spine (bounded):** Offer **scoped pilots** with transparent methodology, moderator oversight, and published limits—*not* “we already power your early-warning stack.”

### Pillar 5 — Evidence discipline — **hypothesis, not claim**

**Hypothesis (to be tested):** Structured, verified-anonymous micro-squads at escalation-relevant moments, with facilitator oversight, may improve short-horizon outcomes versus matched controls—*definition of “outcome” and “control” to be pre-registered with partners*.

**Measurement principles:**

- Pre-specify cohorts, metrics, and limitations.  
- Prefer third-party or arm’s-length validation for strong claims.  
- Separate **pilot evidence** from **production-scale** assertions.  
- Align with [`impact-metrics.md`](impact-metrics.md) and operational runbooks.

---

## Missing-link narrative (for decks and senior briefings)

**The conflict prevention paradox (summary):** Many systems watch conflict from afar; fewer offer **regular, structured, cross-line contact** with **verification and safety framing** at the moment programs choose to intervene. MENDguild’s wedge is **trust infrastructure for those moments**—not omniscient prediction.

**Honesty guardrails** (competitive advantage):

- Do not claim to “solve conflict” or to replace state or UN early-warning systems.  
- Do not imply Signal-grade operator-proof encryption; cite [`../security/encryption-scope.md`](../security/encryption-scope.md).  
- Do not present demos as field pilots; label walkthroughs clearly (see [`../technical/demo-walkthrough.md`](../technical/demo-walkthrough.md)).

---

## Messaging hierarchy (bounded)

**Level 1 — Hook (one sentence):**  
MENDguild is **pilot-stage infrastructure** for **facilitator-led**, **verified**, **small-group** dialogue and **citable outcomes** when cross-border contact must be safe and structured.

**Level 2 — Mechanism (add only when accurate):**  
Organizations define cohorts and facilitation; the product provides matching, session structure, safety tooling, and optional analytics **only where enabled and governed**.

**Level 3 — Vision (optional, clearly labeled roadmap):**  
Over time, ethically governed metrics and partner workflows could support **earlier, evidence-based mediation support**—scoped in [`../product/csi-spec.md`](../product/csi-spec.md).

---

## Elevator variants (pick audience; keep limits explicit)

- **Institutional partner:** Bounded pilots, verified access, facilitator control, clear security posture—ready for diligence.  
- **Funder:** Prevention-oriented category; **hypothesis-driven** measurement; capital to scale pilots and evidence, not to claim finished global coverage.  
- **Practitioner:** Less Zoom/Signal sprawl; more structure, verification, and accountability artifacts for sensitive programs.  
- **Researcher:** Pre-registered pilot design; separation of dialogue data, metadata, and published ledger outcomes.

---

## Roadmap phases (documentation only — align with `CURRENT_STATUS`)

| Phase | Intent |
| ----- | ------ |
| **Near term** | Institution-led pilots, runbooks, metrics that are actually collected, security maturity. |
| **Medium term** | Deeper partner reporting, optional analytics pipelines, moderator tooling—each gated on governance review. |
| **Long term** | CSI-style views and integrations **only** after spec, RLS/ethics review, and evidence path are explicit. |

---

## Related documents

- [`../../CURRENT_STATUS.md`](../../CURRENT_STATUS.md) — what is real today.  
- [`go-to-market.md`](go-to-market.md), [`partnership-strategy.md`](partnership-strategy.md) — market and partner framing.  
- [`../product/csi-spec.md`](../product/csi-spec.md) — draft CSI outline (not implemented).  
- [`../security/threat-model.md`](../security/threat-model.md) — non-negotiable honesty on risk.
