# SquadRidge — Category Positioning & Go-to-Market Strategy

**Status:** Working strategy · **Last updated:** July 2026
**Audience:** Founder, contributors, and anyone writing public copy or pitching the product.
**Companion docs:** [`north-star.md`](north-star.md) (decision tests) · [`../product/platform-description.md`](../product/platform-description.md) (full product truth) · [`../product/civic-early-warning-response-model.md`](../product/civic-early-warning-response-model.md) (civic early-warning → proposal vision) · [`../security/threat-model.md`](../security/threat-model.md) (privacy claims boundary)

This document defines **the one product category SquadRidge occupies**, the market wedge, the audience stack, and the message guardrails. It exists so the homepage, the pitch, and the pilot pipeline all say the same thing.

---

## 1. The category (one sentence)

> **Verified, facilitator-governed deliberation for small, high-trust groups handling sensitive issues.**

SquadRidge is not "the platform for everyone with a hard problem." It is one tightly defined mechanism, applied across contexts:

1. A **limited set of verified people** enter a protected room.
2. **Identities are governed** — verified privately, never publicly attributed.
3. **Discussion stays private** — no transcript, no open feed.
4. **Only approved outcomes** become a durable, verifiable record.

Every strong use case is this mechanism wearing different clothes. Every weak use case breaks one of the four properties.

### Positioning statement

> SquadRidge is privacy-first deliberation infrastructure for verified small-group problem-solving. It allows a limited number of approved participants to work through sensitive issues — **without public attribution** — inside a facilitator-governed room, while producing outcome records that can be trusted outside the room.

**Honesty note (binding):** the category is *governed* deliberation, not *anonymous* deliberation. Public copy must not use unqualified "anonymous" — the platform is **directionally anonymous** (the facilitator verifies identity privately; the platform binds accounts and audit events server-side). Approved phrasings: "without public attribution," "identities are verified privately, never disclosed on the record," "no participant names on the public record." See threat model §5 and [`../product/platform-description.md`](../product/platform-description.md) §12 for the full do-not-say list.

### What the product is *not* (category edges)

- Not a generic anonymous chat platform or brainstorming tool.
- Not open-signup collaboration software — access is reviewed, rooms are limited-entry.
- Not surveillance, monitoring, scoring, or predictive analytics.
- Not a legal instrument — it proves release-process integrity, not substance.

---

## 2. Business strategy (one sentence)

> **We sell governed deliberation rooms for sensitive decisions that cannot be handled safely in ordinary collaboration tools.**

| Element | Definition |
| ------- | ---------- |
| **Primary buyer** | Institutions, agencies, NGOs, universities, funded programs; later enterprise governance teams |
| **Primary user** | Facilitator, mediator, program lead, ombuds, trusted convener, designated administrator |
| **Core value** | Verified participation · protected discussion · structured approval flow · auditable outcomes |
| **Why not ordinary tools** | Email/docs/chat leak attribution; calls leave no credible record; surveys don't verify who spoke |

### Pricing logic (directional, pre-validation)

1. **Pilot-based onboarding** — manual review, deliberate cohort, no self-serve (matches current access model).
2. **Room-limited tiers** — pricing scales with concurrent rooms / sessions, not seats.
3. **Facilitation & governance tier** — templates, approval policies, institutional release packaging.
4. **Compliance / security tier** — for larger institutions: audit trails, diligence artifacts, review support.

Do not publish pricing until validated with real pilot partners.

---

## 3. Market wedge and audience stack

**Entry point:** institutional and civic high-stakes deliberation. Expand into enterprise later.

| Priority | Audience | Role in strategy |
| -------- | -------- | ---------------- |
| **1** | Mediators, facilitators, civic and multi-agency operators | Strongest fit with current product logic — build and write for them first |
| **2** | NGOs, universities, municipalities, institutional programs | Credible pilot buyers with sensitive coordination needs |
| **3** | Funders and policy sponsors | Back the work; care about evidence and process integrity |
| **4** | Enterprise governance, ombuds, HR, workforce-policy teams | Expansion path — legible on the site, never the homepage identity |

**Rule:** build platform and copy for tiers 1–2; keep tiers 3–4 legible without centering them.

### Use-case framing rule

Contexts on the site (mediation, restorative processes, civic coordination, ombuds inquiry, internal policy, resource/governance disputes, peacebuilding) are presented as **examples of the same room model** — never as separate product identities. The homepage section "Different matters. The same governed room." is the canonical expression of this rule.

---

## 4. Message guardrails

**Avoid these traps:**

- Do not market SquadRidge as a generic anonymous chat platform.
- Do not lead with "for everyone solving any problem" — it weakens trust and category clarity.
- Do not make war / global de-escalation the hero message — powerful but too large and abstract for an institutional landing page.
- Do not make enterprise HR the sole framing — it undersells the platform's seriousness.
- Do not use unqualified "anonymous," "end-to-end encrypted," "zero-knowledge," or traction claims — see the do-not-say list in [`../product/platform-description.md`](../product/platform-description.md) §12 and §14.

**Approved umbrella language:**

- "High-stakes institutional problem-solving"
- "Sensitive structured deliberation"
- "Governed deliberation for high-stakes issues"
- "Verified deliberation for sensitive decisions" (current homepage headline)

---

## 5. Design direction (summary)

The design communicates **restricted access, legitimacy, and calm control** — not social engagement or startup hype.

- Restricted, quiet, institutional visual language; low-color palette with one accent.
- Fewer marketing claims; more operational clarity (verification and release states as UI).
- Sparse hero, strong typography, structured diagrams.
- UI metaphors: **rooms, eligibility, approvals, release, record** — never feeds, comments, reactions, or teamwork.

This reinforces the architectural principle that anchors everything: **the room is never the record.** Full art direction lives in [`../design/institutional-visual-system.md`](../design/institutional-visual-system.md).

---

## 6. Where this is expressed today

| Surface | Expression |
| ------- | ---------- |
| `src/data/siteMessaging.ts` → `SITE_THESIS` | Positioning statement (honest-anonymity phrasing) |
| Homepage hero | "Verified deliberation for sensitive decisions." + support points |
| Homepage "One room model" section | Use-case framing rule |
| `TARGET_AUDIENCES` (siteMessaging) | Audience stack, tier order |
| Request-access flow | Pilot-based onboarding (manual review, honest response window) |

When positioning changes, update this document and those surfaces together.
