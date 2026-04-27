import type { DetectorHit } from '../types';

/** US SSN with optional dashes — high precision pattern. */
const US_SSN_RE = /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g;

/** Alphanumeric case/reference ids (tunable length). */
const LONG_ID_RE = /\b[A-Z]{2,4}[-_]?\d{6,12}\b/g;

export function detectGovernmentStyleIds(text: string): DetectorHit[] {
  const hits: DetectorHit[] = [];
  for (const re of [US_SSN_RE, LONG_ID_RE]) {
    let m: RegExpExecArray | null;
    const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
    while ((m = r.exec(text)) !== null) {
      const raw = m[0];
      if (re === US_SSN_RE && /^\d{9}$/.test(raw)) {
        // Avoid matching arbitrary 9-digit numbers (zip+4 overlap) — require word sanity
        if (raw.startsWith('000')) continue;
      }
      hits.push({
        span: { start: m.index, end: m.index + raw.length },
        kind: 'direct_government_or_system_id',
        category: 'direct_identifier',
        detectorId: 'deterministic.gov_id',
        confidence: re === US_SSN_RE ? 0.88 : 0.45,
      });
    }
  }
  return hits;
}
