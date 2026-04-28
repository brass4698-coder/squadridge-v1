import * as Sentry from '@sentry/react';
import type { ErrorEvent as SentryErrorEvent } from '@sentry/react';
import type { ErrorInfo } from 'react';
import { hashUserIdForSentry, isSentryUserHash } from './sentryUserHash';

let sentryInitialized = false;

/**
 * Cached salted-hash form of the current Supabase user id (see {@link ./sentryUserHash.ts}).
 * Updated asynchronously by {@link setSentryUserContext}; used by sync error boundaries
 * which cannot await a hash before reporting.
 */
let cachedHashedUserId: string | null = null;

/**
 * Monotonically increasing call counter for {@link setSentryUserContext}. Used to
 * discard stale `await hashUserIdForSentry` results when a newer call (e.g. the
 * synchronous `null` on logout) has superseded an in-flight hash. Without this
 * guard, a slow hash could resolve after logout and re-attribute subsequent
 * errors to the previous user's hashed id.
 */
let sentryUserContextGeneration = 0;

/** Maximum string length permitted in `extra`/`contexts` payloads (defense-in-depth
 * against accidental message-body capture). Anything longer is stripped by `beforeSend`. */
const MAX_SENTRY_FIELD_LENGTH = 512;

/** True only after a successful `Sentry.init` in {@link initSentry}. */
export function isSentryEnabled(): boolean {
  return sentryInitialized;
}

/**
 * Walk a `contexts`-like object and replace any string value longer than
 * {@link MAX_SENTRY_FIELD_LENGTH} with a truncated marker. Mutates in place
 * (events are owned by the caller passing through `beforeSend`).
 */
function scrubLongStringsInPlace(node: unknown, depth = 0): void {
  if (depth > 6 || node === null || typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (typeof v === 'string') {
      if (v.length > MAX_SENTRY_FIELD_LENGTH) {
        (node as Record<string, unknown>)[k] = `[redacted: >${MAX_SENTRY_FIELD_LENGTH}b]`;
      }
    } else if (v && typeof v === 'object') {
      scrubLongStringsInPlace(v, depth + 1);
    }
  }
}

/**
 * Pre-send sanitiser. Three responsibilities:
 *   1. Drop ResizeObserver dev noise (existing behaviour).
 *   2. Strip any `session_boundary.user_id` that does not look like a salted hash —
 *      catches accidental future leaks of raw `auth.users.id` UUIDs.
 *   3. Strip overlong strings in `extra` and `contexts` so an accidental message
 *      body or stack-trace dump cannot exfiltrate plaintext through Sentry.
 *      `contexts.react.componentStack` is exempted — it is set by our own error
 *      boundaries, contains only component names (no PII), and is the most
 *      valuable diagnostic for render errors.
 *
 * Exported for unit testing — production wiring goes through `Sentry.init`.
 */
export function beforeSendSentryEvent(event: SentryErrorEvent): SentryErrorEvent | null {
  if (import.meta.env.DEV && event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
    return null;
  }

  const sb = event.contexts?.session_boundary as
    | { user_id?: unknown; squad_id?: unknown }
    | undefined;
  if (sb && Object.prototype.hasOwnProperty.call(sb, 'user_id')) {
    if (!isSentryUserHash(sb.user_id)) {
      delete sb.user_id;
    }
  }

  if (event.contexts) {
    /**
     * `contexts.react.componentStack` is set by our error boundaries and is the
     * single most useful diagnostic field for render errors. It contains only
     * component names (no PII / message bodies) but routinely exceeds
     * {@link MAX_SENTRY_FIELD_LENGTH} given this app's nesting depth, so we
     * exempt it from length scrubbing.
     */
    const reactCtx = event.contexts.react as { componentStack?: unknown } | undefined;
    const preservedComponentStack =
      reactCtx && typeof reactCtx.componentStack === 'string' ? reactCtx.componentStack : undefined;
    scrubLongStringsInPlace(event.contexts);
    if (preservedComponentStack !== undefined && reactCtx) {
      reactCtx.componentStack = preservedComponentStack;
    }
  }
  if (event.extra) scrubLongStringsInPlace(event.extra);

  return event;
}

