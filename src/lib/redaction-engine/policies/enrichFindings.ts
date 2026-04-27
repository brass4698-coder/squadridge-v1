import { snippetFingerprint } from '../hash';
import { hitRiskContribution } from '../scoring/riskScore';
import type { AudienceType, DetectorHit, Finding, RedactionRequest } from '../types';
import { adjudicateHit } from './defaultSquadRidge';

export async function applyPolicy(
  text: string,
  hits: DetectorHit[],
  opts: {
    audience: AudienceType;
    contentType: RedactionRequest['contentType'];
    mode: RedactionRequest['mode'];
    messageRisk: number;
  },
): Promise<Finding[]> {
  const out: Finding[] = [];
  for (const hit of hits) {
    const decision = adjudicateHit(hit, {
      audience: opts.audience,
      contentType: opts.contentType,
      mode: opts.mode,
      messageRisk: opts.messageRisk,
    });
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `f-${hit.span.start}-${hit.span.end}-${Math.random().toString(36).slice(2)}`;
    out.push({
      id,
      span: hit.span,
      kind: hit.kind,
      category: hit.category,
      detectorIds: [hit.detectorId],
      confidence: hit.confidence,
      riskContribution: hitRiskContribution(hit, opts.mode),
      decision,
      snippetHash: await snippetFingerprint(text, hit.span),
    });
  }
  return out;
}

export function humanReviewRecommended(
  findings: Finding[],
  messageRisk: number,
  mode: RedactionRequest['mode'],
): boolean {
  if (findings.some((f) => f.decision.action === 'escalate_for_review')) return true;
  if (messageRisk >= 65) return true;
  if (mode === 'export_ledger' && messageRisk >= 40) return true;
  return false;
}
