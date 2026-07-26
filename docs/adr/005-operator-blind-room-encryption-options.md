# ADR 005: Operator-blind room encryption — design options (ADR before UI claims)

## Status

**Accepted as design ADR only.** No implementation commitment. UI and marketing must keep `operator_blind_e2e` as **PLANNED** in [`src/data/implementationStatus.ts`](../../src/data/implementationStatus.ts) until a future ADR records a build decision and a verified deployment exists.

Supersedes nothing. Extends [ADR 004](./004-defer-operator-blind-e2e.md) with a concrete option comparison so diligence reviewers can see the trade-offs without reading overclaimed UI.

## Context

v2 facilitator rooms store dialogue as **operator-readable plaintext** in Postgres (RLS + token-scoped participant functions). Legacy squad chat uses a per-squad symmetric key still readable by the operator. Partners evaluating SquadRidge ask, correctly: can rooms become operator-blind while facilitators still draft and release approved outcomes?

This ADR compares two families of designs against that requirement. It does **not** authorize shipping either design or changing public badges.

## Decision drivers

1. **Facilitator-authored outcome drafting** must remain possible after room encryption — the release instrument is not a transcript export; it is facilitator-authored text bound to approvals and a SHA-256 hash.
2. **Moderator / crisis review** must remain specified (see ADR 004) — operator-blind rooms that silently break safety tooling are a regression.
3. **Honesty** — no LIVE badge, homepage claim, or diligence packet line may imply Signal-grade E2E until exit criteria below are met.

## Option A — Per-session symmetric key with participant key-share wrapping

**Shape:** One room content key (AES-GCM). Each participant’s device holds a key pair; the room key is wrapped to each participant’s public key at join. Facilitator holds the room key for drafting. Operator stores only wrapped blobs + public keys.

| Pros | Cons |
| ---- | ---- |
| Simpler than Double Ratchet; fits written-round cadence | Forward secrecy weak if room key leaks mid-session |
| Facilitator can decrypt for outcome drafting with an explicit facilitator wrap | Key redistribution on join/leave is operationally delicate |
| Compatible with “one instrument per release” model | Operator still sees ciphertext metadata; recovery/break-glass needs policy |

**Facilitator outcome drafting:** Facilitator unwraps room key client-side; drafts plaintext outcome locally; releases only the hash-bound instrument (already shipped). Room ciphertext never becomes the public record.

## Option B — Double Ratchet (or MLS-class) per participant pair / group

**Shape:** Signal-style ratcheting or MLS group messaging for message ciphertext. Stronger forward secrecy and post-compromise security.

| Pros | Cons |
| ---- | ---- |
| Best cryptographic story for hostile-operator threat models | Heavy: device bootstrap, multi-device, membership epochs |
| Aligns with evaluator expectations from consumer messengers | Facilitator drafting requires a defined “facilitator epoch key” or separate outcome channel — easy to get wrong |
| | Breaks or complicates audited moderator decrypt unless redesigned (ADR 004 constraint) |

**Facilitator outcome drafting:** Prefer a **separate outcome drafting channel** (facilitator-only plaintext or facilitator-held wrap) rather than requiring the facilitator to reconstruct the full ratchet history to author a memo. Do not import room ciphertext into the ledger path.

## Recommendation (when a build trigger fires)

When any [ADR 004 re-evaluation trigger](./004-defer-operator-blind-e2e.md) fires:

1. Prefer **Option A** for the first institutional pilot that requires operator-blind rooms — lower complexity, clearer facilitator wrap, written-round fit.
2. Keep Option B as a later hardening path if partner threat models demand FS/PCS beyond Option A.
3. Write a new ADR that replaces ADR 004’s deferral with a build plan, moderation impact, migration of existing rooms, and verification tests before flipping `operator_blind_e2e` to LIVE.

## Exit criteria before any LIVE claim

- [ ] Production rooms encrypt message bodies; service-role cannot read plaintext without break-glass.
- [ ] Facilitator can author and release hash-bound outcomes without exporting room dialogue.
- [ ] Moderator / crisis path documented and tested under the new model.
- [ ] Threat model §5 and Implementation Status Registry updated in the same PR.
- [ ] External review or equivalent verification recorded.

## Consequences

- Security page, Home, and diligence packet continue to state rooms are operator-readable today.
- Engineering may prototype Option A offline without changing public status badges.
- Diligence reviewers get a citable ADR answering “have you thought about Double Ratchet vs key wrap?” without implying shipping.

## References

- [ADR 004](./004-defer-operator-blind-e2e.md)
- [`docs/technical/rfc-e2e-messaging-key-hierarchy.md`](../technical/rfc-e2e-messaging-key-hierarchy.md)
- [`docs/security/threat-model.md`](../security/threat-model.md) §5 / §13
- [`src/data/implementationStatus.ts`](../../src/data/implementationStatus.ts) — `operator_blind_e2e`
