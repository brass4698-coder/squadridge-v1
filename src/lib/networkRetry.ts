import { logWarn, safeErrorMessage } from './log';

/**
 * Retry-with-backoff helper for low-bandwidth / flaky networks (Phase 3.3 of
 * the audit remediation plan). Designed for:
 *
 *   - Message sends (`SessionPage` composer → `ingest-message` Edge fn)
 *   - Matchmaking RPC calls
 *   - Other "should succeed eventually if the network comes back" requests
 *
 * Not designed for ZK proof verification (one-shot) or auth flows (where
 * silent retries can mask credential issues).
 *
 * Default policy (mirror of {@link DEFAULT_BACKOFF_OPTIONS}):
 *   - Up to 4 attempts (1 + 3 retries).
 *   - Exponential delay starting at 500ms, doubling each attempt, capped at 8s.
 *   - Deterministic full-jitter [delay/2, delay] to avoid thundering herd.
 *   - {@link isRetryableNetworkError} treats network errors and 5xx as retryable;
 *     400-class responses are surfaced immediately so the caller can react.
 */

export interface BackoffOptions {
  /** Including the initial attempt. Defaults to 4 (1 + 3 retries). */
  maxAttempts: number;
  /** First retry delay in ms. Defaults to 500. */
  baseDelayMs: number;
  /** Cap on any single retry delay. Defaults to 8000. */
  maxDelayMs: number;
  /** Optional cancellation. */
  signal?: AbortSignal;
  /** Predicate for whether to retry on a thrown error. Defaults to {@link isRetryableNetworkError}. */
  shouldRetry?: (error: unknown) => boolean;
  /** Tag for the structured `network_retry` log on each retry attempt. */
  feature?: string;
}

export const DEFAULT_BACKOFF_OPTIONS: BackoffOptions = {
  maxAttempts: 4,
  baseDelayMs: 500,
  maxDelayMs: 8_000,
  feature: 'network_retry',
};

export function isRetryableNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  // `fetch` failures: TypeError (offline), AbortError on timeout, network DNS failures.
  if (error.name === 'TypeError') return true;
  if (error.name === 'AbortError') return false;
  const msg = error.message.toLowerCase();
  if (msg.includes('failed to fetch')) return true;
  if (msg.includes('networkerror')) return true;
  if (msg.includes('timeout') || msg.includes('timed out')) return true;
  if (msg.includes('connection') && msg.includes('reset')) return true;
  // Supabase RPC errors propagate as Error with message; extract status if present.
  // We look at trailing " (5xx)" or "Server Error" hints — best effort.
  if (/\b5\d\d\b/.test(error.message)) return true;
  return false;
}

function computeDelay(attempt: number, base: number, cap: number): number {
  const expo = Math.min(cap, base * 2 ** (attempt - 1));
  // Full jitter: random in [expo/2, expo].
  return Math.floor(expo / 2 + Math.random() * (expo / 2));
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const t = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort);
  });
}

/**
 * Run `fn` with exponential-backoff retries. Returns the resolved value or
 * throws the final error when retries are exhausted (or `shouldRetry` returns
 * false).
 *
 * @example
 *   const id = await withBackoff(() => sendMessage(text), { feature: 'send_message' });
 */
export async function withBackoff<T>(
  fn: () => Promise<T>,
  options: Partial<BackoffOptions> = {},
): Promise<T> {
  const opts: BackoffOptions = { ...DEFAULT_BACKOFF_OPTIONS, ...options };
  const shouldRetry = opts.shouldRetry ?? isRetryableNetworkError;
  let attempt = 1;
  let lastErr: unknown;
  while (attempt <= opts.maxAttempts) {
    if (opts.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (attempt >= opts.maxAttempts || !shouldRetry(e)) break;
      const delay = computeDelay(attempt, opts.baseDelayMs, opts.maxDelayMs);
      logWarn('network_retry_scheduled', {
        feature: opts.feature ?? 'network_retry',
        count: attempt,
        duration_ms: delay,
        error_message: safeErrorMessage(e),
      });
      await sleep(delay, opts.signal);
      attempt += 1;
    }
  }
  throw lastErr;
}
