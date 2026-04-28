import * as Sentry from '@sentry/react';
import type { ErrorInfo } from 'react';

let sentryInitialized = false;

/** True only after a successful `Sentry.init` in {@link initSentry}. */
export function isSentryEnabled(): boolean {
  return sentryInitialized;
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
      beforeSend(event) {
        if (
          import.meta.env.DEV &&
          event.exception?.values?.[0]?.value?.includes('ResizeObserver')
        ) {
          return null;
        }
        return event;
      },
    });
    sentryInitialized = true;
  } catch (err) {
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
    userId?: string | null;
    /** Distinguishes root vs route vs session boundaries in Sentry. */
    boundary?: 'root' | 'route' | 'session';
  },
): void {
  if (!sentryInitialized) return;
  const tags: Record<string, string> = {};
  if (scope?.squadId) tags.squad_id = scope.squadId;
  if (scope?.boundary) tags.error_boundary = scope.boundary;

  const includeSessionContext =
    !!scope &&
    (typeof scope.squadId === 'string' || Object.prototype.hasOwnProperty.call(scope, 'userId'));

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
              user_id: scope?.userId ?? undefined,
            },
          }
        : {}),
    },
  });
}

/** Anonymous user id only; no PII. */
export function setSentryUserContext(userId: string | null): void {
  if (!sentryInitialized) return;
  Sentry.setUser(userId ? { id: userId } : null);
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

export { Sentry };
