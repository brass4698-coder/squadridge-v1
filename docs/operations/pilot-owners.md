# Pilot Owners

Named contacts assigned for an active or upcoming pilot. The roles are defined in [`pilot-runbook.md`](./pilot-runbook.md) and [`incidents.md`](./incidents.md); this file records the actual humans behind them.

> **Do not commit this file with empty placeholders to a production deploy.** A pilot must not start until every required role has a real name, an email, a phone or chat handle reachable during the pilot window, and a backup contact.

## How to use this file

1. Before each pilot, copy the template below into a fresh subsection (dated) and fill it in with the cohort's actual owners.
2. Keep prior pilot blocks for audit history; do not delete them.
3. When a pilot ends, mark its block "closed" and move on. Do not retain on-call rotations for closed pilots.
4. If a contact changes mid-pilot, update the active block immediately and announce in the pilot's coordination channel.

## Required roles

These are the same roles defined in [`pilot-runbook.md` § Pilot Owners](./pilot-runbook.md#pilot-owners) and [`incidents.md` § Roles](./incidents.md#roles). Every pilot must fill all of them; one person may legitimately hold multiple roles, but the assignment must be explicit.

- **product owner** — owns scope and go/no-go decisions.
- **technical owner** — owns environment, deploys, and the technical-lead role during incidents.
- **moderation owner** — owns participant safety review and moderator actions.
- **facilitator owner** — runs the live session(s) with the partner cohort.
- **partner owner** — primary contact at the partner organisation.
- **incident lead** — designated for the pilot window; may be the technical or moderation owner.

## Template (copy for each pilot)

```
### Pilot <YYYY-MM-DD> — <partner / cohort name>

Status: planned | active | closed
On-call window: <UTC start>  ->  <UTC end>

- product owner
  - name:
  - email:
  - phone or chat handle:
  - backup contact:
- technical owner
  - name:
  - email:
  - phone or chat handle:
  - backup contact:
- moderation owner
  - name:
  - email:
  - phone or chat handle:
  - backup contact:
- facilitator owner
  - name:
  - email:
  - phone or chat handle:
  - backup contact:
- partner owner
  - name:
  - email:
  - phone or chat handle:
  - backup contact:
- incident lead (during this pilot window)
  - name:
  - email:
  - phone or chat handle:

Coordination channel: <link or DM thread>
Partner organisation: <name>
Cohort and use case: <short description>
```

## Contact rules

- Do **not** post participant identities, message bodies, ZK proof material, or unredacted Supabase user IDs in a coordination channel. Reference participants by squad ID or callsign only — see [`incidents.md` § Communication Rules](./incidents.md#communication-rules).
- Phone numbers and personal contact handles in this file are operator data, not participant data. Treat the file as internal — do not link it from public materials.
- If a listed contact becomes unreachable for more than the agreed on-call window, the incident lead promotes the backup contact and updates this file.

## See also

- [`pilot-runbook.md`](./pilot-runbook.md) — the full pre-pilot, in-pilot, and closeout flow.
- [`pilot-quickstart.md`](./pilot-quickstart.md) — one-page emergency reference.
- [`incidents.md`](./incidents.md) — severity levels, roles, first-30-minutes, and the audited moderator-decrypt and service-role break-glass procedures.
