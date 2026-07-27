/**
 * v2 facilitated-room message encryption helpers.
 *
 * Bodies are AES-256-GCM v3 envelopes (same wire format as squad chat).
 * Keys live in `session_room_keys` — readable by the facilitator and admitted
 * participants, and by operators with DB/service-role access. This is
 * application-layer encryption, not operator-blind E2E.
 *
 * @see docs/security/threat-model.md §5
 */

import {
  decryptPlaintextAesGcm,
  encryptPlaintextAesGcm,
  importAes256GcmKeyFromBase64Url,
  isPayloadV3,
  type MessagePayloadV3,
} from './messageCrypto';

export type SessionMessageDecryptStatus =
  | 'plaintext_legacy'
  | 'decrypted'
  | 'ciphertext_unavailable'
  | 'decrypt_failed';

export type DecryptedSessionBody = {
  text: string;
  status: SessionMessageDecryptStatus;
};

/** Serialize a v3 payload for storage in `session_messages.body`. */
export function serializeSessionCiphertext(payload: MessagePayloadV3): string {
  return JSON.stringify(payload);
}

/** Parse a stored body into a v3 payload, or null if legacy plaintext / invalid. */
export function parseSessionCiphertext(body: string): MessagePayloadV3 | null {
  const trimmed = body.trim();
  if (!trimmed.startsWith('{')) return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return isPayloadV3(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function isSessionCiphertextBody(body: string): boolean {
  return parseSessionCiphertext(body) !== null;
}

export async function encryptSessionMessageBody(
  plaintext: string,
  keyBase64: string,
): Promise<string> {
  const key = await importAes256GcmKeyFromBase64Url(keyBase64);
  const payload = await encryptPlaintextAesGcm(plaintext, key);
  return serializeSessionCiphertext(payload);
}

export async function decryptSessionMessageBody(
  body: string,
  keyBase64: string | null | undefined,
): Promise<DecryptedSessionBody> {
  const payload = parseSessionCiphertext(body);
  if (!payload) {
    return { text: body, status: 'plaintext_legacy' };
  }
  if (!keyBase64) {
    return {
      text: 'Encrypted message — room key unavailable. Rejoin or refresh to decrypt.',
      status: 'ciphertext_unavailable',
    };
  }
  try {
    const key = await importAes256GcmKeyFromBase64Url(keyBase64);
    const text = await decryptPlaintextAesGcm(payload, key);
    return { text, status: 'decrypted' };
  } catch {
    return {
      text: 'Could not decrypt this message. The room key may have rotated or the payload is damaged.',
      status: 'decrypt_failed',
    };
  }
}

export async function decryptSessionMessageBodies<T extends { body: string; id: string }>(
  rows: T[],
  keyBase64: string | null | undefined,
): Promise<Array<T & { body: string; decryptStatus: SessionMessageDecryptStatus }>> {
  const out: Array<T & { body: string; decryptStatus: SessionMessageDecryptStatus }> = [];
  for (const row of rows) {
    const dec = await decryptSessionMessageBody(row.body, keyBase64);
    out.push({ ...row, body: dec.text, decryptStatus: dec.status });
  }
  return out;
}
