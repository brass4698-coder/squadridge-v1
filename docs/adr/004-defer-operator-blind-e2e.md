# ADR 004: Defer operator-blind end-to-end encryption; ship operator-readable encryption with audited moderator access

## Status

Accepted — explicit deferral. Revisit when one of the triggers in **Re-evaluation triggers** fires.

## Context

Messages are encrypted with a per-squad symmetric key stored in `squads.message_encryption_key`. Any squad member can decrypt their own room; the operator and any role with direct DB access (moderator decrypt RPC, service role) can also decrypt. See [`docs/security/encryption-scope.md`](../security/encryption-scope.md) and [`docs/security/threat-model.md`](../security/threat-model.md) §5.

[`docs/technical/rfc-e2e-messaging-key-hierarchy.md`](../technical/rfc-e2e-messaging-key-hierarchy.md) sketches the design space for operator-blind end-to-end encryption (per-user key pairs, group key derivation, optional Double Ratchet for forward secrecy). The RFC documents directions and exit criteria; it does not commit the team to building any of them.

This ADR captures the decision to **not** start that build today, and the triggers that would re-open it.

## Decision

1. **Stay operator-readable.** Continue with the per-squad symmetric key model. Keep the audited moderator-decrypt RPC ([`20260428120000_moderator_decrypt_audit_rpc.sql`](../../supabase/migrations/20260428120000_moderator_decrypt_audit_rpc.sql)) and the non-bypassable outbound redaction Edge path ([`20260428194500_messages_insert_edge_only.sql`](../../supabase/migrations/20260428194500_messages_insert_edge_only.sql)) as the safety controls that justify the model.
2. **Be honest in copy.** Public copy, marketing pages, and pitch materials must not describe the dialogue surface as Signal-grade, server-blind, or operator-proof. The phrasing in [`docs/security/threat-model.md`](../security/threat-model.md) §5 is the authoritative description.
3. **Treat E2E as a discrete program, not a sprint.** Any work beyond the existing RFC is a multi-month engineering and security effort that touches: identity / device key bootstrap (see [ADR 003](./003-zk-device-bootstrap-deferred.md)), key distribution, group membership semantics, recovery, multi-device, moderator review compatibility, and migration of existing rooms. Do not start on a single piece (for example, per-user key pairs) without a committed scope for the rest.
4. **Preserve the moderation contract.** Any future E2E design must specify what happens to moderator review and to the crisis-alert flow before it is shipped. An E2E rollout that silently breaks either is a regression in user safety, not an upgrade.

## Why now

- Pilot-stage usage is facilitator-led with named operators and a small bounded cohort. The threat model assumes an honest-but-curious operator and explicit moderator review; partner-facing copy already says so.
- The current model is the simplest one that supports moderator review, server-side outbound redaction, and key rotation without per-user key infrastructure. Each of those properties costs design work to preserve under E2E.
- The codebase already has the safety scaffolding (audited decrypt, edge-only inserts, archived key snapshots) that an E2E migration would need to reason about. Building those first reduces surprise during a future migration.
- A premature partial E2E rollout would either weaken existing moderation tooling or invite overstated marketing claims. Both outcomes are worse than today's documented model.

## Re-evaluation triggers

Open this ADR for reconsideration when **any** of the following occurs:

- **Partner contract.** A pilot or institutional partner formally requires server-blind encryption for their cohort.
- **Threat-model change.** A pilot launches in a context where an honest-but-curious operator assumption is no longer defensible (for example, a cohort that includes targets of state-level adversaries with operational reach into the platform vendor).
- **Independent review finding.** An external pentest or security review identifies the operator-readable model as a blocker to acceptance.
- **Sustained engineering capacity.** The team has at least one engineer assigned full-time for at least one quarter to drive the program, plus moderator and product owners who can rework the moderation contract.
- **Standards maturity.** Browser MLS or an equivalent vetted group-messaging primitive becomes broadly available enough to skip a from-scratch implementation.

If a trigger fires, the next steps are: revisit [`docs/technical/rfc-e2e-messaging-key-hierarchy.md`](../technical/rfc-e2e-messaging-key-hierarchy.md), expand it to a concrete plan including moderation impact and migration of existing squads, and replace this ADR with a new one that records the build decision.

## Consequences

- Public copy, pitch materials, and partner one-pagers stay aligned with [`docs/security/threat-model.md`](../security/threat-model.md). The vocabulary check in [`src/pitch-deck-hub/initialState.ts`](../../src/pitch-deck-hub/initialState.ts) (overclaim ban) remains the canonical phrasing guard.
- Moderator review remains effective with a tamper-resistant audit trail; this ADR commits to keeping it that way until a future ADR replaces this one.
- Engineering can invest in adjacent hardening (retention monitoring, IP-logging clarity, rate limits, audit views) without that work being implicitly contingent on a still-undecided E2E program.
- Anyone who reads `CURRENT_STATUS.md` looking for "is E2E shipped?" lands on a written deferral with named triggers, not on silence.

## References

- [`docs/security/encryption-scope.md`](../security/encryption-scope.md)
- [`docs/security/threat-model.md`](../security/threat-model.md) §5
- [`docs/technical/rfc-e2e-messaging-key-hierarchy.md`](../technical/rfc-e2e-messaging-key-hierarchy.md)
- [ADR 003: Defer device-bound ZK keypair bootstrap](./003-zk-device-bootstrap-deferred.md)
- [`CURRENT_STATUS.md`](../../CURRENT_STATUS.md)
