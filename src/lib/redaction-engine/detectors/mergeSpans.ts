import type { DetectorHit } from '../types';

function overlaps(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

function mergeTwo(
  a: { start: number; end: number },
  b: { start: number; end: number },
): { start: number; end: number } {
  return { start: Math.min(a.start, b.start), end: Math.max(a.end, b.end) };
}

/** Merge overlapping hits; higher confidence wins kind when merged. */
export function mergeDetectorHits(hits: DetectorHit[]): DetectorHit[] {
  if (hits.length === 0) return [];
  const sorted = [...hits].sort(
    (x, y) => x.span.start - y.span.start || y.confidence - x.confidence,
  );
  const out: DetectorHit[] = [];
  let cur = { ...sorted[0] };

  for (let i = 1; i < sorted.length; i++) {
    const h = sorted[i];
    if (overlaps(cur.span, h.span)) {
      const span = mergeTwo(cur.span, h.span);
      const winner = cur.confidence >= h.confidence ? cur : h;
      cur = {
        ...winner,
        span,
        confidence: Math.max(cur.confidence, h.confidence),
        detectorId: `${cur.detectorId}+${h.detectorId}`,
        kind: cur.confidence >= h.confidence ? cur.kind : h.kind,
      };
    } else {
      out.push(cur);
      cur = { ...h };
    }
  }
  out.push(cur);
  return out;
}
