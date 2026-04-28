import { logWarn } from './log';

/**
 * Lightweight realtime telemetry — records subscribe / unsubscribe / fallback
 * events so operators have a quick sample of socket pressure without standing
 * up a full metrics pipeline (Phase 3.2 of the audit remediation plan).
 *
 * The counters are in-memory per browser tab; the dashboards / Sentry plumbing
 * lands in Phase 3.4. Until then, the helper is enough to surface unexpected
 * behaviour during a pilot — e.g. a hot reload loop that opens 40 channels for
 * the same squad — and `getRealtimeTelemetry()` can be called from devtools.
 *
 * The per-squad cap is **soft**: we log a warning when crossed but do not
 * disconnect, because a brief overlap during a hot reload or rapid route
 * change is benign. Hard enforcement (server-side `subscribe_to_squad` RPC)
 * is documented in `docs/adr/002-realtime-vs-polling.md` and remains future
 * work.
 */

/** Hot-reload safety: dedupe across multi-component remounts within a tab. */
const MAX_REALTIME_SUBSCRIBERS_PER_SQUAD = 4;

interface RealtimeTelemetryState {
  subscribesByTag: Map<string, number>;
  fallbackCount: number;
  errorCount: number;
  totalSubscribes: number;
  totalUnsubscribes: number;
}

const state: RealtimeTelemetryState = {
  subscribesByTag: new Map(),
  fallbackCount: 0,
  errorCount: 0,
  totalSubscribes: 0,
  totalUnsubscribes: 0,
};

/**
 * Tag is a stable identity for the subscription topic — typically
 * `messages:<squadId>` or `crisis_alerts:<squadId>`. Returns a "release"
 * function the caller MUST invoke when the subscription ends; matches
 * useEffect cleanup semantics.
 */
export function recordRealtimeSubscribe(tag: string): () => void {
  const next = (state.subscribesByTag.get(tag) ?? 0) + 1;
  state.subscribesByTag.set(tag, next);
  state.totalSubscribes += 1;
  if (next > MAX_REALTIME_SUBSCRIBERS_PER_SQUAD) {
    logWarn('realtime_subscribers_over_cap', {
      feature: 'realtime',
      count: next,
      // `tag` is event-shaped (e.g. "messages:<squad>"); do not emit a UUID directly.
      error_code: tag.split(':')[0] ?? 'unknown',
    });
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const cur = state.subscribesByTag.get(tag) ?? 0;
    if (cur <= 1) state.subscribesByTag.delete(tag);
    else state.subscribesByTag.set(tag, cur - 1);
    state.totalUnsubscribes += 1;
  };
}

/** Increment the "fell back to polling / catch-up query" counter. */
export function recordRealtimeFallback(): void {
  state.fallbackCount += 1;
}

/** Increment the "subscribe error / channel error" counter. */
export function recordRealtimeError(): void {
  state.errorCount += 1;
}

/** Snapshot the current counters. Useful from devtools and from Phase 3.4 dashboards. */
export function getRealtimeTelemetry(): {
  totalSubscribes: number;
  totalUnsubscribes: number;
  fallbackCount: number;
  errorCount: number;
  perTag: Array<{ tag: string; count: number }>;
} {
  const perTag = Array.from(state.subscribesByTag.entries()).map(([tag, count]) => ({
    tag,
    count,
  }));
  return {
    totalSubscribes: state.totalSubscribes,
    totalUnsubscribes: state.totalUnsubscribes,
    fallbackCount: state.fallbackCount,
    errorCount: state.errorCount,
    perTag,
  };
}

/** Clear counters (test-only). */
export function resetRealtimeTelemetry(): void {
  state.subscribesByTag.clear();
  state.fallbackCount = 0;
  state.errorCount = 0;
  state.totalSubscribes = 0;
  state.totalUnsubscribes = 0;
}

export const REALTIME_TELEMETRY_MAX_SUBSCRIBERS_PER_TAG = MAX_REALTIME_SUBSCRIBERS_PER_SQUAD;
