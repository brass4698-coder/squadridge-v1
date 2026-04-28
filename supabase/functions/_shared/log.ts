/**
 * Structured logger for Supabase Edge Functions.
 *
 * The audit explicitly forbids leaking PII (user ids, session tokens, message
 * plaintext) into logs (see `docs/security/threat-model.md` and
 * `docs/auth/anonymous-to-verified.md`). Edge logs land in the operator's
 * Supabase project and may also be aggregated by upstream platforms; once written
 * they are out of our control. So we centralize logging here:
 *
 *   - Only emit JSON with a fixed, allow-listed key shape.
 *   - Ban raw `console.log/info/debug` everywhere except this file (CI script
 *     `check:no-raw-console` enforces).
 *   - Operators get a stable schema they can grep / parse, with a useful event
 *     name and structured context — no free-form string interpolation that might
 *     accidentally include a JWT or message body.
 *
 * Allowed top-level fields are the union of {@link AllowedLogKeys}.
 */

const ALLOWED_KEYS = [
  'event',
  'request_id',
  'error_code',
  'error_message',
  'duration_ms',
  'status',
  'function',
  'count',
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
  // The `console.*` calls below are the *only* permitted raw uses in the Edge
  // codebase (whitelisted by `scripts/check-no-raw-console.mjs`). Every other
  // file must call `logInfo` / `logWarn` / `logError` instead.
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
    // Truncate; strip anything that looks like a token / UUID / email.
    const msg = e.message
      .replace(/eyJ[A-Za-z0-9_\-.]{20,}/g, '<jwt-redacted>')
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<uuid-redacted>')
      .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '<email-redacted>');
    return msg.length > 240 ? `${msg.slice(0, 240)}…` : msg;
  }
  return 'unknown error';
}
