import type { DetectorHit } from '../types';

// Pragmatic RFC5322-ish local + domain — avoids catastrophic backtracking.
const EMAIL_RE =
  /\b[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+\b/g;

export function detectEmails(text: string): DetectorHit[] {
  const hits: DetectorHit[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(EMAIL_RE.source, 'g');
  while ((m = re.exec(text)) !== null) {
    hits.push({
      span: { start: m.index, end: m.index + m[0].length },
      kind: 'direct_email',
      category: 'direct_identifier',
      detectorId: 'deterministic.email',
      confidence: 0.95,
    });
  }
  return hits;
}
