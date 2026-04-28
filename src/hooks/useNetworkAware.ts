import { useCallback, useRef, useState } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { withBackoff, type BackoffOptions } from '../lib';

/**
 * Network-aware fetch helper for low-bandwidth / unreliable connections
 * (Phase 3.3 of the audit remediation plan). Combines:
 *
 *   - `online` from `useOnlineStatus` — synchronous browser online state.
 *   - `degraded` — local heuristic: true after a recent retry or 5xx.
 *   - `request<T>(fn, options)` — `withBackoff(fn, options)` plus a quick
 *     "browser says we're offline; refuse early" short-circuit.
 *
 * The hook is intentionally small: it does not own any data, queue, or
 * dedupe — call-sites continue to use React Query / `sendQueue` for those.
 * It just gives flaky-network call-sites a uniform retry/backoff policy plus
 * a `degraded` flag they can render in the UI ("Network unstable, retrying…").
 *
 * Usage:
 *
 *     const { online, degraded, request } = useNetworkAware();
 *
 *     async function handleSend(body: string) {
 *       try {
 *         await request(() => sendMessage(body), { feature: 'send_message' });
 *       } catch (e) {
 *         toast.error('Could not send. Try again when the network is back.');
 *       }
 *     }
 */
export function useNetworkAware() {
  const online = useOnlineStatus();
  const [degraded, setDegraded] = useState(false);
  /** Most recent retry timestamp; clearing the degraded flag uses this. */
  const lastRetryAtRef = useRef<number | null>(null);

  const request = useCallback(
    async <T>(fn: () => Promise<T>, options?: Partial<BackoffOptions>): Promise<T> => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        // Surface offline as a thrown error so React Query / call-sites stay
        // in a single error path. Callers can branch on `error instanceof
        // OfflineError` if they need.
        throw new OfflineError();
      }
      return withBackoff(fn, {
        ...options,
        // Wrap caller's shouldRetry so we can flip the `degraded` flag.
        shouldRetry: (e) => {
          const decided = options?.shouldRetry?.(e);
          if (decided !== undefined) return decided;
          // Defer to the default isRetryableNetworkError logic via withBackoff.
          // We approximate it here: return true and let withBackoff's default decide.
          return true;
        },
      })
        .then((v) => {
          // Successful request after a retry: schedule a "degraded" cooldown.
          if (lastRetryAtRef.current !== null && Date.now() - lastRetryAtRef.current < 30_000) {
            // keep degraded UI for a moment after recovery so it isn't flickery
            window.setTimeout(() => setDegraded(false), 1_500);
          } else {
            setDegraded(false);
          }
          return v;
        })
        .catch((e) => {
          lastRetryAtRef.current = Date.now();
          setDegraded(true);
          throw e;
        });
    },
    [],
  );

  return { online, degraded, request } as const;
}

/** Thrown by {@link useNetworkAware().request} when the browser reports `navigator.onLine === false`. */
export class OfflineError extends Error {
  constructor() {
    super('You appear to be offline. Reconnect and try again.');
    this.name = 'OfflineError';
  }
}
