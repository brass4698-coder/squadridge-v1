import { z } from 'zod';

/** How content was produced — drives detector depth and default policy strictness. */
export const RedactionModeSchema = z.enum(['live_chat', 'upload_ocr', 'export_ledger']);
export type RedactionMode = z.infer<typeof RedactionModeSchema>;

export const AudienceTypeSchema = z.enum([
  'participant',
  'facilitator',
  'trust_safety_admin',
  'compliance_legal',
  'sponsor_export',
  'ledger_export',
  'internal_analytics',
]);
export type AudienceType = z.infer<typeof AudienceTypeSchema>;

export const ContentTypeSchema = z.enum([
  'live_message',
  'message_edit',
  'uploaded_text',
  'ocr_text',
  'summary',
  'facilitator_note',
  'sponsor_export',
  'ledger_record',
  'analytics_batch',
]);
export type ContentType = z.infer<typeof ContentTypeSchema>;

export const RiskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const TransformTypeSchema = z.enum([
  'hard_redact',
  'semantic_replace',
  'generalize',
  'audience_token',
  'preserve',
  'escalate_marker',
]);
export type TransformType = z.infer<typeof TransformTypeSchema>;

export const PolicyActionSchema = z.enum([
  'redact',
  'transform',
  'preserve',
  'reveal_if_authorized',
  'escalate_for_review',
]);
export type PolicyAction = z.infer<typeof PolicyActionSchema>;

export const FindingCategorySchema = z.enum([
  'direct_identifier',
  'quasi_identifier',
  'contextual_inferential',
  'relationship',
  'media_metadata',
]);
export type FindingCategory = z.infer<typeof FindingCategorySchema>;

export const TextSpanSchema = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
});
export type TextSpan = z.infer<typeof TextSpanSchema>;

/** Raw hit from a single detector before policy merge. */
export const DetectorHitSchema = z.object({
  span: TextSpanSchema,
  kind: z.string(),
  category: FindingCategorySchema,
  detectorId: z.string(),
  confidence: z.number().min(0).max(1),
  /** Optional short reason for explainability (no secrets). */
  rationale: z.string().optional(),
});
export type DetectorHit = z.infer<typeof DetectorHitSchema>;

export const PolicyDecisionSchema = z.object({
  action: PolicyActionSchema,
  transformType: TransformTypeSchema,
  /** Placeholder token or pattern key, e.g. [REDACTED_EMAIL], [participant-a]. */
  replacementKey: z.string(),
  /** Human-readable policy rule id. */
  ruleId: z.string(),
});
export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;

export const FindingSchema = z.object({
  id: z.string(),
  span: TextSpanSchema,
  kind: z.string(),
  category: FindingCategorySchema,
  detectorIds: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  /** Merged risk contribution 0–100 after scoring pass. */
  riskContribution: z.number().min(0).max(100),
  decision: PolicyDecisionSchema,
  /** Snippet hash for audit linkage — not raw text. */
  snippetHash: z.string().optional(),
});
export type Finding = z.infer<typeof FindingSchema>;

export const RedactionContextSchema = z.object({
  roomId: z.string(),
  sessionId: z.string().optional(),
  contentId: z.string().optional(),
  actorUserId: z.string().optional(),
  userRole: z.string().optional(),
  roomType: z.string().optional(),
  /** HMAC key material for pseudonyms — never log or persist in audit plaintext. */
  roomPseudonymSecret: z.string().optional(),
  allowlistTerms: z.array(z.string()).optional(),
  sensitiveLexicon: z.array(z.string()).optional(),
  jurisdictionFlags: z.record(z.string(), z.boolean()).optional(),
  consentFlags: z.record(z.string(), z.boolean()).optional(),
  emergencyHoldMode: z.boolean().optional(),
  legalHoldMode: z.boolean().optional(),
});
export type RedactionContext = z.infer<typeof RedactionContextSchema>;

export const RedactionRequestSchema = z.object({
  text: z.string(),
  mode: RedactionModeSchema,
  audience: AudienceTypeSchema,
  contentType: ContentTypeSchema,
  context: RedactionContextSchema,
  /** Participant user ids in room for pseudonym stability (optional for non-room flows). */
  roomParticipantUserIds: z.array(z.string()).optional(),
  /** Skip heuristic / pluggable NER even if mode would normally run it (live fast path). */
  skipDeepEntityPass: z.boolean().optional(),
  /** System actor label for audit. */
  actorLabel: z.string().optional(),
});
export type RedactionRequest = z.infer<typeof RedactionRequestSchema>;

export const HighlightSpanSchema = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
  kind: z.string(),
  decision: PolicyActionSchema,
  replacementPreview: z.string(),
});
export type HighlightSpan = z.infer<typeof HighlightSpanSchema>;

export const PseudonymMapEntrySchema = z.object({
  userId: z.string(),
  label: z.string(),
  /** Stable opaque token for APIs — not the display label. */
  opaqueToken: z.string(),
});
export type PseudonymMapEntry = z.infer<typeof PseudonymMapEntrySchema>;

export const AuditRecordSchema = z.object({
  contentHash: z.string(),
  redactedContentHash: z.string(),
  findingsCount: z.number().int().nonnegative(),
  /** Finding ids and snippet hashes only in default audit surface. */
  findingRefs: z.array(z.object({ findingId: z.string(), snippetHash: z.string() })),
  policyPackId: z.string(),
  mode: RedactionModeSchema,
  audience: AudienceTypeSchema,
  contentType: ContentTypeSchema,
  roomId: z.string(),
  contentId: z.string().optional(),
  timestampIso: z.string(),
  actorLabel: z.string(),
  humanReviewRecommended: z.boolean(),
  messageRiskScore: z.number().min(0).max(100),
});
export type AuditRecord = z.infer<typeof AuditRecordSchema>;

export const RedactionResultSchema = z.object({
  originalContentHash: z.string(),
  redactedText: z.string(),
  /** Per-audience views (v1 always fills participant + requested audience at minimum). */
  viewsByAudience: z.record(AudienceTypeSchema, z.string()),
  findings: z.array(FindingSchema),
  highlights: z.array(HighlightSpanSchema),
  messageRiskScore: z.number().min(0).max(100),
  humanReviewRecommended: z.boolean(),
  audit: AuditRecordSchema,
  pseudonymMap: z.array(PseudonymMapEntrySchema),
  decisionTrace: z.array(
    z.object({
      step: z.string(),
      detail: z.string(),
    }),
  ),
});
export type RedactionResult = z.infer<typeof RedactionResultSchema>;

/** Pluggable NER — swap for ONNX / remote API without changing pipeline shape. */
export type NamedEntityRecognizer = {
  readonly id: string;
  detect(text: string, ctx: RedactionContext): Promise<DetectorHit[]>;
};