/**
 * Initialize Sentry before render. Missing DSN, invalid config, or SDK failures are logged;
 * the app always continues (no throw from this function).
 */
export function initSentry(): void {
  sentryInitialized = false;
  const dsnRaw = import.meta.env.VITE_SENTRY_DSN;
  if (typeof dsnRaw !== 'string' || dsnRaw.trim().length === 0) {
    if (import.meta.env.PROD) {
      // Bootstrap diagnostic for operators looking at devtools — no PII.
      // eslint-disable-next-line no-restricted-syntax
      console.warn(
        '[Sentry] VITE_SENTRY_DSN is not set; error reporting is disabled in this production build.',
      );
    }
    return;
  }

  const dsn = dsnRaw.trim();
  const environment =
    typeof import.meta.env.VITE_SENTRY_ENVIRONMENT === 'string' &&
    import.meta.env.VITE_SENTRY_ENVIRONMENT.trim().length > 0
      ? import.meta.env.VITE_SENTRY_ENVIRONMENT.trim()
      : import.meta.env.MODE;

  try {
    Sentry.init({
      dsn,
      environment,
      integrations: [Sentry.browserTracingIntegration()],
      tracesSampleRate: import.meta.env.PROD ? 0.15 : 1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      sendDefaultPii: false,
      beforeSend: beforeSendSentryEvent,
    });
    sentryInitialized = true;
  } catch (err) {
    // Init-time diagnostic; the SDK constructor error rarely contains PII (no
    // session, no user yet). If a future SDK version starts echoing config we
    // pass in (e.g. DSN), revisit this and route through `logWarn` instead.
    // eslint-disable-next-line no-restricted-syntax
    console.warn('[Sentry] Initialization failed; continuing without error reporting.', err);
    sentryInitialized = false;
  }
}

export function captureRouteNavigation(pathname: string, search: string): void {
  if (!sentryInitialized) return;
  Sentry.addBreadcrumb({
    category: 'navigation',
    type: 'navigation',
    level: 'info',
    data: { to: pathname + search },
  });
}

export function captureBoundaryError(
  error: Error,
  errorInfo: ErrorInfo,
  scope?: {
    squadId?: string;
    /** Distinguishes root vs route vs session boundaries in Sentry. */
    boundary?: 'root' | 'route' | 'session';
  },
): void {
  if (!sentryInitialized) return;
  const tags: Record<string, string> = {};
  if (scope?.squadId) tags.squad_id = scope.squadId;
  if (scope?.boundary) tags.error_boundary = scope.boundary;

  const hashedUserId = cachedHashedUserId;
  const includeSessionContext = !!scope && (typeof scope.squadId === 'string' || hashedUserId);

  Sentry.captureException(error, {
    ...(Object.keys(tags).length > 0 ? { tags } : {}),
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
      ...(includeSessionContext
        ? {
            session_boundary: {
              squad_id: scope?.squadId,
              user_id: hashedUserId ?? undefined,
            },
          }
        : {}),
    },
  });
}

/**
 * Set the Sentry user context to the salted hash of `userId`. Asynchronous because
 * the hash uses `crypto.subtle.digest`. Safe to fire-and-forget from `useEffect`;
 * the cached hash also feeds {@link captureBoundaryError} so sync error boundaries
 * still attach a non-PII identifier.
 *
 * Never sends raw `auth.users.id` — see {@link ./sentryUserHash.ts}.
 */
export async function setSentryUserContext(userId: string | null): Promise<void> {
  const generation = ++sentryUserContextGeneration;
  if (userId === null) {
    cachedHashedUserId = null;
    if (sentryInitialized) Sentry.setUser(null);
    return;
  }
  let hashed: string;
  try {
    hashed = await hashUserIdForSentry(userId);
  } catch (err) {
    // Hashing-failure diagnostic — never carries a Supabase user id (we caught
    // before the hash succeeded). Hand-rolled console call is fine here per
    // src/lib/log.ts policy; the ban applies to free-form interpolation.
    if (generation !== sentryUserContextGeneration) return;
    // eslint-disable-next-line no-restricted-syntax
    console.warn('[Sentry] Could not hash user id; skipping setUser to avoid PII leak.', err);
    cachedHashedUserId = null;
    if (sentryInitialized) Sentry.setUser(null);
    return;
  }
  if (generation !== sentryUserContextGeneration) return;
  cachedHashedUserId = hashed;
  if (sentryInitialized) Sentry.setUser({ id: hashed });
}

