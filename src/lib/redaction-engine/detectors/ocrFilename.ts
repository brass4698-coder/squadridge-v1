import type { DetectorHit } from '../types';

/** Heuristic: filenames that often carry names from screenshots or scans. */
const SUS_FILENAME_RE =
  /\b(?:IMG_|Screenshot|Screen\s+Shot|Scan_|passport|license|ID_|I9_|resume|cv)[^\s]*\.(?:png|jpe?g|pdf|tiff?)\b/gi;

export function detectSuspiciousFilenames(text: string): DetectorHit[] {
  const hits: DetectorHit[] = [];
  let m: RegExpExecArray | null;
  const r = new RegExp(SUS_FILENAME_RE.source, 'gi');
  while ((m = r.exec(text)) !== null) {
    hits.push({
      span: { start: m.index, end: m.index + m[0].length },
      kind: 'media_suspicious_filename',
      category: 'media_metadata',
      detectorId: 'heuristic.filename',
      confidence: 0.5,
    });
  }
  return hits;
}
