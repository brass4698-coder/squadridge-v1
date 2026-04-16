import { describe, expect, it } from 'vitest';
import { poolKeyFromIntentTags } from './matchmakingPoolKey';

describe('poolKeyFromIntentTags', () => {
  it('uses default when no tags', () => {
    expect(poolKeyFromIntentTags([])).toBe('default');
  });

  it('sorts tags for stable pool keys', () => {
    expect(poolKeyFromIntentTags(['b', 'a'])).toBe('tag:a|b');
  });

  it('truncates long keys', () => {
    const long = Array.from({ length: 40 }, (_, i) => `t${i}`);
    expect(poolKeyFromIntentTags(long).length).toBeLessThanOrEqual(128);
  });
});
