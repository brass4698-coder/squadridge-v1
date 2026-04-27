import type { DetectorHit, RedactionMode } from '../types';

const CATEGORY_WEIGHT: Record<DetectorHit['category'], number> = {
  direct_identifier: 38,
  quasi_identifier: 18,
  contextual_inferential: 28,
  relationship: 22,
  media_metadata: 20,
};

/** Aggregate message-level risk 0–100 from merged hits. */
export function scoreMessageRisk(hits: DetectorHit[], mode: RedactionMode): number {
  if (hits.length === 0) return 0;
  let raw = 0;
  for (const h of hits) {
    raw += CATEGORY_WEIGHT[h.category] * h.confidence;
  }
  const modeBoost = mode === 'export_ledger' ? 1.15 : mode === 'upload_ocr' ? 1.05 : 1;
  const scaled = Math.min(100, Math.round(raw * modeBoost));
  return scaled;
}

export function hitRiskContribution(hit: DetectorHit, mode: RedactionMode): number {
  const base = CATEGORY_WEIGHT[hit.category] * hit.confidence;
  const modeBoost = mode === 'export_ledger' ? 1.15 : mode === 'upload_ocr' ? 1.05 : 1;
  return Math.min(100, Math.round(base * modeBoost));
}
