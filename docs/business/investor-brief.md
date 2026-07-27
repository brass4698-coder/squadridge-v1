# Investor Brief

**Audience:** investors, funders, advisors doing first-pass diligence  
**Stage:** pre-pilot product foundation (v2 facilitator platform)  
**Last updated:** July 2026  
**Honesty rule:** Do not invent traction, partners, logos, pilots, or LIVE crypto claims. Prefer [`../../CURRENT_STATUS.md`](../../CURRENT_STATUS.md) and [`../../src/data/implementationStatus.ts`](../../src/data/implementationStatus.ts).

---

## One-line category

**Private deliberation infrastructure** — facilitator-led written rooms with a deliberate release gate and optional integrity-anchored publish. Not a consumer messenger. Not open matchmaking.

Public framing (aligned with site copy): SquadRidge is facilitator-led infrastructure for structured private deliberation — a small group works through a sensitive issue in a controlled written room, and only an approved outcome can leave as a public record.

---

## Product spine

| Institutional shorthand | Product stages |
| ----------------------- | -------------- |
| **Enclosed** | Configure → Verify → Facilitate (private room) |
| **Release gate** | Approvals + facilitator attestation before anything leaves the room |
| **Published** | Optional private anchored memo, or public ledger entry with SHA-256 verification |

Canonical lifecycle copy: **Configure → Verify → Facilitate → Release**.

Architectural line: **the room and the record are separate by design** — not a policy toggle.

---

## What’s LIVE / SCAFFOLDED / PLANNED

Pulled from the Implementation Status Registry (`src/data/implementationStatus.ts`, registry version `2026.07.25`). Marketing and diligence must not invent LIVE claims beyond this list.

### LIVE (shipped, exercised in product paths)

| Claim | Summary |
| ----- | ------- |
| SHA-256 verification anchor on release | Hash of canonical approved text stored with the record; recomputable by anyone holding the text |
| Hash-bound approvals | Approvals bound to exact wording; edits reset approvals |
| Facilitator authorship attestation | Release requires attestation bound to the same hash |
| Metadata-only audit trail | Lifecycle events logged without message bodies |
| Magic-link auth | Invite-linked passwordless sign-in |
| Role-scoped invites | Bearer tokens scoped to room and role |
| Manual pilot intake review | Human review; ~one-week reply aim; no self-serve approval |
| Invite-only access | No open deployment for pilot scopes |
| Approved-outcomes-only release → ledger pipeline | Mechanism live; **public ledger empty of real pilot entries** until an org releases and opts in. Current ledger cards may be labeled illustrative specimens |
| IOA-aligned confidentiality architecture | Professional benchmark alignment — **not** IOA-certified |

### SCAFFOLDED (schema / types exist; not doing production work at release)

| Claim | Summary |
| ----- | ------- |
| RFC 3161 trusted timestamping | Columns/interfaces exist; optional TSA client env-gated. **Release does not store a verified TimeStampToken in production** until a live authority path is configured. An anchor proves integrity, never time |

### PLANNED (intent only — no runtime path as LIVE)

| Claim | Summary |
| ----- | ------- |
| Operator-blind room encryption | **Rooms are operator-readable today.** Per-participant key distribution is a separate programme ([ADR 005](../adr/005-operator-blind-room-encryption-options.md)) |
| Legal privilege / court instrument | Not claimed — counsel decides privilege |
| Court-admissible timestamps | Not claimed without a live, verified RFC 3161 path |
| Full platform zero-knowledge | Not claimed; legacy ZK paths soft-retired |

Full narrative: [`../product/platform-description.md`](../product/platform-description.md) · Security UI: `/security` · Registry: `src/data/implementationStatus.ts`

---

## Explicit non-claims

Do **not** treat SquadRidge as asserting any of the following today:

- Signal-grade / operator-blind end-to-end encryption of room content
- Court-admissible time proofs (RFC 3161 not production-live)
- Completed external security audit or certification
- Live paying customers, named pilot partners, logos, or traction metrics
- Quantitative “lives saved,” conflict-prevention percentages, or early-warning at scale
- Full-platform zero-knowledge anonymity for the v2 deliberation product
- That illustrative ledger specimens are real released pilot outcomes

---

## Recommended wedge

**First:** NGO / board / HR private anchored decision memo (`ngo_deliberation` template) — parties deliberate in an enclosed room; facilitator releases a **private** integrity-anchored memo. Operator-readable room content disclosed in the MOU.

**Optional stretch:** public ledger publish when the organisation opts in.

**Not the beachhead:** citizen matchmaking, Track II audit-grade procurement, military-adjacent deployment, or Signal-replacement positioning.

Ops path: [`../operations/v2-pilot-checklist.md`](../operations/v2-pilot-checklist.md)

---

## Competitive wedge (why not Slack / Notion / Signal)

See [`./competitive-wedge.md`](./competitive-wedge.md) — private written room + facilitator process control + deliberate release gate + citable integrity anchor, with honest operator limits.

---

## Ask posture

Capital (grant, angel, or pre-seed — **amount TBD; not a fixed ask in this repo**) unlocks:

1. **Bounded pilots** — staging dry-run → first private NGO/board/HR memo pilot → 2–3 additional pilots  
2. **Scoped external security review** — RLS, auth, release path (template: [`../security/external-review.md`](../security/external-review.md); **none complete yet**)  
3. **Facilitator ops + evidence discipline** — runbooks, evidence pack, closeout metrics  

Planning ranges for budget buckets live in [`./use-of-funds-and-milestones.md`](./use-of-funds-and-milestones.md) and are labeled **planning anchors**, not committed fundraising terms.

---

## Start-here reading order

1. This brief  
2. [`../../CURRENT_STATUS.md`](../../CURRENT_STATUS.md)  
3. [`../security/threat-model.md`](../security/threat-model.md)  
4. Security product surface: `/security` (claims grid, operator access, diligence FAQ)  
5. [`../operations/v2-pilot-checklist.md`](../operations/v2-pilot-checklist.md)  
6. [`./data-room-index.md`](./data-room-index.md)  
7. Architecture one-pager: [`../technical/diligence-architecture.md`](../technical/diligence-architecture.md)  
8. Diligence overview (short): [`../../DILIGENCE_OVERVIEW.md`](../../DILIGENCE_OVERVIEW.md)

Also useful: trust diligence packet (`docs/security/trust-diligence-packet.md` / `/diligence/trust-diligence-packet.md`), competitive wedge, use-of-funds & milestones, pilot evidence pack template.
