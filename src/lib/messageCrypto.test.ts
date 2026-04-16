import { describe, expect, it } from 'vitest';
import {
  bytesToBase64Url,
  decryptPlaintextAesGcm,
  encryptPlaintextAesGcm,
  generateSquadMessageKeyBase64Url,
  importAes256GcmKeyFromBase64Url,
  isPayloadV3,
  type MessagePayloadV3,
} from './messageCrypto';

async function makeKey(): Promise<{ raw: string; key: CryptoKey }> {
  const raw = generateSquadMessageKeyBase64Url();
  const key = await importAes256GcmKeyFromBase64Url(raw);
  return { raw, key };
}

describe('messageCrypto', () => {
  it('generateSquadMessageKeyBase64Url returns a non-empty base64url string', () => {
    const k = generateSquadMessageKeyBase64Url();
    expect(typeof k).toBe('string');
    expect(k.length).toBeGreaterThan(0);
    // base64url must not contain + / =
    expect(k).not.toMatch(/[+/=]/);
  });

  it('importAes256GcmKeyFromBase64Url succeeds for a valid 32-byte key', async () => {
    const { key } = await makeKey();
    expect(key).toBeDefined();
    expect(key.type).toBe('secret');
    expect(key.algorithm.name).toBe('AES-GCM');
  });

  it('importAes256GcmKeyFromBase64Url rejects keys that are not 32 bytes', async () => {
    const shortKey = bytesToBase64Url(new Uint8Array(16));
    await expect(importAes256GcmKeyFromBase64Url(shortKey)).rejects.toThrow(
      'Invalid squad encryption key length',
    );
  });

  it('round-trips a plaintext string through encrypt → decrypt', async () => {
    const { key } = await makeKey();
    const plain = 'Hello, verified anonymous dialogue.';
    const payload = await encryptPlaintextAesGcm(plain, key);
    const result = await decryptPlaintextAesGcm(payload, key);
    expect(result).toBe(plain);
  });

  it('encryptPlaintextAesGcm produces unique IVs across calls', async () => {
    const { key } = await makeKey();
    const [a, b] = await Promise.all([
      encryptPlaintextAesGcm('same text', key),
      encryptPlaintextAesGcm('same text', key),
    ]);
    expect(a.iv).not.toBe(b.iv);
  });

  it('decryptPlaintextAesGcm rejects ciphertext encrypted with a different key', async () => {
    const { key: key1 } = await makeKey();
    const { key: key2 } = await makeKey();
    const payload = await encryptPlaintextAesGcm('secret', key1);
    await expect(decryptPlaintextAesGcm(payload, key2)).rejects.toThrow();
  });

  it('encryptPlaintextAesGcm output satisfies isPayloadV3', async () => {
    const { key } = await makeKey();
    const payload = await encryptPlaintextAesGcm('test', key);
    expect(isPayloadV3(payload)).toBe(true);
    expect(payload.v).toBe(3);
    expect(payload.alg).toBe('AES-256-GCM');
  });

  describe('isPayloadV3', () => {
    it('returns true for a valid v3 payload shape', () => {
      const ok: MessagePayloadV3 = { v: 3, alg: 'AES-256-GCM', iv: 'aaaaaa', ct: 'bbbbbb' };
      expect(isPayloadV3(ok)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isPayloadV3(null)).toBe(false);
    });

    it('returns false for v1 payload', () => {
      expect(isPayloadV3({ v: 1, body: 'hi' })).toBe(false);
    });

    it('returns false when iv is missing', () => {
      expect(isPayloadV3({ v: 3, alg: 'AES-256-GCM', ct: 'abc' })).toBe(false);
    });

    it('returns false when ct is not a string', () => {
      expect(isPayloadV3({ v: 3, alg: 'AES-256-GCM', iv: 'aaa', ct: 42 })).toBe(false);
    });
  });
});
