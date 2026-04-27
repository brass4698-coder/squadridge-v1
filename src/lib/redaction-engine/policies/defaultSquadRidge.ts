import type {
  AudienceType,
  ContentType,
  DetectorHit,
  PolicyDecision,
  RedactionMode,
} from '../types';

export const DEFAULT_POLICY_PACK_ID = 'squadridge.strict_pseudonymous_v1';

/** Replacement labels for deterministic kinds — extend as detectors grow. */
export const KIND_REPLACEMENT: Record<string, string> = {
  direct_email: '[REDACTED_EMAIL]',
  direct_phone: '[REDACTED_PHONE]',
  direct_social_url: '[REDACTED_PROFILE_URL]',
  direct_url: '[REDACTED_URL]',
  direct_ipv4: '[REDACTED_IP]',
  direct_government_or_system_id: '[REDACTED_ID]',
  direct_street_address: '[REDACTED_ADDRESS]',
  quasi_zip: '[LOCATION_DETAIL_REMOVED]',
  direct_signature_block: '[REDACTED_SIGNATURE_BLOCK]',
  probable_person_name: '[PARTICIPANT_NAME]',
  quasi_building_floor: '[SPECIFIC_WORKPLACE_LOCATION]',
  quasi_grad_year: '[COHORT_DETAIL_REMOVED]',
  quasi_shift_detail: '[SCHEDULE_DETAIL_REMOVED]',
  quasi_exact_date: '[DATE_GENERALIZED]',
  inferential_unique_role_cohort: '[RE_IDENTIFICATION_RISK_REMOVED]',
  inferential_dated_internal_event: '[INTERNAL_EVENT_GENERALIZED]',
  relationship_anchor: '[RELATIONSHIP_REFERENCE_REMOVED]',
  media_suspicious_filename: '[FILENAME_REMOVED]',
  lexicon_sensitive_term: '[SENSITIVE_TERM_REMOVED]',
};

function audienceTier(audience: AudienceType): 'participant' | 'facilitator' | 'admin' | 'export' {
  switch (audience) {
    case 'participant':
      return 'participant';
    case 'facilitator':
      return 'facilitator';
    case 'trust_safety_admin':
    case 'compliance_legal':
      return 'admin';
    case 'sponsor_export':
    case 'ledger_export':
    case 'internal_analytics':
      return 'export';
    default:
      return 'participant';
  }
}

export function adjudicateHit(
  hit: DetectorHit,
  opts: {
    audience: AudienceType;
    contentType: ContentType;
    mode: RedactionMode;
    messageRisk: number;
  },
): PolicyDecision {
  if (hit.kind === 'lexicon_sensitive_term') {
    return {
      action: 'transform',
      transformType: 'semantic_replace',
      replacementKey: KIND_REPLACEMENT.lexicon_sensitive_term,
      ruleId: 'lexicon.room_term',
    };
  }

  const tier = audienceTier(opts.audience);
  const isExportContext =
    opts.contentType === 'sponsor_export' ||
    opts.contentType === 'ledger_record' ||
    opts.audience === 'sponsor_export' ||
    opts.audience === 'ledger_export';

  const strictInferential =
    opts.mode === 'export_ledger' || isExportContext || opts.messageRisk >= 70;

  // Trust/safety and legal: reveal path is explicit elsewhere — content still tagged.
  if (tier === 'admin' && hit.category === 'direct_identifier') {
    return {
      action: 'reveal_if_authorized',
      transformType: 'audience_token',
      replacementKey: '[AVAILABLE_IN_TRUST_LAYER]',
      ruleId: 'admin.direct.authorized_view',
    };
  }

  if (hit.category === 'direct_identifier' || hit.kind === 'direct_signature_block') {
    return {
      action: 'redact',
      transformType: 'hard_redact',
      replacementKey: KIND_REPLACEMENT[hit.kind] ?? '[REDACTED]',
      ruleId: 'strict.direct.always_redact',
    };
  }

  if (hit.kind === 'probable_person_name' && hit.confidence < 0.45) {
    if (tier === 'participant' && opts.mode === 'live_chat') {
      return {
        action: 'escalate_for_review',
        transformType: 'escalate_marker',
        replacementKey: '[AMBIGUOUS_NAME_REVIEW]',
        ruleId: 'participant.low_confidence_name.escalate',
      };
    }
    return {
      action: 'transform',
      transformType: 'semantic_replace',
      replacementKey: '[POSSIBLE_NAME_GENERALIZED]',
      ruleId: 'low_confidence_name.generalize',
    };
  }

  if (
    hit.category === 'contextual_inferential' ||
    hit.category === 'relationship' ||
    hit.category === 'media_metadata'
  ) {
    if (strictInferential || tier === 'participant' || tier === 'export') {
      return {
        action: 'transform',
        transformType: 'generalize',
        replacementKey: KIND_REPLACEMENT[hit.kind] ?? '[IDENTITY_CUE_REMOVED]',
        ruleId: 'inferential.generalize_or_remove',
      };
    }
    if (tier === 'facilitator') {
      return {
        action: 'transform',
        transformType: 'semantic_replace',
        replacementKey: KIND_REPLACEMENT[hit.kind] ?? '[FACILITATOR_MASKED_CUE]',
        ruleId: 'facilitator.inferential.soften',
      };
    }
  }

  if (hit.category === 'quasi_identifier') {
    if (tier === 'export' || strictInferential) {
      return {
        action: 'transform',
        transformType: 'generalize',
        replacementKey: KIND_REPLACEMENT[hit.kind] ?? '[QUASI_IDENTIFIER_REMOVED]',
        ruleId: 'export.quasi.generalize',
      };
    }
    if (tier === 'participant') {
      return {
        action: 'transform',
        transformType: 'semantic_replace',
        replacementKey: KIND_REPLACEMENT[hit.kind] ?? '[DETAIL_GENERALIZED]',
        ruleId: 'participant.quasi.transform',
      };
    }
  }

  return {
    action: 'preserve',
    transformType: 'preserve',
    replacementKey: '',
    ruleId: 'default.preserve',
  };
}
