/**
 * Structured browser logger — counterpart to `supabase/functions/_shared/log.ts`.
 *
 * Server logs are the sensitive surface (operator-readable; persisted by the
 * platform). Browser logs only show in the user's own devtools and to Sentry
 * via SDK breadcrumbs, but the audit (`docs/security/threat-model.md`) still
 * forbids leaking PII into any console call we control. Centralising here means:
 *
 *   - One entry point that can be redirected to Sentry breadcrumbs / a debug
 *     buffer later without rewriting call-sites.
 *   - A consistent, allow-listed shape so accidental free-form interpolation
 *     stops at compile-time review.
 *   - A `safeErrorMessage` that strips JWT / UUID / email patterns from any
 *     `error.message` we pass through.
 *
 * Per-file/per-line overrides (rare): add `// eslint-disable-next-line no-console`
 * with a comment explaining why. The CI script `check:no-raw-console` enforces.
 */

const ALLOWED_KEYS = [
  'event',
  'feature',
  'error_code',
  'error_message',
  'duration_ms',
  'count',
  'phase',
] as const;

export type AllowedLogKeys = (typeof ALLOWED_KEYS)[number];

export type LogContext = Partial<Record<AllowedLogKeys, string | number | boolean | null>>;

type Level = 'info' | 'warn' | 'error';

function emit(level: Level, event: string, ctx: LogContext = {}): void {
  const sanitized: Record<string, unknown> = { level, event };
  for (const key of ALLOWED_KEYS) {
    if (key === 'event') continue;
    if (ctx[key] === undefined) continue;
    sanitized[key] = ctx[key];
  }
  // The single permitted `console.*` call in the browser code-base. The CI
  // check `scripts/check-no-raw-console.mjs` whitelists this file.
  // eslint-disable-next-line no-console
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  fn(JSON.stringify(sanitized));
}

export function logInfo(event: string, ctx?: LogContext): void {
  emit('info', event, ctx);
}

export function logWarn(event: string, ctx?: LogContext): void {
  emit('warn', event, ctx);
}

export function logError(event: string, ctx?: LogContext): void {
  emit('error', event, ctx);
}

/**
 * Reduce an arbitrary error to a short, non-PII descriptor. Use for
 * `error_message` so we never log raw `e.message` (which can contain SQL
 * fragments, JWT material, etc.).
 */
export function safeErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    const msg = e.message
      .replace(/eyJ[A-Za-z0-9_\-.]{20,}/g, '<jwt-redacted>')
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<uuid-redacted>')
      .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '<email-redacted>');
    return msg.length > 240 ? `${msg.slice(0, 240)}…` : msg;
  }
  return 'unknown error';
}
