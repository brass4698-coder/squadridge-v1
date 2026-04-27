import type { DetectorHit } from '../types';

const SOCIAL_HOSTS =
  '(?:linkedin\\.com|facebook\\.com|fb\\.com|instagram\\.com|twitter\\.com|x\\.com|tiktok\\.com|threads\\.net)';

/** Host may immediately follow `//` (no mandatory path prefix). */
const SOCIAL_URL_RE = new RegExp(`\\bhttps?:\\/\\/[^\\s]*?${SOCIAL_HOSTS}(?:\\/[^\\s]*)?`, 'gi');
const GENERIC_URL_RE = /\bhttps?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

export function detectSocialUrls(text: string): DetectorHit[] {
  const hits: DetectorHit[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(SOCIAL_URL_RE.source, 'gi');
  while ((m = re.exec(text)) !== null) {
    hits.push({
      span: { start: m.index, end: m.index + m[0].length },
      kind: 'direct_social_url',
      category: 'direct_identifier',
      detectorId: 'deterministic.social_url',
      confidence: 0.9,
    });
  }
  return hits;
}

/** Any URL — higher false positive risk; used in export_ledger / OCR modes only. */
export function detectGenericUrls(text: string): DetectorHit[] {
  const hits: DetectorHit[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(GENERIC_URL_RE.source, 'gi');
  while ((m = re.exec(text)) !== null) {
    hits.push({
      span: { start: m.index, end: m.index + m[0].length },
      kind: 'direct_url',
      category: 'direct_identifier',
      detectorId: 'deterministic.generic_url',
      confidence: 0.55,
    });
  }
  return hits;
}
