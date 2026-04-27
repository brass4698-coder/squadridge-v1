import { sha256Hex } from '../hash';
import type { AuditRecord, Finding, RedactionRequest } from '../types';
import { DEFAULT_POLICY_PACK_ID } from '../policies/defaultSquadRidge';

export async function buildAuditRecord(
  req: RedactionRequest,
  redactedText: string,
  findings: Finding[],
  messageRiskScore: number,
  humanReviewRecommended: boolean,
): Promise<AuditRecord> {
  const contentHash = await sha256Hex(req.text);
  const redactedContentHash = await sha256Hex(redactedText);
  const findingRefs = await Promise.all(
    findings.map(async (f) => ({
      findingId: f.id,
      snippetHash: f.snippetHash ?? (await sha256Hex(`${f.id}:${f.span.start}:${f.span.end}`)),
    })),
  );
  return {
    contentHash,
    redactedContentHash,
    findingsCount: findings.length,
    findingRefs,
    policyPackId: DEFAULT_POLICY_PACK_ID,
    mode: req.mode,
    audience: req.audience,
    contentType: req.contentType,
    roomId: req.context.roomId,
    contentId: req.context.contentId,
    timestampIso: new Date().toISOString(),
    actorLabel: req.actorLabel ?? 'redaction-engine',
    humanReviewRecommended,
    messageRiskScore,
  };
}
