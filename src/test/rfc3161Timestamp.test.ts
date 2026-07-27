import { describe, expect, it, vi } from 'vitest';
import {
  getConfiguredTsaUrl,
  isRfc3161ClientConfigured,
  mergeTimestampAnchor,
  requestRfc3161Timestamp,
} from '../lib/rfc3161Timestamp';

describe('RFC 3161 client scaffold', () => {
  it('is not configured without VITE_RFC3161_TSA_URL', () => {
    expect(getConfiguredTsaUrl()).toBeNull();
    expect(isRfc3161ClientConfigured()).toBe(false);
  });

  it('refuses to invent a token when TSA is unset', async () => {
    const result = await requestRfc3161Timestamp(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not_configured');
  });

  it('mergeTimestampAnchor keeps empty anchor on failure', () => {
    const sha = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const merged = mergeTimestampAnchor(sha, {
      ok: false,
      reason: 'not_configured',
      message: 'unset',
    });
    expect(merged.timestampToken).toBeNull();
    expect(merged.status).toBe('none');
    expect(merged.ledgerSha).toBe(sha);
  });

  it('rejects invalid hash', async () => {
    const result = await requestRfc3161Timestamp('not-a-hash', vi.fn() as unknown as typeof fetch);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid_hash');
  });
});
