# Observability and Sentry (privacy posture)

SquadRidge uses [@sentry/react](https://docs.sentry.io/platforms/javascript/guides/react/) for **client-side error reporting** only when `VITE_SENTRY_DSN` is set. This page summarizes **what may leave the browser** and **what does not**, so reviewers can align operational choices with the [threat model](threat-model.md).

Implementation source of truth: `src/lib/sentry.ts`, `src/lib/sentryUserHash.ts`.

---

## Defaults that reduce PII exposure

| Control                  | Setting / behavior                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Default PII              | `sendDefaultPii: false` — Sentry does not automatically attach IP address, cookies, or similar as identifiable user attributes.                        |
| Session replay           | `replaysSessionSampleRate: 0`, `replaysOnErrorSampleRate: 0` — **no** Session Replay; screen contents are not recorded.                                |
| User identifier          | Supabase `auth.users.id` is **never** sent raw. `setSentryUserContext` hashes it with a salted digest (`hashUserIdForSentry`) before `Sentry.setUser`. |
| Session boundary context | `captureBoundaryError` may attach `session_boundary.user_id` only when it matches the **hashed** form; otherwise `beforeSend` strips it.               |
| Long strings             | `beforeSendSentryEvent` truncates / redacts strings over 512 characters in `extra` and `contexts` to reduce accidental message-body leakage.           |
| Navigation breadcrumbs   | Route changes record pathname + search only (no message bodies).                                                                                       |

---

## What still appears in events

- **Stack traces** and **React component stacks** for caught exceptions (required for debugging).
- **Tags** such as `squad_id` when explicitly set for session-scoped errors (`setSentrySquadContext`, boundary capture).
- **Feature tags** passed to `captureAppError`.
- **ZK pipeline breadcrumbs** — coarse steps and error buckets only (`addZkProofBreadcrumb`), not raw proof bytes or credentials.

Treat squad IDs as **pseudonymous correlation identifiers** — useful for triage but still sensitive in high-threat deployments; minimize tagging surface area in new code.

---

## Environment variables

| Variable                  | Purpose                                                                   |
| ------------------------- | ------------------------------------------------------------------------- |
| `VITE_SENTRY_DSN`         | If unset in production, Sentry stays disabled (warning in devtools only). |
| `VITE_SENTRY_ENVIRONMENT` | Optional override for the environment name (defaults to Vite `MODE`).     |

Never commit a real DSN to the repo; configure in host secrets.

---

## Related

- [Threat model — vendor / subprocessors](threat-model.md) (platform logging outside Sentry)
- [Dependency advisories](dependency-advisories.md) (supply chain)
