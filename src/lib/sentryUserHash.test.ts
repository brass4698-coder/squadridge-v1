import { describe, expect, it } from 'vitest';
import { SENTRY_USER_HASH_PATTERN, hashUserIdForSentry, isSentryUserHash } from './sentryUserHash';

describe('sentryUserHash', () => {
  it('returns 16 lowercase hex chars matching the public regex', async () => {
    const out = await hashUserIdForSentry('11111111-1111-1111-1111-111111111111', 'salt-a');
    expect(out).toHaveLength(16);
    expect(SENTRY_USER_HASH_PATTERN.test(out)).toBe(true);
  });

  it('is deterministic for the same (userId, salt) pair', async () => {
    const a = await hashUserIdForSentry('user-1', 'salt-a');
    const b = await hashUserIdForSentry('user-1', 'salt-a');
    expect(a).toBe(b);
  });

  it('produces a different hash when the salt changes', async () => {
    const a = await hashUserIdForSentry('user-1', 'salt-a');
    const b = await hashUserIdForSentry('user-1', 'salt-b');
    expect(a).not.toBe(b);
  });

  it('produces a different hash when the userId changes', async () => {
    const a = await hashUserIdForSentry('user-1', 'salt-a');
    const b = await hashUserIdForSentry('user-2', 'salt-a');
    expect(a).not.toBe(b);
  });

  it('does not embed the raw userId substring in the output', async () => {
    const userId = 'deadbeef-cafe-1234-5678-9abcdef01234';
    const out = await hashUserIdForSentry(userId, 'salt-a');
    expect(out.includes('deadbeef')).toBe(false);
  });

  it('isSentryUserHash recognises valid forms and rejects invalid ones', () => {
    expect(isSentryUserHash('0123456789abcdef')).toBe(true);
    expect(isSentryUserHash('0123456789ABCDEF')).toBe(false);
    expect(isSentryUserHash('short')).toBe(false);
    expect(isSentryUserHash('11111111-1111-1111-1111-111111111111')).toBe(false);
    expect(isSentryUserHash(null)).toBe(false);
    expect(isSentryUserHash(undefined)).toBe(false);
    expect(isSentryUserHash(123)).toBe(false);
  });
});
