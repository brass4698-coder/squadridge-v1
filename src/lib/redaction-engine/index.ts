/**
 * SquadRidge PII / identity leakage redaction engine — server-first, policy-driven, audience-aware.
 * Wire final enforcement on the server before persisting participant-visible content.
 */

export { buildAuditRecord as auditRedaction } from './audit/buildAuditRecord';
export { mergeDetectorHits } from './detectors/mergeSpans';
export { runDeterministicLayer } from './detectors/runDeterministic';
export { heuristicNamedEntityRecognizer } from './detectors/nerHeuristic';
export type { NamedEntityRecognizer } from './types';
export {
  adjudicateHit,
  DEFAULT_POLICY_PACK_ID,
  KIND_REPLACEMENT,
} from './policies/defaultSquadRidge';
export { applyPolicy, humanReviewRecommended } from './policies/enrichFindings';
export {
  detectSensitiveEntities,
  generateAudienceView,
  redactContent,
  type RedactionPipelineRequest,
} from './pipelines/redactContent';
export {
  createPseudonymMap,
  labelForUser,
  resolveRoomPseudonymSecret,
} from './pseudonyms/roomScoped';
export type { PseudonymResolutionOptions } from './pseudonyms/roomScoped';
export { scoreMessageRisk, hitRiskContribution } from './scoring/riskScore';
export {
  applyFindingsToText as transformContent,
  findingsToHighlights,
} from './transformers/applyTransforms';
export { sha256Hex, hmacSha256Hex, snippetFingerprint } from './hash';
export * from './types';
