/**
 * Implementation Status Registry — single source of truth for public claims.
 *
 * Rules:
 * - LIVE: shipped, exercised in product paths, independently recomputable or observable.
 * - SCAFFOLDED: schema / types / interfaces exist; not doing work at release time.
 * - PLANNED: product intent only — no runtime path.
 *
 * Marketing UI must import from here. Do not invent LIVE claims elsewhere.
 * @see docs/security/public-claims-audit.md
 * @see docs/security/threat-model.md §5
 */

export type ImplementationStatus = 'live' | 'scaffolded' | 'planned';

export type ImplementationClaimId =
  | 'sha256_anchor'
  | 'hash_bound_approvals'
  | 'facilitator_attestation'
  | 'metadata_audit_trail'
  | 'magic_link_auth'
  | 'role_scoped_invites'
  | 'manual_review_sla'
  | 'invite_only_access'
  | 'approved_outcomes_ledger'
  | 'room_app_layer_encryption'
  | 'rfc3161_timestamp'
  | 'operator_blind_e2e'
  | 'cloudflare_room_do'
  | 'ioa_alignment'
  | 'legal_privilege'
  | 'court_admissible_time'
  | 'full_platform_zk';

export type ImplementationClaim = {
  id: ImplementationClaimId;
  label: string;
  status: ImplementationStatus;
  /** Short body for status grids / badges. */
  summary: string;
  /** Optional Security page section id for deep links. */
  securityHref?: string;
  /** Spine stage this safeguard primarily backs (How it works). */
  spineStage?: 'configure' | 'verify' | 'facilitate' | 'release';
};

/**
 * Canonical claim list. Order is deliberate: live safeguards first, then scaffolded, then planned.
 * Honesty disclosures (not-claimed) stay separate via NOT_CLAIMED_IDS / Security copy.
 */
export const IMPLEMENTATION_CLAIMS: readonly ImplementationClaim[] = [
  {
    id: 'sha256_anchor',
    label: 'SHA-256 verification anchor on release',
    status: 'live',
    summary:
      'Release computes a hash of the canonical approved text and stores it with the record. Anyone holding the text can recompute it.',
    securityHref: '/security/technical#verification-anchor',
    spineStage: 'release',
  },
  {
    id: 'hash_bound_approvals',
    label: 'Approvals bound to the exact released text',
    status: 'live',
    summary:
      'Each approval carries the hash of the wording it was given for. Editing the instrument resets every approval and blocks release until parties review the new version.',
    securityHref: '/security#safeguards',
    spineStage: 'release',
  },
  {
    id: 'facilitator_attestation',
    label: 'Facilitator authorship attestation',
    status: 'live',
    summary:
      'Release requires a recorded attestation that the instrument is facilitator-authored, bound to the same hash and cleared automatically by any later edit.',
    securityHref: '/security#safeguards',
    spineStage: 'release',
  },
  {
    id: 'metadata_audit_trail',
    label: 'Metadata-only audit trail',
    status: 'live',
    summary:
      'Lifecycle events — verification, room open, phase timer/floor/recess, approvals, release, failed release attempts — are logged without message bodies.',
    securityHref: '/security#safeguards',
    spineStage: 'facilitate',
  },
  {
    id: 'magic_link_auth',
    label: 'Passwordless magic-link authentication',
    status: 'live',
    summary:
      'Invite-linked accounts sign in via one-time email links (Supabase Auth). No password store for pilot accounts.',
    securityHref: '/security/technical#diligence-faq',
    spineStage: 'configure',
  },
  {
    id: 'role_scoped_invites',
    label: 'Role-scoped invitation tokens',
    status: 'live',
    summary:
      'Participant and staff invites are bearer tokens scoped to room and role — not open signup.',
    securityHref: '/security#safeguards',
    spineStage: 'verify',
  },
  {
    id: 'manual_review_sla',
    label: 'Manual pilot intake review',
    status: 'live',
    summary:
      'Access requests are reviewed by a human. We aim to reply within about one week. There is no automated approval or self-serve status tracker.',
    securityHref: '/request-access',
    spineStage: 'configure',
  },
  {
    id: 'invite_only_access',
    label: 'Invite-only access',
    status: 'live',
    summary: 'No open deployment. Rooms and accounts are invitation-linked for pilot scopes.',
    securityHref: '/security#reviewers',
    spineStage: 'configure',
  },
  {
    id: 'approved_outcomes_ledger',
    label: 'Approved-outcomes-only release → ledger pipeline',
    status: 'live',
    summary:
      'The release pipeline that can publish only facilitator-approved outcome text is live. The public ledger stays empty of real entries until an organisation completes a release and opts into publication. Current ledger cards are labeled ILLUSTRATIVE SPECIMEN (NOT VERIFIABLE) — format demos, not live pilots.',
    securityHref: '/ledger',
    spineStage: 'release',
  },
  {
    id: 'room_app_layer_encryption',
    label: 'Application-layer room encryption',
    status: 'live',
    summary:
      'v2 session message bodies are AES-256-GCM ciphertext before storage. Keys are scoped to the facilitator and admitted participants (plus operators with database access). This is not operator-blind E2E.',
    securityHref: '/security#operator-access',
    spineStage: 'facilitate',
  },
  {
    id: 'rfc3161_timestamp',
    label: 'RFC 3161 trusted timestamping',
    status: 'scaffolded',
    summary:
      'Schema columns and typed interfaces exist; optional TSA client is gated by env. Release does not store a verified TimeStampToken in production until a live authority path is configured and verified. Until then, an anchor proves integrity, never time.',
    securityHref: '/security/technical#verification-anchor',
    spineStage: 'release',
  },
  {
    id: 'operator_blind_e2e',
    label: 'Operator-blind room encryption',
    status: 'planned',
    summary:
      'Rooms use application-layer encryption with operator-readable keys today. True operator-blind encryption needs per-participant key wrapping (ADR 005) — a separate programme, not a setting.',
    securityHref: '/security#operator-access',
    spineStage: 'facilitate',
  },
  {
    id: 'cloudflare_room_do',
    label: 'Cloudflare Durable Object room runtime',
    status: 'planned',
    summary:
      'Today rooms are Supabase-backed (Postgres + Realtime + RLS). A Durable Object as single-writer room gate/pacing/dialogue boundary is the target runtime in ADR 006 — not production today.',
    securityHref: '/security/technical#diligence-faq',
    spineStage: 'facilitate',
  },
  {
    id: 'ioa_alignment',
    label: 'IOA-aligned confidentiality architecture',
    status: 'live',
    summary:
      'Product architecture mirrors IOA confidentiality / independence / impartiality / informality as a professional benchmark. We are not an IOA-certified ombuds office.',
    securityHref: '/security/technical#confidentiality-precedent',
  },
  {
    id: 'legal_privilege',
    label: 'Legal privilege / court instrument',
    status: 'planned',
    summary:
      'Not claimed. Process infrastructure is not a legal instrument. Counsel decides privilege for your matter.',
    securityHref: '/security#reviewers',
  },
  {
    id: 'court_admissible_time',
    label: 'Court-admissible timestamps',
    status: 'planned',
    summary:
      'Not claimed. SHA-256 proves integrity of the released file. Do not treat anchors as court evidence of time without a live, verified RFC 3161 path.',
    securityHref: '/security/technical#verification-anchor',
  },
  {
    id: 'full_platform_zk',
    label: 'Full platform zero-knowledge',
    status: 'planned',
    summary:
      'Not claimed. Prefer the private room, facilitator release, and approved outcomes model. Legacy ZK paths are soft-retired.',
    securityHref: '/security#reviewers',
  },
] as const;

