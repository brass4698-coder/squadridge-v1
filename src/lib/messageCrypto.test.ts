import { describe, expect, it } from 'vitest';
import {
  decryptPlaintextAesGcm,
  encryptPlaintextAesGcm,
  generateSquadMessageKeyBase64Url,
  importAes256GcmKeyFromBase64Url,
  isPayloadV3,
} from './messageCrypto';

describe('messageCrypto', () => {
  it('roundtrips plaintext with AES-GCM v3', async () => {
    const keyB64 = generateSquadMessageKeyBase64Url();
    const key = await importAes256GcmKeyFromBase64Url(keyB64);
    const enc = await encryptPlaintextAesGcm('hello squad', key);
    expect(isPayloadV3(enc)).toBe(true);
    const plain = await decryptPlaintextAesGcm(enc, key);
    expect(plain).toBe('hello squad');
  });

  it('rejects wrong key length', async () => {
    await expect(importAes256GcmKeyFromBase64Url('aaa')).rejects.toThrow(/length/);
  });
});
