import type { DetectorHit, NamedEntityRecognizer, RedactionContext } from '../types';
import { spanMatchesAllowlist } from './allowlist';

const COMMON_NON_NAME =
  /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December|MENDguild|United|Nations|Congress|Senate|House)\b/;

/**
 * Lightweight capitalized-sequence detector — high false-positive rate; gated by confidence
 * and allowlists. Replace with real NER via {@link NamedEntityRecognizer}.
 */
export const heuristicNamedEntityRecognizer: NamedEntityRecognizer = {
  id: 'heuristic.capitalized_sequences',
  async detect(text: string, ctx: RedactionContext): Promise<DetectorHit[]> {
    const hits: DetectorHit[] = [];
    const re = /\b(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g;
    let m: RegExpExecArray | null;
    const r = new RegExp(re.source, 'g');
    while ((m = r.exec(text)) !== null) {
      const raw = m[0];
      if (raw.length < 5) continue;
      if (COMMON_NON_NAME.test(raw)) continue;
      if (spanMatchesAllowlist(text, m.index, m.index + raw.length, ctx.allowlistTerms)) continue;
      hits.push({
        span: { start: m.index, end: m.index + raw.length },
        kind: 'probable_person_name',
        category: 'quasi_identifier',
        detectorId: heuristicNamedEntityRecognizer.id,
        confidence: 0.38,
        rationale: 'capitalized_multi_token',
      });
    }
    return hits;
  },
};
