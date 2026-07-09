# User Personas

> **Canonical audiences:** [platform-description.md §4](platform-description.md#4-target-audiences). These personas reflect the **v2 facilitator-led product** — not the legacy citizen matchmaking story.

---

## 1. The Professional Mediator / Facilitator (primary)

**Profile:** Certified mediator, community facilitator, or institutional dispute-resolution lead who runs sessions where parties will not speak on ordinary channels.

**Goals:**

- Run contentious sessions where parties speak freely, knowing **nothing said in the room is published**.
- Verify participants privately without exposing identities on any public record.
- Release a **single citable joint statement** with full control over what becomes public.
- Maintain credibility with institutions and funders through a **verifiable anchor**, not an informal memo.

**Pain Points:**

- Video calls expose faces and voices; they leave no integrity-checked public outcome.
- Email and shared docs leak drafts and attribution.
- Surveys and forms do not support structured multi-party written dialogue under facilitator control.
- General chat tools have no Configure → Verify → Facilitate → Release lifecycle.

**How SquadRidge Helps:**

- Facilitator-led **messaging room** with structured written rounds.
- Private verification workflow; directional anonymity on the public record.
- Deliberate release with SHA-256 verification anchor on published outcomes.

**Pilot note:** This persona is the **beachhead**. Marketing speaks to them first.

---

## 2. The Peacebuilding NGO Programme Lead (secondary)

**Profile:** Director or coordinator at an NGO or civil-society network documenting sensitive deliberations for boards, funders, or partners.

**Goals:**

- Capture **what was agreed** without publishing **who said what**.
- Produce a funder-safe or partner-safe record without a weaponizable transcript.
- Protect field staff who need to voice concerns without names attached to positions.

**Pain Points:**

- Internal Slack/email creates retention and leak risk.
- Public statements from NGOs are disputed without verifiable process.
- Stakeholders demand evidence of deliberation without exposing individuals.

**How SquadRidge Helps:**

- NGO deliberation template with optional **non-public** outcome default.
- Decision-memo outcome structure; facilitator-controlled release.
- Same room/record separation as mediation use cases.

---

## 3. The Track II / Cross-Line Convener (tertiary)

**Profile:** Civil-society actor convening dialogue across a conflict line where identities are sensitive but a **shareable communiqué** is needed.

**Goals:**

- Hold cross-line exchange entirely in a **protected written room** on SquadRidge (no parallel call tools).
- Publish a communiqué or statement of common ground **without attributions**.
- Give third parties a record they can verify was not altered after release.

**Pain Points:**

- Physical convenings are costly and risky; video exposes participants.
- Informal backchannels produce outcomes that cannot be verified publicly.
- Parties distrust each other’s summaries of “what was agreed.”

**How SquadRidge Helps:**

- Track II template with communiqué outcome structure and all-party approval rule.
- Verification anchor on released public records.
- Explicit **no video/audio** product boundary.

---

## 4. The Institution Administrator (supporting)

**Profile:** `institution_admin` or operations lead managing facilitators, invites, and organisational access within a pilot.

**Goals:**

- Onboard facilitators via invite-only access.
- Review access requests; coordinate with SquadRidge team during private pilot.
- Ensure organisational users understand room vs record boundaries.

**How SquadRidge Helps:**

- Staff invite console, role assignment, access-request intake.
- Institution dashboard shell (deep org analytics not yet productized).

---

## Personas **not** centered in v2 marketing

### Legacy “concerned citizen” matchmaking persona

Citizens matched into opposing-side squads via intent pools and Semaphore verification remain in the **legacy codebase** (`/match`, `/session/:squadId`). They are **not** the current beachhead narrative. See [platform-description.md §11](platform-description.md#11-feature-inventory-honest-status).

### Policy analyst / early-warning persona

Aggregated sentiment and early-warning analytics appear in research materials and dashboard fixtures but are **not shipped** as a primary v2 product. Do not pitch SquadRidge primarily as a surveillance or early-warning data platform.

---

## References

- [Platform description](platform-description.md)
- [Product one-pager](../product-one-pager.md)
- [Founding north star](../founding/north-star.md)
