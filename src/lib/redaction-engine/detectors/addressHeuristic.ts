import type { DetectorHit } from '../types';

const STREET_RE =
  /\b\d{1,5}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\s+(?:Street|St\.|Road|Rd\.|Avenue|Ave\.|Boulevard|Blvd\.|Drive|Dr\.|Lane|Ln\.|Court|Ct\.)\b/gi;

const ZIP_RE = /\b\d{5}(?:-\d{4})?\b/g;

export function detectAddressHeuristics(text: string): DetectorHit[] {
  const hits: DetectorHit[] = [];
  let m: RegExpExecArray | null;
  const s = new RegExp(STREET_RE.source, 'gi');
  while ((m = s.exec(text)) !== null) {
    hits.push({
      span: { start: m.index, end: m.index + m[0].length },
      kind: 'direct_street_address',
      category: 'direct_identifier',
      detectorId: 'heuristic.address_street',
      confidence: 0.72,
    });
  }
  const z = new RegExp(ZIP_RE.source, 'g');
  while ((m = z.exec(text)) !== null) {
    hits.push({
      span: { start: m.index, end: m.index + m[0].length },
      kind: 'quasi_zip',
      category: 'quasi_identifier',
      detectorId: 'heuristic.zip',
      confidence: 0.35,
    });
  }
  return hits;
}
