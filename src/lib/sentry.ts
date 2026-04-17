import * as Sentry from '@sentry/react';
import type { ErrorInfo } from 'react';

/**
 * Call once before React render. No-ops when `VITE_SENTRY_DSN` is unset.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (typeof dsn !== 'string' || dsn.trim().length === 0) {
    return;
  }

  const environment =
    typeof import.meta.env.VITE_SENTRY_ENVIRONMENT === 'string' &&
    import.meta.env.VITE_SENTRY_ENVIRONMENT.trim().length > 0
      ? import.meta.env.VITE_SENTRY_ENVIRONMENT.trim()
      : import.meta.env.MODE;

  Sentry.init({
    dsn: dsn.trim(),
    environment,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: import.meta.env.PROD ? 0.15 : 1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
    beforeSend(event) {
      if (import.meta.env.DEV && event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
        return null;
      }
      return event;
    },
  });
}

export function captureRouteNavigation(pathname: string, search: string): void {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
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
  if (!import.meta.env.VITE_SENTRY_DSN) return;
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
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.setUser(userId ? { id: userId } : null);
}

export function setSentrySquadContext(squadId: string | null): void {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.setTag('squad_id', squadId ?? 'none');
  if (squadId) {
    Sentry.setContext('squad', { id: squadId });
  }
}

export function captureAppError(
  error: unknown,
  context: { feature: string; extra?: Record<string, unknown> },
): void {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  const err =
    error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Unknown error');
  Sentry.captureException(err, {
    tags: { feature: context.feature },
    extra: context.extra,
  });
}

/** Breadcrumb for realtime / connectivity (no message bodies). */
export function addConnectionBreadcrumb(message: string, data?: Record<string, unknown>): void {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
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
  if (!import.meta.env.VITE_SENTRY_DSN) return;
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
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.addBreadcrumb({
    category: 'auth',
    level: 'info',
    message: event,
    data,
  });
}

/** ZK proof pipeline — no raw PII or preimage. */
export function addZkProofBreadcrumb(
  step: 'generate_local' | 'invoke_verify_edge' | 'stub_hash',
  status: 'start' | 'success' | 'error',
  data?: Record<string, unknown>,
): void {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.addBreadcrumb({
    category: 'zk',
    level: status === 'error' ? 'warning' : 'info',
    message: `${step}:${status}`,
    data,
  });
}

export { Sentry };
