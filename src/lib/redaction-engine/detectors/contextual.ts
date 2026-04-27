import type { DetectorHit } from '../types';

const ONLY_ONE_RE = /\bthe only\s+[\w'-]+\s+in\s+(?:the\s+)?[\w'-]+(?:\s+[\w'-]+){0,3}\b/gi;

const BOARD_MEETING_DATE_RE =
  /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+20\d{2}\s+board\s+meeting\b/gi;

export function detectContextualInferential(text: string): DetectorHit[] {
  const hits: DetectorHit[] = [];
  let m: RegExpExecArray | null;
  const a = new RegExp(ONLY_ONE_RE.source, 'gi');
  while ((m = a.exec(text)) !== null) {
    hits.push({
      span: { start: m.index, end: m.index + m[0].length },
      kind: 'inferential_unique_role_cohort',
      category: 'contextual_inferential',
      detectorId: 'heuristic.contextual_unique',
      confidence: 0.55,
    });
  }
  const b = new RegExp(BOARD_MEETING_DATE_RE.source, 'gi');
  while ((m = b.exec(text)) !== null) {
    hits.push({
      span: { start: m.index, end: m.index + m[0].length },
      kind: 'inferential_dated_internal_event',
      category: 'contextual_inferential',
      detectorId: 'heuristic.dated_event',
      confidence: 0.48,
    });
  }
  return hits;
}
