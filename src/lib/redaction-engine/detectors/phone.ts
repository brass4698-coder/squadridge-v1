import type { DetectorHit } from '../types';

/** International-friendly digit runs with optional separators; conservative length bounds. */
const PHONE_RE =
  /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,6}\b/g;

export function detectPhones(text: string): DetectorHit[] {
  const hits: DetectorHit[] = [];
  const re = new RegExp(PHONE_RE.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = m[0];
    const digits = raw.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) continue;
    hits.push({
      span: { start: m.index, end: m.index + raw.length },
      kind: 'direct_phone',
      category: 'direct_identifier',
      detectorId: 'deterministic.phone',
      confidence: 0.85,
    });
  }
  return hits;
}
