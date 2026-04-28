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

## Service-role break-glass

The Supabase **service role** bypasses Row Level Security and can read every row, including `squads.message_encryption_key` and `squads.archived_encryption_key_snapshot`. Direct privileged DB access is the **last resort** during an incident, not a routine investigation tool.

### When it is acceptable

- a `SEV-0` or `SEV-1` ticket is open and the incident lead has explicitly authorised it
- the audited moderator-decrypt path (see § Moderator decrypt-for-review) is **not** sufficient — typically because the audit RPC itself is suspect, or the affected data lives outside `messages.payload_ciphertext`
- a contractual partner review clause has been invoked **and** named in the incident timeline

### When it is not acceptable

- routine debugging or "just to look"
- spot-checking message content (use the audited `moderator_decrypt_message_for_review` path instead — see § Moderator decrypt-for-review)
- bulk export of squad keys or ciphertext
- reading the Supabase SQL Editor while logged in with a developer account whose normal role does not include service-role access

### Required controls

Every break-glass session must satisfy **all** of the following before any privileged read:

- **Severity gate.** Open `SEV-1` or `SEV-0` ticket exists in the incident tracker; the incident ID is recorded against the access.
- **Dual control.** Two named owners (typically the incident lead and the technical lead) acknowledge the access in the incident timeline before it begins. One person alone may not justify and execute the same break-glass.
- **MFA.** The Supabase project is configured to require MFA on the account performing the read; confirm in the project's Auth settings before proceeding.
- **Justification.** A free-text reason (incident ID + the question being answered) is recorded in the incident timeline. "Investigating SEV-1" alone is not sufficient — name the question.
- **Scoped access.** Use the narrowest read possible: a single squad ID, a single time window, a single column. Do not run `SELECT *` against `public.squads` or `public.messages`.
- **Audit trail.** Capture the exact SQL run and the size of the result set in the incident timeline. Do **not** paste row contents into a chat or ticket.

### Squad-key rotation

The atomic accessor `public.get_or_create_squad_message_key(p_squad_id uuid)` (migration `20260429120000_squads_get_or_create_message_key_rpc.sql`) is the prerequisite for safe in-product key rotation:

1. Confirm the squad has no active session (or accept that messages mid-flight will fail to decrypt for the rotation window).
2. As service role, set `public.squads.message_encryption_key = NULL` for the target `squad_id`.
3. The next call to `get_or_create_squad_message_key` from a member or moderator regenerates the key and stores it. Members reload their session; old ciphertext **does not** decrypt with the new key.
4. If you also need to preserve the prior key for moderator review, ensure the squad's archived snapshot exists first via `moderator_archive_squad` (migration `20260428123000`); otherwise the old key is gone after step 3.
5. Record the rotation in the incident timeline with the squad ID, before/after timestamps, and the actor.

### After the incident

Move the break-glass record into the incident's post-mortem evidence pack. If the trigger condition recurs, treat the operational gap as a `SEV-2` follow-up: tighten Supabase project access, narrow the service-role token's deployment surface, or move the read into an audited RPC.

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

## Moderator decrypt-for-review

This runbook entry covers the audited moderator-decrypt path added in migration `20260428120000_moderator_decrypt_audit_rpc.sql`. It is the **only** sanctioned way to read message plaintext outside the participants of a squad, and it is **not** server-blind — see [`docs/security/encryption-scope.md`](../security/encryption-scope.md).

### When it is acceptable

- a participant or facilitator has filed a **safety report** that requires reviewing the specific message
- a `SEV-0` / `SEV-1` investigation requires correlating message content with audit evidence
- a partner has invoked a contractual review clause for a named cohort

It is **not** acceptable to:

- skim plaintext to satisfy curiosity or "spot-check" content
- decrypt messages in bulk (one-at-a-time, justified, per-incident)
- decrypt outside the active incident or review ticket — close the modal as soon as the immediate question is answered

### How to invoke

Moderators (rows in `public.moderators`) use the **Mod dashboard** at `/admin/csi`:

1. Open the squad → expand **Messages**
2. Click **Decrypt for review** on the specific message
3. Enter a **justification** of at least 8 characters that names the incident or ticket (for example, `SR-INC-2026-04-28 #14: safety report follow-up`)
4. Click **Decrypt (audited)** — plaintext is returned only after `moderator_decrypt_message_for_review` writes the audit row

The same flow runs through `src/lib/moderation/modDecrypt.ts`; direct database access (psql, Studio) **must not** be used to read `messages.payload_ciphertext` for review purposes — it bypasses the audit RPC.

### What is logged

Every decrypt-for-review writes a row to `public.moderation_audit_log` **before** plaintext is returned:

- `action = 'message_plaintext_decrypt_review'`
- `actor_user_id = auth.uid()` of the moderator
- `target_type = 'message'`, `target_id = <message_id>`
- `metadata` includes `squad_id` and the verbatim `justification`
- `created_at` server timestamp

The Mod dashboard surfaces recent rows in **Moderation audit log**. The same table is queryable for incident timelines.

### Retention and review

- **Audit rows are retained at least as long as the underlying squad's data** — they outlive the squad's archival event so that historical reviews of moderator behaviour remain auditable.
- The **incident lead** (or moderation lead) reviews `moderation_audit_log` for `message_plaintext_decrypt_review` rows during every post-incident review (see below) and during scheduled compliance reviews.
- If a decrypt-for-review row lacks a clear justification or appears to fall outside the policy above, treat it as a `SEV-1` "unauthorized moderator actions" incident and run the standard containment / communication steps.

### What this audit does **not** prove

- It does **not** make message content operator-blind: a privileged DB user with service-role access can still read ciphertext + key (see [`docs/security/threat-model.md`](../security/threat-model.md) §5).
- It does **not** prevent a compromised moderator account from decrypting; it produces a tamper-resistant trail so misuse can be detected during review.
- Any future per-user E2E key hierarchy work supersedes this control — see [`docs/technical/rfc-e2e-messaging-key-hierarchy.md`](../technical/rfc-e2e-messaging-key-hierarchy.md).

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
