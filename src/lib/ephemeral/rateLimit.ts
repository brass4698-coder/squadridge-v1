/**
 * Client-side throttle for "Slow down" flows. Server-side rate limits belong on Redis/edge.
 */
const buckets = new Map<string, number[]>();

export function allowClientBurst(key: string, maxPerMinute: number, now = Date.now()): boolean {
  const windowMs = 60_000;
  const existing = buckets.get(key) ?? [];
  const recent = existing.filter((t) => now - t < windowMs);
  if (recent.length >= maxPerMinute) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}
