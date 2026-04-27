import type { DetectorHit } from '../types';

const REL_RE =
  /\b(?:my\s+(?:manager|commander|CO|XO|direct report|roommate|spouse|partner)|the\s+(?:complainant|witness|respondent|approver|mediator))\b/gi;

export function detectRelationshipPhrases(text: string): DetectorHit[] {
  const hits: DetectorHit[] = [];
  let m: RegExpExecArray | null;
  const r = new RegExp(REL_RE.source, 'gi');
  while ((m = r.exec(text)) !== null) {
    hits.push({
      span: { start: m.index, end: m.index + m[0].length },
      kind: 'relationship_anchor',
      category: 'relationship',
      detectorId: 'heuristic.relationship',
      confidence: 0.52,
    });
  }
  return hits;
}
