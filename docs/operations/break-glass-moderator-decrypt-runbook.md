# Break-glass: moderator message decrypt review

Operational runbook for audited moderator access to squad message plaintext.
See migration `20260428120000_moderator_decrypt_audit_rpc.sql` and `docs/security/threat-model.md` §5.

## When to use

- Active safety incident requiring review of in-room content
- Confirmed policy violation report with facilitator sign-off
- Legal compulsion with documented authority (escalate to leadership first)

Do **not** use for routine curiosity, marketing demos, or debugging without a ticket.

## Preconditions

1. Caller holds moderator role with `Messages_select_moderator` access
2. Written justification ≥ 8 characters prepared (stored in `moderation_audit_log`)
3. Incident or review ticket ID recorded in internal ops tracker

## Procedure

1. Identify `squad_id` and message row(s) from metadata only — avoid copying plaintext into tickets
2. Call audited RPC `moderator_record_decrypt_audit` with justification before any decrypt review
3. Decrypt only the minimum messages required for the decision
4. Record outcome: no action / warning / suspension / export to legal
5. Close ticket with timestamp and reviewer identity (hashed user id in logs)

## After review

- Do not export plaintext to Slack, email, or unencrypted storage
- Rotate squad access if compromise suspected (see incident runbook)
- Update incident severity if re-identification risk materialized

## Escalation

Severity-0: suspected mass correlation, bulk export, or compelled access without counsel → page on-call per `docs/operations/incident-response.md` (create if missing).
