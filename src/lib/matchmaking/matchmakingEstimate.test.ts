import { describe, expect, it } from 'vitest';
import { formatMatchWaitHint, matchPoolDeficit } from './matchmakingEstimate';

describe('matchPoolDeficit', () => {
  it('returns zeros when both sides meet minimum', () => {
    expect(matchPoolDeficit(2, 2, 2)).toEqual({ needA: 0, needB: 0 });
  });

  it('returns shortfalls per side', () => {
    expect(matchPoolDeficit(1, 2, 2)).toEqual({ needA: 1, needB: 0 });
    expect(matchPoolDeficit(0, 0, 2)).toEqual({ needA: 2, needB: 2 });
  });
});

describe('formatMatchWaitHint', () => {
  it('mentions position and bottlenecks', () => {
    const s = formatMatchWaitHint(1, 2, 3, 2);
    expect(s).toContain('position');
    expect(s).toContain('3');
  });
});
