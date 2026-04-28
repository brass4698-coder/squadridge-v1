/**
 * src/utils/sentry.ts
 *
 * Public re-export surface for Sentry utilities used across the app.
 *
 * The canonical implementation lives in `src/lib/sentry.ts` and includes:
 *  - `initSentry()` — initialise Sentry before render, reads VITE_SENTRY_DSN.
 *  - `beforeSendSentryEvent()` — before-send hook that:
 *      1. Drops ResizeObserver dev noise.
 *      2. Strips raw `auth.users.id` UUIDs from session_boundary context.
 *      3. Redacts strings longer than 512 chars in extra/contexts (defence-in-depth
 *         against accidental message-body capture via Sentry).
 *  - `setSentryUserContext()` — sets a salted SHA-256 hash of the user ID, never
 *      the raw Supabase UUID.
 *  - Breadcrumb helpers (navigation, auth, connection, ZK proof, session lifecycle).
 *
 * Re-exported here so callers can import from either location.
 *
 * Configuration (set via secret manager / hosting env, never hard-coded):
 *  - VITE_SENTRY_DSN           — Sentry project DSN (required for reporting).
 *  - VITE_SENTRY_ENVIRONMENT   — "production" | "staging" | ... (defaults to Vite mode).
 *  - VITE_SENTRY_USER_HASH_SALT — Salt for user-ID hashing (required in prod when DSN set).
 *
 * Local dev: omit VITE_SENTRY_DSN to disable reporting entirely (no data sent).
 *
 * See also:
 *  - docs/security/observability-and-sentry.md — operational guidance.
 *  - src/lib/sentryUserHash.ts — salted-hash implementation.
 */

export {
  initSentry,
  isSentryEnabled,
  beforeSendSentryEvent,
  captureRouteNavigation,
  captureBoundaryError,
  captureAppError,
  setSentryUserContext,
  setSentrySquadContext,
  addConnectionBreadcrumb,
  addSessionLifecycleBreadcrumb,
  addAuthTransitionBreadcrumb,
  addZkProofBreadcrumb,
  captureZkStubMisdeploySentinel,
  Sentry,
} from '../lib/sentry';

export type { ZkProofBreadcrumbErrorCode } from '../lib/sentry';
