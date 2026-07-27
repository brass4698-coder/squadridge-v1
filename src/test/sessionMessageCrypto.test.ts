import { describe, expect, it } from 'vitest';
import { generateSquadMessageKeyBase64Url } from '../lib/messageCrypto';
import {
  decryptSessionMessageBody,
  encryptSessionMessageBody,
  isSessionCiphertextBody,
  parseSessionCiphertext,
} from '../lib/sessionMessageCrypto';

describe('sessionMessageCrypto', () => {
  it('encrypts and decrypts a room message', async () => {
    const key = generateSquadMessageKeyBase64Url();
    const wire = await encryptSessionMessageBody('private deliberation note', key);
    expect(isSessionCiphertextBody(wire)).toBe(true);
    expect(parseSessionCiphertext(wire)?.v).toBe(3);
    const dec = await decryptSessionMessageBody(wire, key);
    expect(dec.status).toBe('decrypted');
    expect(dec.text).toBe('private deliberation note');
  });

  it('treats legacy plaintext as readable without a key', async () => {
    const dec = await decryptSessionMessageBody('legacy open text', null);
    expect(dec.status).toBe('plaintext_legacy');
    expect(dec.text).toBe('legacy open text');
  });

  it('surfaces ciphertext_unavailable when key is missing', async () => {
    const key = generateSquadMessageKeyBase64Url();
    const wire = await encryptSessionMessageBody('secret', key);
    const dec = await decryptSessionMessageBody(wire, null);
    expect(dec.status).toBe('ciphertext_unavailable');
    expect(dec.text).toMatch(/key unavailable/i);
  });

  it('surfaces decrypt_failed for wrong key', async () => {
    const keyA = generateSquadMessageKeyBase64Url();
    const keyB = generateSquadMessageKeyBase64Url();
    const wire = await encryptSessionMessageBody('secret', keyA);
    const dec = await decryptSessionMessageBody(wire, keyB);
    expect(dec.status).toBe('decrypt_failed');
  });
});
