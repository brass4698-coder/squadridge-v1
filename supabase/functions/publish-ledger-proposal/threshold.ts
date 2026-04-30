/**
 * Vote-threshold logic for `publish-ledger-proposal`.
 *
 * Lives in its own module (no Deno or HTTP imports) so it can be unit-tested
 * with Vitest under `supabase/functions/publish-ledger-proposal/threshold.test.ts`.
 *
 * Threshold (v1):
 *   - Participation: at least 2/3 of `total_eligible` squad members have cast
 *     any vote (`approve | reject | abstain`).
 *   - Approval: of the votes cast, more than 50% are `approve`.
 *
 * Pilots that need a stricter rule (unanimity, supermajority, facilitator
 * veto) should layer it on top of this baseline rather than loosen it.
 */

export const PARTICIPATION_NUMERATOR = 2;
export const PARTICIPATION_DENOMINATOR = 3;

export interface VoteSummary {
  proposal_id: string;
  squad_id: string | null;
  status: 'draft' | 'published' | 'archived';
  approve_count: number;
  reject_count: number;
  abstain_count: number;
  total_eligible: number;
}

export type ThresholdErrorCode = 'insufficient_participation' | 'majority_not_approve';

export interface ThresholdResult {
  ok: boolean;
  error_code?: ThresholdErrorCode;
}

/**
 * Pure function: returns whether the given vote summary meets the publish
 * threshold. Inputs validated per documented invariants; the caller (Edge
 * function) is responsible for fetching `summary` from
 * `ledger_proposal_vote_summary`.
 */
export function meetsThreshold(summary: VoteSummary): ThresholdResult {
  const cast = summary.approve_count + summary.reject_count + summary.abstain_count;
  const eligible = summary.total_eligible;
  if (eligible <= 0) return { ok: false, error_code: 'insufficient_participation' };
  if (cast * PARTICIPATION_DENOMINATOR < eligible * PARTICIPATION_NUMERATOR) {
    return { ok: false, error_code: 'insufficient_participation' };
  }
  if (summary.approve_count * 2 <= cast) {
    return { ok: false, error_code: 'majority_not_approve' };
  }
  return { ok: true };
}