export function setSentrySquadContext(squadId: string | null): void {
  if (!sentryInitialized) return;
  Sentry.setTag('squad_id', squadId ?? 'none');
  if (squadId) {
    Sentry.setContext('squad', { id: squadId });
  }
}

export function captureAppError(
  error: unknown,
  context: { feature: string; extra?: Record<string, unknown> },
): void {
  if (!sentryInitialized) return;
  const err =
    error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Unknown error');
  Sentry.captureException(err, {
    tags: { feature: context.feature },
    extra: context.extra,
  });
}

/** Breadcrumb for realtime / connectivity (no message bodies). */
export function addConnectionBreadcrumb(message: string, data?: Record<string, unknown>): void {
  if (!sentryInitialized) return;
  Sentry.addBreadcrumb({
    category: 'connection',
    level: 'info',
    message,
    data,
  });
}

/** Squad room enter/leave, archive, or other session boundary (no message bodies). */
export function addSessionLifecycleBreadcrumb(
  phase: 'enter' | 'leave' | 'archive' | 'pause' | 'resume',
  data?: { squadId?: string },
): void {
  if (!sentryInitialized) return;
  Sentry.addBreadcrumb({
    category: 'session',
    level: 'info',
    message: `session.${phase}`,
    data,
  });
}

/** Supabase `onAuthStateChange` events and explicit sign-out. */
export function addAuthTransitionBreadcrumb(
  event: string,
  data?: { userId?: string | null },
): void {
  if (!sentryInitialized) return;
  Sentry.addBreadcrumb({
    category: 'auth',
    level: 'info',
    message: event,
    data,
  });
}

/** High-level failure bucket for ZK breadcrumbs — never includes raw verification strings. */
export type ZkProofBreadcrumbErrorCode =
  | 'stub_generate_failed'
  | 'local_generate_failed'
  | 'invoke_failed'
  | 'invoke_timeout'
  | 'response_invalid';

/** ZK proof pipeline — metadata only (credential kind + coarse error bucket). No raw preimage or Edge error text. */
export function addZkProofBreadcrumb(
  step: 'generate_local' | 'invoke_verify_edge' | 'stub_hash',
  status: 'start' | 'success' | 'error',
  data?: {
    credentialType?: string;
    errorCode?: ZkProofBreadcrumbErrorCode;
  },
): void {
  if (!sentryInitialized) return;
  const sanitized: Record<string, unknown> = {};
  if (data?.credentialType !== undefined) sanitized.credentialType = data.credentialType;
  if (data?.errorCode !== undefined) sanitized.errorCode = data.errorCode;
  Sentry.addBreadcrumb({
    category: 'zk',
    level: status === 'error' ? 'warning' : 'info',
    message: `${step}:${status}`,
    data: Object.keys(sanitized).length ? sanitized : undefined,
  });
}

export function captureZkStubMisdeploySentinel(): void {
  if (!sentryInitialized) return;
  /** Avoid circular imports: sync read matches {@link isZkHashStubExplicit}. */
  const stubExplicit = import.meta.env.VITE_ZK_STUB === 'true';
  if (!stubExplicit || typeof window === 'undefined') return;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return;
  try {
    if (sessionStorage.getItem('squadridge.zk_stub.sentinel.reported') === '1') return;
    sessionStorage.setItem('squadridge.zk_stub.sentinel.reported', '1');
  } catch {
    /* ignore */
  }
  Sentry.captureMessage(
    'ZK hash stub (VITE_ZK_STUB) active on non-localhost origin — unsafe for pilots',
    'warning',
  );
}

/** Test-only: reset the cached hashed user id between cases. */
export function __resetSentryUserCacheForTests(): void {
  cachedHashedUserId = null;
  sentryUserContextGeneration = 0;
}

export { Sentry };
