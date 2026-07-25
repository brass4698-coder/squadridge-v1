import { describe, expect, it } from 'vitest';
import {
  emptyTimestampAnchor,
  hasLiveTimestampToken,
  TIMESTAMPING_CLAIM,
} from '../lib/timestampAnchor';

describe('timestampAnchor', () => {
  it('starts with no live TSA token (honest scaffold)', () => {
    const anchor = emptyTimestampAnchor('abc123');
    expect(anchor.status).toBe('none');
    expect(anchor.timestampToken).toBeNull();
    expect(hasLiveTimestampToken(anchor)).toBe(false);
  });

  it('only reports a live token when status and payload are set', () => {
    expect(
      hasLiveTimestampToken({
        ledgerSha: 'abc',
        timestampToken: 'tok',
        timestampAuthority: 'https://tsa.example',
        timestampedAt: '2026-07-25T00:00:00Z',
        status: 'stored',
      }),
    ).toBe(true);
    expect(
      hasLiveTimestampToken({
        ledgerSha: 'abc',
        timestampToken: 'tok',
        timestampAuthority: null,
        timestampedAt: null,
        status: 'pending',
      }),
    ).toBe(false);
  });

  it('keeps shipped vs planned claims distinct', () => {
    expect(TIMESTAMPING_CLAIM.shipped).toContain('SHA-256');
    expect(TIMESTAMPING_CLAIM.planned).toContain('RFC 3161');
    expect(TIMESTAMPING_CLAIM.notClaimed).toContain('Court-admissible');
  });
});
