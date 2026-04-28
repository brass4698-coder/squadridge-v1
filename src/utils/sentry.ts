/**
 * sentry.ts — Server-side Sentry integration scaffold
 *
 * STATUS: SCAFFOLD — see "NEXT STEPS" below before using in production.
 *
 * PURPOSE
 * -------
 * This is a scaffold for a Node.js server-side Sentry integration that mirrors
 * the PII-scrubbing philosophy of the browser-side implementation in
 * src/lib/sentry.ts. The two are separate because:
 *
 *   - Browser: uses @sentry/react (imported in src/lib/sentry.ts)
 *   - Server: should use @sentry/node (this file)
 *
 * Both must apply the same beforeSend scrubbing rules so that PII never reaches
 * Sentry regardless of which side captures the error.
 *
 * WHAT THIS SCAFFOLD PROVIDES
 * ---------------------------
 * - The beforeSend scrubbing logic (portable, no Sentry dependency)
 * - The init function signature and comments
 * - Placeholder imports (commented out until @sentry/node is installed)
 *
 * NEXT STEPS
 * ----------
 * 1. Install the server SDK:
 *      npm install @sentry/node
 * 2. Set SENTRY_DSN in your server environment (NOT VITE_SENTRY_DSN — that's
 *    a client-side env var that gets bundled into the frontend; this one lives
 *    only on the server).
 * 3. Uncomment the @sentry/node import and the Sentry.init() call below.
 * 4. Call initServerSentry() at the top of your server entry point (before any
 *    routes or other middleware).
 * 5. Add Sentry.Handlers.requestHandler() and Sentry.Handlers.errorHandler()
 *    Express middleware as documented in @sentry/node README.
 * 6. Replace this file's type stubs with the real @sentry/node types.
 *
 * ENV VARS
 * --------
 * SENTRY_DSN          — required; server-side DSN (different from VITE_SENTRY_DSN)
 * SENTRY_ENVIRONMENT  — optional; defaults to NODE_ENV
 * SENTRY_SAMPLE_RATE  — optional; fraction 0–1 (default: 0.1 in production)
 */

// ─── Placeholder types (replace with @sentry/node types once installed) ───────
// These are minimal stubs so this file compiles without @sentry/node installed.

interface SentryErrorEventStub {
  contexts?: Record<string, Record<string, unknown> | undefined>;
  extra?: Record<string, unknown>;
  exception?: {
    values?: Array<{ value?: string }>;
  };
  request?: {
    headers?: Record<string, string>;
    data?: unknown;
  };
}

// ─── PII scrubbing (shared logic, no SDK dependency) ─────────────────────────

const MAX_FIELD_LENGTH = 512;

function scrubLongStringsInPlace(node: unknown, depth = 0): void {
  if (depth > 6 || node === null || typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (typeof v === 'string') {
      if (v.length > MAX_FIELD_LENGTH) {
        (node as Record<string, unknown>)[k] = `[redacted: >${MAX_FIELD_LENGTH}b]`;
      }
    } else if (v && typeof v === 'object') {
      scrubLongStringsInPlace(v, depth + 1);
    }
  }
}

/**
 * Strip PII from a Sentry error event before it is transmitted.
 *
 * Responsibilities:
 *   1. Remove request headers that could identify the user (Authorization, Cookie,
 *      x-forwarded-for, user-agent).
 *   2. Remove the request body entirely (may contain message plaintext).
 *   3. Truncate overlong strings in contexts and extra (defense against accidental
 *      message-body capture via stack frames or debug context).
 *
 * This function is exported for unit testing — production wiring goes through
 * Sentry.init() beforeSend.
 */
export function beforeSendServerEvent(event: SentryErrorEventStub): SentryErrorEventStub | null {
  // Strip request body (may contain message plaintext or credentials).
  if (event.request) {
    event.request.data = undefined;

    // Strip identifying request headers.
    if (event.request.headers) {
      const sensitiveHeaders = [
        'authorization',
        'cookie',
        'set-cookie',
        'x-forwarded-for',
        'x-real-ip',
        'user-agent',
        'cf-connecting-ip',
        'true-client-ip',
      ];
      for (const h of sensitiveHeaders) {
        delete event.request.headers[h];
      }
    }
  }

  // Truncate overlong strings.
  if (event.contexts) scrubLongStringsInPlace(event.contexts);
  if (event.extra) scrubLongStringsInPlace(event.extra);

  return event;
}

// ─── Init function (stub — uncomment after installing @sentry/node) ───────────

/**
 * Initialize server-side Sentry. Call once at server startup, before any routes.
 *
 * SCAFFOLD: The implementation below is commented out because @sentry/node is
 * not yet installed. Uncomment after running: npm install @sentry/node
 */
export function initServerSentry(): void {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    // console.warn is in the ESLint allow-list; no eslint-disable needed.
    console.warn('[sentry/server] SENTRY_DSN is not set; server-side error reporting is disabled.');
    return;
  }

  // ── Uncomment after: npm install @sentry/node ─────────────────────────────
  // import * as Sentry from '@sentry/node';
  //
  // Sentry.init({
  //   dsn,
  //   environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development',
  //   tracesSampleRate: process.env.NODE_ENV === 'production'
  //     ? Number(process.env.SENTRY_SAMPLE_RATE ?? '0.1')
  //     : 1.0,
  //   sendDefaultPii: false,
  //   beforeSend: beforeSendServerEvent,
  // });
  // ─────────────────────────────────────────────────────────────────────────

  // Temporary: log that DSN was found but SDK not installed.
  // Remove this once the SDK is installed.
  console.warn(
    '[sentry/server] SCAFFOLD: @sentry/node is not installed. ' +
      'Run `npm install @sentry/node` and uncomment the Sentry.init() call.',
  );
}
