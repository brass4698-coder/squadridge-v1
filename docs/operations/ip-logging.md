# IP logging (operators)

This note maps the surfaces where a participant IP address can appear, and what to configure on each so what we tell partners stays accurate. The application code itself does not record IPs; treat the surfaces below as the source of truth for any privacy claim that mentions IP handling.

## What the application does and does not see

| Surface | Sees raw IPs? | What we do with them |
| --- | --- | --- |
| SquadRidge React app (`src/`) | No | The browser cannot read its own public IP. We never collect or send one. |
| Supabase Edge Functions (`supabase/functions/`) | Headers only | None. The `rate-limit` Edge Function ([`supabase/functions/rate-limit/index.ts`](../../supabase/functions/rate-limit/index.ts)) keys on the authenticated `user.id`, not IP. No Edge Function reads `X-Forwarded-For`, `cf-connecting-ip`, or similar today, so application logs never contain IP material. |
| Supabase Postgres tables | No | No table column stores an IP value. Schema review checked: `users`, `profiles`, `messages`, `match_queue`, `moderation_audit_log`, `zk_proof_submissions`, `crisis_alerts`. |
| Sentry events (`src/lib/sentry.ts`) | No | `sendDefaultPii: false` — Sentry's automatic IP attachment is disabled. The user id sent to Sentry is a salted SHA-256 hash (see [`docs/security/observability-and-sentry.md`](../security/observability-and-sentry.md)). |

The application therefore has no IP to anonymise at the application layer. Earlier drafts of [`PRIVACY_POLICY.md`](../../PRIVACY_POLICY.md) implied a salted-IP rate limiter; that text has been corrected to describe the user-id-keyed limiter that actually ships.

## Where IPs do exist (and what to configure)

These are platform surfaces. We do not control the storage formats, but we do control retention windows, access posture, and what we promise partners. Confirm each item before any pilot that quotes IP handling to a partner.

### Supabase

- **Auth events.** Supabase Auth records sign-in events with the originating IP. Treat the auth log as IP-bearing; restrict dashboard access to named operators.
- **Postgres logs.** Connection-level logs at the Supabase platform may include IP for failed auth and for outbound connections. Application queries are made via the JS client, which proxies through Supabase's edge — operator IPs (e.g. running `psql` against the project) appear here.
- **Edge Function invocation logs.** Supabase exposes per-invocation logs in the dashboard. Header values can be visible to project members; do not paste request headers into third-party tools when triaging.
- **Action.** Document the project's log retention setting (Dashboard → Settings → Logs) in the pilot runbook. If a partner requires a shorter window than the platform default, use a log drain that respects the partner's retention rule, not the dashboard view.

### Hosting provider (Vercel, Netlify, Cloudflare Pages)

- The static SPA is served by the host. Edge access logs include client IP, request path, and basic timing.
- **Action.** Set the host's log retention to the shortest period the team needs for incident triage. Restrict admin access to the team list documented in [`pilot-owners.md`](./pilot-owners.md). If the host offers IP-anonymisation features (Cloudflare's "Privacy Pass" / "anonymized analytics", Vercel's "edge logs" privacy controls), enable them.

### CDN

- If a CDN sits in front of the host, expect the same access-log surface there. Cache misses and edge functions both leave IP-bearing log entries.
- **Action.** Document the CDN in use, who can read its logs, and the retention setting; align the retention window with the host's.

### Email provider (magic links / OTP)

- Supabase's mailer or a configured SMTP provider may log IPs of click-through events on auth emails.
- **Action.** If email click tracking is on, turn it off for production unless a partner has accepted that surface in writing.

## What we promise

In partner-facing copy and in [`PRIVACY_POLICY.md`](../../PRIVACY_POLICY.md), describe IP handling as:

> SquadRidge does not store IP addresses in the application database. Platform edge logs (Supabase, hosting provider, CDN) may capture IPs for operational reasons; those logs follow the platforms' retention settings and are accessible only to a small named operator group.

Do not claim "we hash IPs" or "we anonymise IPs at ingest"; the application has no IP to hash. If a partner needs an explicit IP-hashing path, treat that as a discrete engineering project that introduces a hashing proxy in front of Supabase rather than a doc-only change.

## When you would need to revisit this

Add an application-level IP-handling layer (and update this document) only if one of the following becomes true:

- A new Edge Function reads `X-Forwarded-For` for abuse detection. Hash it on read; do not persist raw values.
- A platform addition (e.g. self-hosted analytics, custom audit pipeline) starts capturing IPs into our own storage.
- A partner contract requires a documented hashing pipeline owned by SquadRidge rather than the platform vendors.

## Cross-references

- Threat model: [`docs/security/threat-model.md`](../security/threat-model.md) §3 (adversary tier 5 — vendor / subprocessor visibility).
- Sentry posture: [`docs/security/observability-and-sentry.md`](../security/observability-and-sentry.md).
- Retention surfaces: [`DATA_RETENTION.md`](../../DATA_RETENTION.md).
