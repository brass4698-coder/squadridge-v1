# Product Overview

> **Superseded detail lives in [platform-description.md](platform-description.md)** — the canonical in-depth description. This page is a short index.

## Introduction

SquadRidge is a **facilitator-led messaging room** for high-stakes mediation and peacebuilding dialogue. Mediators and organizations run structured **written** sessions in a protected room, verify participants privately, and release **only** an approved outcome to a public ledger with a **verification anchor** — without publishing session dialogue or participant identities.

The platform is in **private pilot**, inviting mediators and peacebuilding teams. We do not claim completed pilots, partner logos, or live ledger traction unless real and approved for public mention.

## Core mechanics

**Configure → Verify → Facilitate → Release**

1. **Configure** — Facilitator sets eligibility, template (community mediation, NGO deliberation, or Track II), and ground rules.
2. **Verify** — Participants confirm privately; facilitator reviews before the room opens.
3. **Facilitate** — Structured written dialogue under facilitator control (no video/audio on SquadRidge).
4. **Release** — Facilitator drafts outcome, collects approvals, publishes with tamper-evident anchor.

**Room vs record:** Session content stays in the room. The public surface is outcome text + limited metadata only. See [platform-description.md §5](platform-description.md#5-the-core-architecture-room-vs-record).

## What it is not

- Not a video conferencing or general chat tool.
- Not operator-proof E2E encryption today — see [threat model](../security/threat-model.md).
- Not a legal instrument.

## Legacy product lines

The repository still contains **squad matchmaking** and **incident dialogue** surfaces from earlier product iterations. External description should lead with **v2 facilitator sessions** unless speaking to engineers about migration. Details: [platform-description.md §11](platform-description.md#11-feature-inventory-honest-status).

## References

- [Platform description (full)](platform-description.md)
- [Threat model](../security/threat-model.md)
- [Platform spec JSON](../../squadridge_platform_spec.json)