/** Claims shown on Security “Live vs planned” grid (positive trust features only). */
export const TRUST_FEATURE_CLAIM_IDS: ImplementationClaimId[] = [
  'sha256_anchor',
  'hash_bound_approvals',
  'facilitator_attestation',
  'metadata_audit_trail',
  'room_app_layer_encryption',
  'rfc3161_timestamp',
  'operator_blind_e2e',
];

/** Above-the-fold home trust strip — short evaluator labels (all backed by LIVE claims). */
export const HOME_TRUST_STRIP: readonly {
  label: string;
  claimId: ImplementationClaimId;
  href: string;
}[] = [
  { label: 'Invite-only', claimId: 'invite_only_access', href: '/security#reviewers' },
  { label: 'Sealed room', claimId: 'room_app_layer_encryption', href: '/security#operator-access' },
  { label: 'Documented limits', claimId: 'sha256_anchor', href: '/security#reviewers' },
  {
    label: 'Ledger mechanism',
    claimId: 'approved_outcomes_ledger',
    href: '/ledger',
  },
] as const;

/** Registry version for diligence packet stamping. */
export const IMPLEMENTATION_REGISTRY_VERSION = '2026.07.26';

export function getClaim(id: ImplementationClaimId): ImplementationClaim {
  const claim = IMPLEMENTATION_CLAIMS.find((c) => c.id === id);
  if (!claim) {
    throw new Error(`Unknown implementation claim: ${id}`);
  }
  return claim;
}

export function claimsByIds(ids: readonly ImplementationClaimId[]): ImplementationClaim[] {
  return ids.map((id) => getClaim(id));
}

export function claimsForSpineStage(
  stage: NonNullable<ImplementationClaim['spineStage']>,
): ImplementationClaim[] {
  return IMPLEMENTATION_CLAIMS.filter((c) => c.spineStage === stage);
}

export function isClaimLive(id: ImplementationClaimId): boolean {
  return getClaim(id).status === 'live';
}

/** Status badge label copy — keep identical across pages. */
export function statusBadgeLabel(status: ImplementationStatus): string {
  switch (status) {
    case 'live':
      return 'Live';
    case 'scaffolded':
      return 'Planned · scaffolded';
    case 'planned':
      return 'Planned · not started';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

/**
 * One-line key for first public appearance of ImplementationStatusBadge.
 * Uses the same vocabulary as `statusBadgeLabel` — do not invent alternate badge names.
 */
export const IMPLEMENTATION_STATUS_LEGEND =
  'Live = shipped and enforced today · Planned · scaffolded = interface exists, not production-live · Planned · not started = product intent only.';

/** Shorter key when only Live badges appear (e.g. Home trust strip). */
export const IMPLEMENTATION_STATUS_LEGEND_LIVE_FOCUS =
  'Live = shipped and enforced today. Scaffolded and planned items are labeled where they appear — never treated as Live.';

/**
 * Process-gate badges on How it works (`ProcessStep` OPEN / GATED / SEALED / RELEASED).
 * Distinct from Implementation Status Registry vocabulary.
 */
export const PROCESS_GATE_LEGEND =
  'Open = stage available · Gated = verification required before entry · Sealed = dialogue enclosed in the room · Released = approved record published (or private anchored memo).';
