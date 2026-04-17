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
});
