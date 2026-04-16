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

export function captureBoundaryError(error: Error, errorInfo: ErrorInfo): void {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
  });
}

export { Sentry };
