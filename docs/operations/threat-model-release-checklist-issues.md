# Threat model §6 — tracking as GitHub issues

The [operational threat model](../security/threat-model.md) §6 lists release gates as checkboxes. **Do not tick boxes in the document until the work is done.** Instead, create GitHub issues (one per item or grouped by theme) and link PRs when complete.

Use the titles below as templates when filing issues.

## ZK / verification

- [ ] Production build never ships with `VITE_ZK_STUB=true` (verify CI + Vite guard continuously)
- [ ] External or internal security review of Semaphore parameters, group setup, and scope/message binding in the `verify-zk-proof` Edge handler

## Data minimization

- [ ] Column-level review of `profiles` and `match_queue` for re-identification; retention and TTL for queue rows after match/cancel
- [ ] Waitlist / marketing DB exports governed — restrict who can run `scripts/waitlist-export.sql`

## Messaging

- [ ] Either real E2E shipped and documented, or public positioning states operator-readable content until then

## Supabase and operations

- [ ] RLS policies reviewed on all exposed tables; views use `security_invoker` where applicable (Postgres 15+)
- [ ] No authorization decisions based on user-editable `user_metadata` in JWT
- [ ] Service role and dashboard access: MFA, minimal headcount, break-glass procedure
- [ ] Logging: Edge Functions avoid logging full proof bodies; structured outcome-only logs in production
- [ ] Team/Enterprise: Platform Audit Logs / optional Audit Log Drain ownership and access list (see production-checklist Ops)

## Incident readiness

- [ ] Severity-0 definition for suspected mass correlation or export; runbook includes key rotation and comms

After creating issues, add a short “Tracking” subsection to threat-model §6 with links to the GitHub epic or issue numbers.
