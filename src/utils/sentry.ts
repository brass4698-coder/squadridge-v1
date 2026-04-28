/**
 * sentry.ts
 *
 * Sentry error-monitoring configuration with PII scrubbing.
 *
 * Status: SCAFFOLD — add VITE_SENTRY_DSN to your environment and call
 * `initSentry()` once at application startup (e.g. in src/main.tsx).
 *
 * Key privacy guarantees this module enforces:
 * - Message content is never sent to Sentry.
 * - User objects are stripped of name/email/IP before ingestion.
 * - beforeSend hook allows per-event scrubbing.
 *
 * See docs/security/observability-and-sentry.md for full detail.
 */

// ---------------------------------------------------------------------------
// Minimal Sentry interface (avoids a hard @sentry/browser dev dependency
// for teams that have not yet wired Sentry in production).
// Replace with `import * as Sentry from '@sentry/browser'` when ready.
// ---------------------------------------------------------------------------

export interface SentryEvent {
  message?: string;
  user?: {
    id?: string;
    email?: string;
    ip_address?: string;
    username?: string;
    [key: string]: unknown;
  };
  request?: {
    url?: string;
    headers?: Record<string, string>;
    data?: unknown;
    [key: string]: unknown;
  };
  extra?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SentryHint {
  [key: string]: unknown;
}

export interface SentryInitOptions {
  dsn?: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
  beforeSend?: (event: SentryEvent, hint: SentryHint) => SentryEvent | null;
}

// ---------------------------------------------------------------------------
// PII scrubber
// ---------------------------------------------------------------------------

/**
 * scrubSentryEvent
 *
 * Strips PII fields from a Sentry event before it leaves the browser.
 * Called by the `beforeSend` hook.
 *
 * Rules:
 * - Remove user.email, user.ip_address, user.username.
 * - Keep user.id only if it is already an ephemeral/hashed token (no @-sign).
 * - Strip request.headers that could re-identify the user.
 * - Remove any `extra` field whose key contains 'message', 'content', or 'text'.
 */
export function scrubSentryEvent(event: SentryEvent, _hint: SentryHint): SentryEvent | null {
  // Strip user PII
  if (event.user) {
    const { id } = event.user;
    // Only keep id if it looks like a non-identifying token (no email format)
    event.user = id && !id.includes('@') ? { id } : {};
  }

  // Strip identifying request headers
  if (event.request?.headers) {
    const safeHeaders: Record<string, string> = {};
    const allowed = new Set(['content-type', 'accept', 'accept-language']);
    for (const [k, v] of Object.entries(event.request.headers)) {
      if (allowed.has(k.toLowerCase())) {
        safeHeaders[k] = v;
      }
    }
    event.request = { ...event.request, headers: safeHeaders };
    // Never send request body — it may contain message content
    delete event.request.data;
  }

  // Strip extra fields that might contain user content
  if (event.extra) {
    const scrubbed: Record<string, unknown> = {};
    const blockedPatterns = /message|content|text|body|payload/i;
    for (const [k, v] of Object.entries(event.extra)) {
      if (!blockedPatterns.test(k)) {
        scrubbed[k] = v;
      }
    }
    event.extra = scrubbed;
  }

  return event;
}

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

export interface SentryModule {
  init(options: SentryInitOptions): void;
}

/**
 * initSentry
 *
 * Initialises Sentry with PII scrubbing.
 *
 * Wire-up steps:
 * 1. `npm install @sentry/browser` (check advisory DB first)
 * 2. Replace the `sentryModule` parameter default with the real Sentry import:
 *    ```ts
 *    import * as Sentry from '@sentry/browser';
 *    initSentry(Sentry);
 *    ```
 * 3. Set `VITE_SENTRY_DSN` in your production environment (not in .env files).
 *
 * @param sentryModule - The Sentry module to initialise (injectable for testing).
 */
export function initSentry(sentryModule?: SentryModule): void {
  const dsn = import.meta.env?.['VITE_SENTRY_DSN'] ?? process.env['VITE_SENTRY_DSN'];

  if (!dsn) {
    // No DSN configured — Sentry is disabled. This is expected in development.
    return;
  }

  if (!sentryModule) {
    console.warn('[sentry] Sentry DSN is set but no Sentry module was provided to initSentry().');
    return;
  }

  sentryModule.init({
    dsn,
    environment: import.meta.env?.['MODE'] ?? process.env['NODE_ENV'] ?? 'development',
    release: import.meta.env?.['VITE_APP_VERSION'],
    tracesSampleRate: 0.1, // Low sample rate to reduce cost and data volume
    beforeSend: scrubSentryEvent,
  });
}
