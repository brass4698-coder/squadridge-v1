# SquadRidge — how to explain it

This page is the **short spoken and written spine** for describing SquadRidge. The full in-depth description is [product/platform-description.md](product/platform-description.md). Public copy must not promise stronger privacy than [Operational threat model](../security/threat-model.md) §5 (“Claims that hold today”). **Do not claim completed pilots, partner traction, or live ledger outcomes unless true.**

---

## Primary audience (default)

**Default listener: facilitator / mediator / NGO programme lead** — lead with _problem, protected room, verifiable outcome, honest limits_. Use the **one-liner** and **~30 seconds** blocks below first.

| Audience | Emphasis |
| -------- | -------- |
| **Mediator / facilitator** | Facilitator-led written room; nothing published from dialogue; release only what parties approve; verification anchor on the record. |
| **Investor / partner** | Room/record separation as wedge; invite-only pilot; process platform for high-stakes dialogue — not generic chat or Zoom. Name adoption and trust risks; **no fabricated traction.** |
| **Engineer / security** | React + Supabase v2 sessions; honest operator visibility; anchor at release; point to [threat model](../security/threat-model.md). |

---

## One sentence

**SquadRidge lets facilitators run high-stakes dialogue in a protected written room, then release a public outcome anyone can verify — without exposing who said what.**

---

## ~30 seconds

When the conversation is sensitive, the wrong tool ends it: video calls leave no credible record, shared docs expose everything, surveys do not verify who spoke. SquadRidge is a **facilitator-led messaging room** — structured written dialogue under facilitator control, private verification, and a deliberate release step. Only the approved outcome goes public, with a tamper-evident anchor — **not a transcript**. There are no video or audio calls on the platform. We are in **private pilot**, inviting mediators and peacebuilding teams.

_Differentiator in one breath:_ **protected room, verifiable record — one clear line between them.**

---

## ~2 minutes

1. **Problem** — High-stakes mediation needs a room where parties can speak without fear of leaks, and a public outcome people can trust — without a transcript that doxxes participants.

2. **What SquadRidge is** — A **facilitator-led messaging platform**: Configure → Verify → Facilitate → Release. Written rounds, facilitator authority, invite-only access.

3. **Room vs record** — Everything said in the room stays in the room. Only facilitator-approved outcome text becomes public, with a verification anchor. Identities are verified privately, never on the ledger.

4. **Honest limits** — Not Signal-style E2E against the operator today; not video; not legal arbitration. Credibility beats buzzwords — see [threat model](../security/threat-model.md).

5. **Pilot** — Closed pilot; request access; we review manually. Ledger may show **illustrative examples** until real records are published.

6. **Close** — Offer a walkthrough of the facilitator flow when a demo environment is available.

---

## FAQ (keep answers short)

### Is this like Zoom?

No. SquadRidge is a **written, facilitator-led room** and a **verifiable released record** — not video conferencing.

### What are the limits of “anonymous”?

We use **directional anonymity**: participants are **verified** by the facilitator but **not named** on the public record. The service still has account identifiers and audit metadata. Peers may infer from writing style. See [threat model](../security/threat-model.md) §3–§5.

### Is message content end-to-end encrypted against the platform?

**Not today for v2 session rooms** in the Signal sense. Legacy squad chat uses application-layer encryption with operator-accessible keys. Room-level E2E is on the roadmap. Say “protected and access-controlled” or cite the [threat model](../security/threat-model.md).

### What do users leave with?

An **approved outcome record** on the public ledger (when released) — citable text plus verification anchor — **not** a chat transcript.

### Do you have live pilot results or partners we can name?

Only if **verified and approved** for public use. Default answer: **private pilot, inviting mediators and peacebuilding teams** — no invented logos, counts, or testimonials.

---

## Phrases to use sparingly

- **“Zero-knowledge”** — Qualify; legacy Semaphore path only. Prefer **“verified privately, not disclosed on the record.”**
- **“End-to-end encrypted”** — Do not use unqualified for session content.
- **“Not a transcript”** — Good differentiator for deliverables.

---

## Credibility moves

- End with **“I can walk through the facilitator flow”** when demo is available.
- If asked “like Signal?” — answer from the [threat model](../security/threat-model.md).
- If showing the ledger — say whether records are **live or illustrative**.

---

## Full detail

[product/platform-description.md](product/platform-description.md)
