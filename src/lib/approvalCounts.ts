/** Tabular approval progress for the release gate. */

export type ApprovalStatusLike = 'pending' | 'approved' | 'rejected' | string;

export function countApprovalsByStatus(approvals: ReadonlyArray<{ status: ApprovalStatusLike }>): {
  approved: number;
  rejected: number;
  pending: number;
  total: number;
} {
  let approved = 0;
  let rejected = 0;
  let pending = 0;
  for (const a of approvals) {
    if (a.status === 'approved') approved += 1;
    else if (a.status === 'rejected') rejected += 1;
    else pending += 1;
  }
  return { approved, rejected, pending, total: approvals.length };
}

/** Compact "N / M" string for `.sr-approval-count` display. */
export function formatApprovalCount(approved: number, total: number): string {
  const safeApproved = Number.isFinite(approved) ? Math.max(0, Math.floor(approved)) : 0;
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  return `${safeApproved} / ${safeTotal}`;
}

export function allApprovalsComplete(
  approvals: ReadonlyArray<{ status: ApprovalStatusLike }>,
): boolean {
  const { approved, total } = countApprovalsByStatus(approvals);
  return total > 0 && approved === total;
}
