import type { DetectorHit } from '../types';

const ISO_DATE_RE = /\b20\d{2}-\d{2}-\d{2}\b/g;

const US_DATE_RE = /\b\d{1,2}\/\d{1,2}\/20\d{2}\b/g;

export function detectExactDates(text: string): DetectorHit[] {
  const hits: DetectorHit[] = [];
  for (const re of [ISO_DATE_RE, US_DATE_RE]) {
    let m: RegExpExecArray | null;
    const r = new RegExp(re.source, 'g');
    while ((m = r.exec(text)) !== null) {
      hits.push({
        span: { start: m.index, end: m.index + m[0].length },
        kind: 'quasi_exact_date',
        category: 'quasi_identifier',
        detectorId: 'deterministic.date',
        confidence: 0.4,
      });
    }
  }
  return hits;
}
