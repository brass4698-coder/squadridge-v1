import { describe, expect, it } from 'vitest';
import {
  clampTtlSeconds,
  DeckShareTokenInvalid,
  MAX_TTL_SECONDS,
  signDeckShareToken,
  verifyDeckShareToken,
} from './deckShareToken';

const TEST_SECRET = 'test-secret-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-padding';

async function mintToken(overrides: Partial<Parameters<typeof signDeckShareToken>[0]> = {}) {
  return signDeckShareToken({
    deckId: 'core-investor',
    audience: 'share',
    ttlSeconds: 60,
    mintedBy: '00000000-0000-0000-0000-000000000001',
    secret: TEST_SECRET,
    ...overrides,
  });
}

describe('deckShareToken', () => {
  it('round-trips signed tokens', async () => {
    const { token, claims } = await mintToken();
    const verified = await verifyDeckShareToken(token, { secret: TEST_SECRET });
    expect(verified.deckId).toBe('core-investor');
    expect(verified.aud).toBe('share');
    expect(verified.jti).toBe(claims.jti);
    expect(verified.exp).toBe(claims.exp);
  });

  it('rejects malformed tokens', async () => {
    await expect(
      verifyDeckShareToken('not.a.jwt.x', { secret: TEST_SECRET }),
    ).rejects.toBeInstanceOf(DeckShareTokenInvalid);
    await expect(
      verifyDeckShareToken('not-a-token', { secret: TEST_SECRET }),
    ).rejects.toBeInstanceOf(DeckShareTokenInvalid);
  });

  it('rejects when signature does not match the secret', async () => {
    const { token } = await mintToken();
    await expect(
      verifyDeckShareToken(token, { secret: 'different-secret-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }),
    ).rejects.toMatchObject({ code: 'BAD_SIGNATURE' });
  });

  it('rejects when claims are tampered with', async () => {
    const { token } = await mintToken({ deckId: 'core-investor' });
    const [headerB64, _payloadB64, sigB64] = token.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({
        deckId: 'financial-appendix',
        aud: 'share',
        exp: Math.floor(Date.now() / 1000) + 60,
        iat: Math.floor(Date.now() / 1000),
        jti: 'forged',
        mintedBy: '00000000-0000-0000-0000-000000000002',
      }),
      'utf8',
    )
      .toString('base64')
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const tampered = `${headerB64}.${tamperedPayload}.${sigB64}`;
    await expect(verifyDeckShareToken(tampered, { secret: TEST_SECRET })).rejects.toMatchObject({
      code: 'BAD_SIGNATURE',
    });
  });

  it('rejects expired tokens', async () => {
    const { token } = await mintToken({ ttlSeconds: -10 });
    await expect(verifyDeckShareToken(token, { secret: TEST_SECRET })).rejects.toMatchObject({
      code: 'EXPIRED',
    });
  });

  it('binds tokens to a specific deckId when expectedDeckId is set', async () => {
    const { token } = await mintToken({ deckId: 'core-investor' });
    await expect(
      verifyDeckShareToken(token, {
        secret: TEST_SECRET,
        expectedDeckId: 'financial-appendix',
      }),
    ).rejects.toMatchObject({ code: 'DECK_MISMATCH' });
    await expect(
      verifyDeckShareToken(token, { secret: TEST_SECRET, expectedDeckId: 'core-investor' }),
    ).resolves.toMatchObject({ deckId: 'core-investor' });
  });

  it('rejects audiences not in the accepted list', async () => {
    const { token } = await mintToken({ audience: 'self', ttlSeconds: 30 });
    await expect(
      verifyDeckShareToken(token, { secret: TEST_SECRET, acceptedAudiences: ['share'] }),
    ).rejects.toMatchObject({ code: 'AUDIENCE_MISMATCH' });
  });

  it('clamps TTL to per-audience maximums', () => {
    expect(clampTtlSeconds('self', 999_999)).toBe(MAX_TTL_SECONDS.self);
    expect(clampTtlSeconds('share', 999_999_999)).toBe(MAX_TTL_SECONDS.share);
    expect(clampTtlSeconds('share', 60)).toBe(60);
    expect(clampTtlSeconds('self', undefined)).toBeGreaterThan(0);
    expect(clampTtlSeconds('self', -1)).toBeGreaterThan(0);
  });
});
