# Competitive Wedge Matrix

**Audience:** investors, partners, facilitators comparing tools for private deliberation  
**Last updated:** July 2026  
**Tone:** calm comparison — not alarmist. SquadRidge is **pre-pilot**; this is category fit, not traction.

Linked from [`investor-brief.md`](./investor-brief.md) and [`data-room-index.md`](./data-room-index.md).

---

## What buyers are actually choosing among

Sensitive internal deliberation often lands in tools built for something else: chat throughput (Slack/Teams), document collaboration (Notion/docs), or personal messaging privacy (Signal/WhatsApp). Generic mediation platforms may help with case workflow, but rarely combine a **controlled written room**, a **hard release gate**, and a **citable integrity anchor** with disclosed operator limits.

SquadRidge’s wedge: **private deliberation infrastructure** — Enclosed → Release gate → Published — with honesty about what the operator can still read today.

---

## Comparison

| Dimension | SquadRidge (v2) | Slack / Teams | Notion / shared docs | Signal / WhatsApp | Generic mediation platforms |
| --------- | --------------- | ------------- | -------------------- | ----------------- | --------------------------- |
| **Private written room** | Purpose-built facilitator control room + token-gated participant path; dialogue stays off the public record by design | Channels and DMs optimized for ongoing org chat; easy sprawl and side threads | Pages and comments; collaboration by default, hard to enforce “room vs record” | Strong personal messaging; not a facilitated multi-party process room with roles | Often case notes / scheduling / video; written room may be secondary or absent |
| **Facilitator process control** | Configure → Verify → Facilitate → Release lifecycle; verification review and room open under facilitator | Admins and channel owners; no deliberation lifecycle | Page permissions; no verify → facilitate → release spine | Little institutional process control | Case status and appointments common; integrity-bound release less common |
| **Deliberate release gate** | Approvals + facilitator attestation bound to exact outcome text before release | Messages are already “out” once sent | Publish/share is continuous; drafts leak via links and history | Messages leave the device when sent; no institutional release instrument | Outcomes may be reports or settlements without hash-bound gates |
| **Citable integrity anchor** | LIVE: SHA-256 of approved text on release; optional public ledger when org opts in | No content-integrity ledger for decisions | Version history ≠ independent recomputable anchor of a released instrument | No institutional public/private decision ledger | Audit logs vary; rarely a partner-recomputable SHA-256 release anchor |
| **Honest operator limits** | Documented: rooms **operator-readable today**; RFC 3161 scaffolded; operator-blind E2E planned ([threat model](../security/threat-model.md), [ADR 005](../adr/005-operator-blind-room-encryption-options.md)) | Employer/admin visibility depends on plan and compliance tooling | Workspace admins typically can access content | Strong E2E for the messenger threat model; weak fit for facilitator-authored release + institutional audit | Operator/access models vary; often under-disclosed in sales decks |

---

## How to use this in diligence

- Prefer SquadRidge when the job is **bounded private deliberation** with a **single approved memo** (NGO/board/HR beachhead), not continuous chat.
- Prefer Slack/Teams/Notion when the job is day-to-day collaboration without a hard room/record line.
- Prefer Signal/WhatsApp when the job is personal messaging with operator-blind E2E — and accept the lack of institutional release infrastructure.
- Prefer a mediation suite when the job is case management or video-first practice — and ask separately about integrity anchors and operator readability.

**Non-claims:** This matrix does not assert customer wins, switching rates, or completed pilots.
