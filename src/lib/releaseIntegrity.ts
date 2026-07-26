/**
 * Release-provenance helpers for the facilitator release console.
 *
 * The database binds every approval and the facilitator authorship attestation to a
 * SHA-256 hash of the exact instrument text (`outcome_anchor_payload_v1`). Revising the
 * text resets approvals and clears the attestation, so what gets anchored is always what
 * the parties reviewed. These helpers describe that state; they never compute or assert
 * integrity client-side.
 *
 * @see supabase/migrations/20260725220000_outcome_release_provenance_binding.sql
 */

export type ReleaseBlockReason =
  | 'SESSION_NOT_ENDED'
  | 'SUMMARY_REQUIRED'
  | 'APPROVALS_REQUIRED'
  | 'APPROVALS_PENDING'
  | 'VERBATIM_ROOM_CONTENT'
  | 'AUTHORSHIP_ATTESTATION_REQUIRED'
  | 'ATTESTATION_STALE'
  | 'CONTENT_CHANGED_AFTER_APPROVAL';

export interface ReleaseReadiness {
  ok: boolean;
  error?: string;
  outcomeId?: string;
  contentSha?: string;
  outcomeStatus?: string;
  sessionStatus?: string;
  outcomePublic?: boolean;
  authorshipAttested: boolean;
  authorshipAttestedAt?: string | null;
  authorshipStatement?: string | null;
  approvalsTotal: number;
  approvalsApproved: number;
  approvalsRejected: number;
  approvalsStale: number;
  verbatimConflict: boolean;
  canRelease: boolean;
  blockingReason: ReleaseBlockReason | null;
}

const BLOCK_COPY: Record<ReleaseBlockReason, string> = {
  SESSION_NOT_ENDED: 'End the session before releasing the outcome.',
  SUMMARY_REQUIRED: 'Add a decision memo summary before release.',
  APPROVALS_REQUIRED: 'Submit the draft for review so approvals can be recorded.',
  APPROVALS_PENDING: 'All parties must approve this exact text via their review links.',
  VERBATIM_ROOM_CONTENT:
    'Outcome text repeats room dialogue verbatim. Rewrite it in facilitator-authored language.',
  AUTHORSHIP_ATTESTATION_REQUIRED:
    'Record the authorship attestation for this instrument before release.',
  ATTESTATION_STALE:
    'The instrument changed after the attestation. Re-attest the current text before release.',
  CONTENT_CHANGED_AFTER_APPROVAL:
    'At least one approval was given against different text. Collect approval on the current version.',
};

const BLOCK_REASONS = Object.keys(BLOCK_COPY) as ReleaseBlockReason[];

export function parseReleaseBlockReason(value: unknown): ReleaseBlockReason | null {
  return BLOCK_REASONS.find((reason) => reason === value) ?? null;
}

/** Facilitator-facing explanation for a blocked release. */
export function describeReleaseBlock(reason: ReleaseBlockReason | null | undefined): string | null {
  if (!reason) return null;
  return BLOCK_COPY[reason] ?? null;
}

/** Message for a `release_outcome` RPC failure, falling back to the raw code. */
export function releaseErrorMessage(code: string | undefined): string {
  const reason = parseReleaseBlockReason(code);
  return describeReleaseBlock(reason) ?? code ?? 'Release failed';
}

/** `7c3a91d7…5678ef90` — enough to compare by eye without implying a full anchor. */
export function shortContentSha(sha: string | null | undefined, size = 8): string {
  if (!sha) return '—';
  const clean = sha.trim();
  if (clean.length <= size * 2 + 1) return clean;
  return `${clean.slice(0, size)}…${clean.slice(-size)}`;
}

/**
 * Approvals that were recorded against a different version of the text. Surfaced so a
 * facilitator sees drift as a workflow state, not as a silent release failure.
 */
export function staleApprovalNotice(readiness: ReleaseReadiness | null): string | null {
  if (!readiness || readiness.approvalsStale <= 0) return null;
  const count = readiness.approvalsStale;
  return `${count} approval${count === 1 ? '' : 's'} recorded against earlier text — re-collect before release.`;
}

export type ReleaseChecklistState = 'ready' | 'blocked' | 'waiting';

