import type { DetectorHit } from '../types';

const BUILDING_FLOOR_RE =
  /\b(?:\d{1,2}(?:st|nd|rd|th)\s+floor|floor\s+\d{1,2}|Building\s+\d{1,3}|Room\s+\d{2,4}|Bldg\.?\s*\d{1,3})\b/gi;

const GRAD_YEAR_RE = /\b(?:class of|grad(?:uated)?)\s+20\d{2}\b/gi;

const SHIFT_RE =
  /\b(?:night shift|day shift|0700|1900|07:00|19:00)\s+(?:brief|formation|roll call)\b/gi;

export function detectQuasiIdentifiers(text: string): DetectorHit[] {
  const hits: DetectorHit[] = [];
  for (const { re, kind, confidence } of [
    { re: BUILDING_FLOOR_RE, kind: 'quasi_building_floor', confidence: 0.5 },
    { re: GRAD_YEAR_RE, kind: 'quasi_grad_year', confidence: 0.45 },
    { re: SHIFT_RE, kind: 'quasi_shift_detail', confidence: 0.42 },
  ]) {
    let m: RegExpExecArray | null;
    const r = new RegExp(re.source, 'gi');
    while ((m = r.exec(text)) !== null) {
      hits.push({
        span: { start: m.index, end: m.index + m[0].length },
        kind,
        category: 'quasi_identifier',
        detectorId: 'heuristic.quasi',
        confidence,
      });
    }
  }
  return hits;
}
