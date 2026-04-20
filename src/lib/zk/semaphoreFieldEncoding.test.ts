import { describe, expect, it } from 'vitest';
import { semaphoreFieldFromLabel } from './semaphoreFieldEncoding';

describe('semaphoreFieldFromLabel', () => {
  it('returns a decimal string bigint for short labels', () => {
    const v = semaphoreFieldFromLabel('hello');
    expect(v).toMatch(/^\d+$/);
    expect(BigInt(v)).toBeGreaterThan(0n);
  });

  it('trims and caps length', () => {
    const long = 'a'.repeat(40);
    const v = semaphoreFieldFromLabel(`  ${long}  `);
    expect(v).toMatch(/^\d+$/);
  });

  /** Locks parity with ethers `toBigInt(encodeBytes32String(...))` (used before Edge bundle fix). */
  it('matches historical ethers output for hello', () => {
    expect(semaphoreFieldFromLabel('hello')).toBe(
      '47219736118171679016481614208494153725245902603978864281390662590579859259392',
    );
  });
});