export interface ReleaseChecklistItem {
  id: string;
  label: string;
  detail: string;
  state: ReleaseChecklistState;
}

/**
 * Preflight checklist derived from `facilitator_get_release_readiness`.
 * Shows what still blocks release as workflow states — not a single mystery error.
 */
export function buildReleaseReadinessChecklist(
  readiness: ReleaseReadiness | null,
): ReleaseChecklistItem[] {
  if (!readiness) {
    return [
      {
        id: 'load',
        label: 'Release readiness',
        detail: 'Could not load readiness from the server. Refresh and try again.',
        state: 'blocked',
      },
    ];
  }

  const sessionEnded =
    readiness.sessionStatus === 'ended' || readiness.sessionStatus === 'released';
  const approvalsBound =
    readiness.approvalsTotal > 0 &&
    readiness.approvalsRejected === 0 &&
    readiness.approvalsApproved - readiness.approvalsStale >= readiness.approvalsTotal &&
    readiness.approvalsStale === 0;
  const approvalsWaiting =
    readiness.approvalsTotal > 0 &&
    !approvalsBound &&
    readiness.approvalsRejected === 0 &&
    readiness.blockingReason !== 'CONTENT_CHANGED_AFTER_APPROVAL';

  return [
    {
      id: 'session',
      label: 'Session ended',
      detail: sessionEnded
        ? 'Session is closed — room dialogue stays in the room.'
        : 'End the session before releasing the outcome.',
      state: sessionEnded ? 'ready' : 'blocked',
    },
    {
      id: 'summary',
      label: 'Decision memo',
      detail:
        readiness.blockingReason === 'SUMMARY_REQUIRED'
          ? 'Add a decision memo summary before release.'
          : 'Summary is present on the instrument.',
      state: readiness.blockingReason === 'SUMMARY_REQUIRED' ? 'blocked' : 'ready',
    },
    {
      id: 'approvals',
      label: 'Party approvals',
      detail:
        readiness.approvalsTotal === 0
          ? 'Submit the draft for review so approvals can be recorded.'
          : readiness.approvalsRejected > 0
            ? `${readiness.approvalsRejected} dispute${readiness.approvalsRejected === 1 ? '' : 's'} recorded — resolve before release.`
            : readiness.approvalsStale > 0
              ? (staleApprovalNotice(readiness) ??
                'Re-collect approvals on the current instrument text.')
              : approvalsBound
                ? `All ${readiness.approvalsTotal} parties approved this exact text.`
                : `Waiting on review — ${readiness.approvalsApproved - readiness.approvalsStale} of ${readiness.approvalsTotal} bound approvals.`,
      state:
        readiness.approvalsTotal === 0 ||
        readiness.approvalsRejected > 0 ||
        readiness.approvalsStale > 0 ||
        readiness.blockingReason === 'CONTENT_CHANGED_AFTER_APPROVAL'
          ? 'blocked'
          : approvalsBound
            ? 'ready'
            : approvalsWaiting
              ? 'waiting'
              : 'blocked',
    },
    {
      id: 'verbatim',
      label: 'Verbatim guard',
      detail: readiness.verbatimConflict
        ? 'Outcome text repeats room dialogue verbatim. Rewrite in facilitator-authored language.'
        : 'No verbatim room-content conflict detected.',
      state: readiness.verbatimConflict ? 'blocked' : 'ready',
    },
    {
      id: 'attestation',
      label: 'Authorship attestation',
      detail:
        readiness.blockingReason === 'ATTESTATION_STALE'
          ? 'The instrument changed after attestation. Re-attest the current text.'
          : readiness.authorshipAttested
            ? 'Attestation is bound to the current instrument hash.'
            : 'Record authorship attestation for this exact text before release.',
      state:
        readiness.blockingReason === 'ATTESTATION_STALE'
          ? 'blocked'
          : readiness.authorshipAttested
            ? 'ready'
            : 'blocked',
    },
  ];
}

/** Human label for approval row status on the release console. */
export function approvalWorkflowLabel(
  status: 'pending' | 'approved' | 'rejected' | string,
): string {
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Disputed';
  return 'Pending review';
}
