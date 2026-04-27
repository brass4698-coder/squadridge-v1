import type { DetectorHit } from '../types';

const IPV4_RE = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g;

export function detectIpv4(text: string): DetectorHit[] {
  const hits: DetectorHit[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(IPV4_RE.source, 'g');
  while ((m = re.exec(text)) !== null) {
    hits.push({
      span: { start: m.index, end: m.index + m[0].length },
      kind: 'direct_ipv4',
      category: 'direct_identifier',
      detectorId: 'deterministic.ipv4',
      confidence: 0.9,
    });
  }
  return hits;
}
