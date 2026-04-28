# Pilot Quickstart

One-page emergency reference for an in-flight pilot. Pin this in the coordination channel before the session window opens. The full runbooks live in [`pilot-runbook.md`](./pilot-runbook.md) and [`incidents.md`](./incidents.md); this is the abbreviated version for "something is wrong, what do I do right now."

## Owners and contacts

See [`pilot-owners.md`](./pilot-owners.md). If that file's active block is empty, the pilot has not been onboarded — pause the cohort and escalate to the technical owner before opening the session.

## If something is wrong (in order)

1. **Pause the cohort.** Stop sending invites, freeze non-essential deploys, and tell the facilitator to hold the room. This is a calm, ordinary step — see [`pilot-runbook.md` § Abort Criteria](./pilot-runbook.md#abort-criteria) for what to watch for.
2. **Escalate.** Alert the **incident lead** named in [`pilot-owners.md`](./pilot-owners.md). For `SEV-0` / `SEV-1`, also alert the **partner owner** within the first 30 minutes — see [`incidents.md` § First 30 Minutes](./incidents.md#first-30-minutes).
3. **Preserve evidence.** Capture timestamps, affected routes/functions, squad IDs, and screenshots **before** taking containment actions. See [`incidents.md` § Evidence Checklist](./incidents.md#evidence-checklist). Do **not** paste message bodies, Semaphore proofs, or unredacted user IDs into chat.
4. **Contain.** Use the options listed in [`incidents.md` § Containment Options](./incidents.md#containment-options): disable the affected route, pause queue/matchmaking, restrict moderator access, or rotate secrets. If a privileged DB read is required to investigate, follow [`incidents.md` § Service-role break-glass](./incidents.md#service-role-break-glass).
5. **Open a written timeline.** Issue tracker or secure internal channel. Distinguish known facts, hypotheses, and open questions — see [`incidents.md` § Communication Rules](./incidents.md#communication-rules).

## Severity at a glance

| Level | One-line trigger |
| --- | --- |
| `SEV-0` | active or suspected mass privacy compromise, privileged data export, or immediate real-world danger |
| `SEV-1` | broken access control, unauthorised moderator action, major session abuse |
| `SEV-2` | session disruption, repeated verification failures, localised moderation issue |
| `SEV-3` | low-severity bug or partner-facing defect with a known workaround |

Full definitions in [`incidents.md` § Severity Levels](./incidents.md#severity-levels).

## Verification (ZK) failures

If participants cannot complete `verify-zk-proof` during the pilot window, follow [`pilot-runbook.md` § Verification failures (facilitators)](./pilot-runbook.md#verification-failures-facilitators). The most common cause is `VITE_ZK_STUB` accidentally enabled — production builds refuse this, but staging builds may not.

## What to keep out of chat

- raw `auth.users.id` UUIDs (use squad IDs or callsigns)
- message bodies or transcripts
- Semaphore proof payloads or attribute-scope strings
- Supabase service-role tokens (rotate, do not paste)

## After it's resolved

Capture the post-incident review within 72 hours — see [`incidents.md` § Post-Incident Review](./incidents.md#post-incident-review). Update [`pilot-runbook.md`](./pilot-runbook.md), [`pilot-owners.md`](./pilot-owners.md), and the threat model where the response found gaps.
