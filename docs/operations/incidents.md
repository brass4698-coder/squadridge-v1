# Incident Response Guide

Use this guide for production or pilot incidents involving participant safety, privacy, moderation, system integrity, or partner trust.

## Scope

This runbook is intentionally lightweight. It is meant to make the first 30 minutes of response calmer and more consistent while the platform is still in pilot-stage maturity.

## Severity Levels

### `SEV-0`

Active or suspected mass privacy compromise, privileged data export, systemic re-identification risk, or safety event with immediate real-world danger to participants.

### `SEV-1`

High-severity security or safety issue affecting one or more live cohorts, including unauthorized moderator actions, broken access control, or major session abuse.

### `SEV-2`

Serious production degradation, session disruption, repeated verification failures, or localized moderation issue without evidence of broad compromise.

### `SEV-3`

Low-severity bug, partner-facing defect, or isolated issue with a known workaround.

## Roles

Assign these roles before each pilot window:

- incident lead: owns decisions and timeline
- technical lead: investigates system behavior and mitigations
- moderation lead: reviews participant safety impact and content actions
- partner contact: communicates with pilot partner or facilitator
- note taker: maintains timeline and evidence log

One person may hold multiple roles in early pilots, but the role ownership should still be explicit.

## First 30 Minutes

1. Classify the severity.
2. Freeze non-essential deploys and schema changes.
3. Preserve evidence:
   - timestamps
   - affected routes or functions
   - user IDs or squad IDs involved
   - relevant logs and screenshots
4. Confirm whether the incident is ongoing.
5. Contain if needed:
   - disable risky flow
   - pause pilot cohort
   - revoke compromised credentials
   - restrict moderator access
6. Notify the assigned partner contact for `SEV-0` and `SEV-1`.
7. Open a written incident timeline in the repo issue tracker or secure internal channel.

## Containment Options

- disable entry to affected session routes
- pause queue or matchmaking jobs
- temporarily remove moderator privileges from affected accounts
- rotate secrets if privileged access is suspected
- suspend public demos until facts are known

Do not claim full resolution while the blast radius is still uncertain.

## Communication Rules

- be factual, not reassuring-by-default
- distinguish known facts, current hypotheses, and open questions
- avoid stronger privacy claims than the threat model supports
- do not blame individual users or moderators before evidence exists
- keep partner updates concise and timestamped

## Evidence Checklist

- deployment version or commit
- env and config context
- function names involved
- Supabase tables or policies implicated
- screenshots of partner-facing impact
- mitigation actions and exact timestamps

## Recovery Criteria

An incident is not closed until:

- the immediate issue is contained
- root cause is documented or tightly narrowed
- user/partner impact is assessed
- follow-up tasks are assigned with owners
- any needed doc or process changes are captured

## Post-Incident Review

Capture these items within 72 hours:

- what happened
- who was impacted
- what worked in response
- what failed in response
- product fix required
- operational fix required
- communication fix required

Update one or more of:

- [`production-checklist.md`](./production-checklist.md)
- [`pilot-runbook.md`](./pilot-runbook.md)
- [`../security/threat-model.md`](../security/threat-model.md)
