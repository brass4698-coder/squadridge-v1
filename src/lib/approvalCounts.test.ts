import { describe, expect, it } from 'vitest';
import {
  allApprovalsComplete,
  countApprovalsByStatus,
  formatApprovalCount,
} from './approvalCounts';

describe('approvalCounts', () => {
  it('counts statuses and formats tabular progress', () => {
    const counts = countApprovalsByStatus([
      { status: 'approved' },
      { status: 'pending' },
      { status: 'rejected' },
      { status: 'approved' },
    ]);
    expect(counts).toEqual({ approved: 2, rejected: 1, pending: 1, total: 4 });
    expect(formatApprovalCount(counts.approved, counts.total)).toBe('2 / 4');
  });

  it('treats empty list as incomplete', () => {
    expect(allApprovalsComplete([])).toBe(false);
    expect(formatApprovalCount(0, 0)).toBe('0 / 0');
  });

  it('requires every approval to be approved', () => {
    expect(allApprovalsComplete([{ status: 'approved' }, { status: 'approved' }])).toBe(true);
    expect(allApprovalsComplete([{ status: 'approved' }, { status: 'pending' }])).toBe(false);
  });

  it('floors non-finite values in formatApprovalCount', () => {
    expect(formatApprovalCount(Number.NaN, 3)).toBe('0 / 3');
    expect(formatApprovalCount(1.9, 2.1)).toBe('1 / 2');
  });
});
