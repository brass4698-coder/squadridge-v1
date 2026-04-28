import { buildAuditRecord } from '../audit/buildAuditRecord';
import { spanMatchesAllowlist } from '../detectors/allowlist';
import { mergeDetectorHits } from '../detectors/mergeSpans';
import { heuristicNamedEntityRecognizer } from '../detectors/nerHeuristic';
import { runDeterministicLayer } from '../detectors/runDeterministic';
import { sha256Hex } from '../hash';
import { applyPolicy, humanReviewRecommended as reviewGate } from '../policies/enrichFindings';
import { createPseudonymMap } from '../pseudonyms/roomScoped';
import { scoreMessageRisk } from '../scoring/riskScore';
import { applyFindingsToText, findingsToHighlights } from '../transformers/applyTransforms';
import type {
  AudienceType,
  NamedEntityRecognizer,
  RedactionRequest,
  RedactionResult,
  DetectorHit,
  Finding,
} from '../types';
import { RedactionRequestSchema } from '../types';

export type RedactionPipelineRequest = RedactionRequest & {
  /** Override default heuristic NER; integrate ONNX / API here. */
  nerAdapter?: NamedEntityRecognizer;
};

function shouldRunNer(req: RedactionPipelineRequest): boolean {
  if (req.skipDeepEntityPass) return false;
  return req.mode === 'upload_ocr' || req.mode === 'export_ledger';
}

function filterAllowlisted(text: string, hits: DetectorHit[], allow?: string[]): DetectorHit[] {
  if (!allow?.length) return hits;
  return hits.filter((h) => !spanMatchesAllowlist(text, h.span.start, h.span.end, allow));
}

const ALL_AUDIENCES: AudienceType[] = [
  'participant',
  'facilitator',
  'trust_safety_admin',
  'compliance_legal',
  'sponsor_export',
  'ledger_export',
  'internal_analytics',
];

/**
 * Main entry: deterministic + optional NER, policy by audience, structured outputs + audit hashes.
 * Enforce server-side before persistence for participant-visible stores in production.
 */
export async function redactContent(req: RedactionPipelineRequest): Promise<RedactionResult> {
  const parsed = RedactionRequestSchema.parse(req);
  const ner = req.nerAdapter ?? heuristicNamedEntityRecognizer;

  const trace: { step: string; detail: string }[] = [];
  trace.push({ step: 'validate', detail: 'RedactionRequestSchema.ok' });

  let hits = runDeterministicLayer(parsed.text, parsed.mode);
  trace.push({ step: 'deterministic', detail: `${hits.length} hits` });

  if (shouldRunNer(req)) {
    const nerHits = await ner.detect(parsed.text, parsed.context);
    hits = [...hits, ...nerHits];
    trace.push({ step: 'ner', detail: `${nerHits.length} hits from ${ner.id}` });
  }

  hits = filterAllowlisted(parsed.text, hits, parsed.context.allowlistTerms);
  const lex = parsed.context.sensitiveLexicon;
  if (lex?.length) {
    const lower = parsed.text.toLowerCase();
    for (const term of lex) {
      const t = term.trim().toLowerCase();
      if (t.length < 3) continue;
      let idx = 0;
      while ((idx = lower.indexOf(t, idx)) !== -1) {
        hits.push({
          span: { start: idx, end: idx + t.length },
          kind: 'lexicon_sensitive_term',
          category: 'quasi_identifier',
          detectorId: 'lexicon.room',
          confidence: 0.75,
        });
        idx += t.length;
      }
    }
    trace.push({ step: 'lexicon', detail: 'merged' });
  }

  hits = mergeDetectorHits(hits);

  const messageRiskScore = scoreMessageRisk(hits, parsed.mode);
  trace.push({ step: 'risk', detail: `score=${messageRiskScore}` });

  const pseudonymMap =
    (parsed.skipPseudonymMap ?? false)
      ? []
      : await createPseudonymMap(parsed.context, parsed.roomParticipantUserIds ?? []);

  const viewsByAudience: Record<string, string> = {};
  let primaryFindings: Finding[] = [];

  for (const aud of ALL_AUDIENCES) {
    const findings = await applyPolicy(parsed.text, hits, {
      audience: aud,
      contentType: parsed.contentType,
      mode: parsed.mode,
      messageRisk: messageRiskScore,
    });
    viewsByAudience[aud] = applyFindingsToText(parsed.text, findings);
    if (aud === parsed.audience) primaryFindings = findings;
  }

  const redactedText = viewsByAudience[parsed.audience] ?? viewsByAudience.participant;
  const humanReviewRecommended = reviewGate(primaryFindings, messageRiskScore, parsed.mode);
  const audit = await buildAuditRecord(
    parsed,
    redactedText,
    primaryFindings,
    messageRiskScore,
    humanReviewRecommended,
  );

  trace.push({ step: 'audit', detail: `hash=${audit.contentHash.slice(0, 12)}…` });

  const originalContentHash = await sha256Hex(parsed.text);

  return {
    originalContentHash,
    redactedText,
    viewsByAudience: viewsByAudience as RedactionResult['viewsByAudience'],
    findings: primaryFindings,
    highlights: findingsToHighlights(primaryFindings),
    messageRiskScore,
    humanReviewRecommended,
    audit,
    pseudonymMap,
    decisionTrace: trace,
  };
}

export async function detectSensitiveEntities(
  text: string,
  ctx: RedactionRequest['context'],
  mode: RedactionRequest['mode'],
): Promise<DetectorHit[]> {
  const hits = runDeterministicLayer(text, mode);
  const ner =
    mode === 'upload_ocr' || mode === 'export_ledger'
      ? await heuristicNamedEntityRecognizer.detect(text, ctx)
      : [];
  return filterAllowlisted(text, mergeDetectorHits([...hits, ...ner]), ctx.allowlistTerms);
}

export async function generateAudienceView(
  text: string,
  audience: AudienceType,
  req: Pick<RedactionRequest, 'contentType' | 'mode' | 'context' | 'audience'> & {
    roomParticipantUserIds?: string[];
  },
): Promise<string> {
  const base = runDeterministicLayer(text, req.mode);
  const ner =
    req.mode === 'upload_ocr' || req.mode === 'export_ledger'
      ? await heuristicNamedEntityRecognizer.detect(text, req.context)
      : [];
  let hits = mergeDetectorHits([...base, ...ner]);
  hits = filterAllowlisted(text, hits, req.context.allowlistTerms);
  const messageRisk = scoreMessageRisk(hits, req.mode);
  const findings = await applyPolicy(text, hits, {
    audience,
    contentType: req.contentType,
    mode: req.mode,
    messageRisk,
  });
  return applyFindingsToText(text, findings);
}
