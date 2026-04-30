import { describe, expect, it } from 'vitest';
import { meetsThreshold, type VoteSummary } from './threshold';

function summary(over: Partial<VoteSummary>): VoteSummary {
  return {
    proposal_id: '00000000-0000-0000-0000-000000000001',
    squad_id: '00000000-0000-0000-0000-000000000002',
    status: 'draft',
    approve_count: 0,
    reject_count: 0,
    abstain_count: 0,
    total_eligible: 6,
    ...over,
  };
}

describe('meetsThreshold', () => {
  it('rejects an empty squad', () => {
    expect(meetsThreshold(summary({ total_eligible: 0 }))).toEqual({
      ok: false,
      error_code: 'insufficient_participation',
    });
  });

  it('rejects when fewer than 2/3 of eligible members have voted', () => {
    // 6 eligible, 3 cast votes → 3/6 = 50% < 67%.
    expect(meetsThreshold(summary({ approve_count: 3, total_eligible: 6 }))).toEqual({
      ok: false,
      error_code: 'insufficient_participation',
    });
  });

  it('rejects when participation is enough but approvals are not a majority', () => {
    // 6 eligible, 4 cast (66.6%? no — 4*3=12 ≥ 6*2=12 yes), but approvals 2 of 4 → not >50%.
    expect(
      meetsThreshold(summary({ approve_count: 2, reject_count: 2, total_eligible: 6 })),
    ).toEqual({ ok: false, error_code: 'majority_not_approve' });
  });

  it('accepts a clean 4-of-6 approve case', () => {
    expect(
      meetsThreshold(
        summary({ approve_count: 4, reject_count: 0, abstain_count: 0, total_eligible: 6 }),
      ),
    ).toEqual({ ok: true });
  });

  it('accepts when participation hits exactly 2/3 and approvals strictly exceed half of cast', () => {
    // 3 eligible, 2 cast (2*3=6 ≥ 3*2=6), 2 approve / 0 reject → ok
    expect(
      meetsThreshold(
        summary({ approve_count: 2, reject_count: 0, abstain_count: 0, total_eligible: 3 }),
      ),
    ).toEqual({ ok: true });
  });

  it('treats abstentions as cast but not approving', () => {
    // 6 eligible, 6 cast (3 approve / 3 abstain) → 3*2 = 6 = cast → not strict majority.
    expect(
      meetsThreshold(
        summary({ approve_count: 3, reject_count: 0, abstain_count: 3, total_eligible: 6 }),
      ),
    ).toEqual({ ok: false, error_code: 'majority_not_approve' });
  });

  it('approves when approvals strictly exceed half including abstentions', () => {
    // 6 eligible, 6 cast (4 approve / 2 abstain) → 4*2 = 8 > 6.
    expect(
      meetsThreshold(
        summary({ approve_count: 4, reject_count: 0, abstain_count: 2, total_eligible: 6 }),
      ),
    ).toEqual({ ok: true });
  });
});
