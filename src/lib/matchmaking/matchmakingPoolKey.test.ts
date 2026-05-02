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

  it('appends verified ZK scope when provided', () => {
    expect(poolKeyFromIntentTags(['a'], 'north-region')).toBe('tag:a|zk:north-region');
  });

  it('keeps total length within 128 when ZK scope is long', () => {
    const zk = 'x'.repeat(100);
    const key = poolKeyFromIntentTags(['a', 'b', 'c'], zk);
    expect(key.length).toBeLessThanOrEqual(128);
    expect(key).toContain('|zk:');
  });
});
