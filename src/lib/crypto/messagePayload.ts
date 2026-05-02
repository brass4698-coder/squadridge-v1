import {
  decryptPlaintextAesGcm,
  encryptPlaintextAesGcm,
  isPayloadV3,
  type MessagePayloadV3,
} from './messageCrypto';

/**
 * Legacy JSON payload stored in `messages.payload_ciphertext` (pre–AES-256 rollout).
 */
export interface MessagePayloadV1 {
  v: 1;
  body: string;
}

/** @deprecated Prefer {@link encodeSecureMessagePayload} for new messages. */
export function encodeMessagePayload(body: string): string {
  const payload: MessagePayloadV1 = { v: 1, body };
  return JSON.stringify(payload);
}

export function decodeMessagePayload(encryptedContent: string): string {
  try {
    const parsed: unknown = JSON.parse(encryptedContent);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'v' in parsed &&
      (parsed as MessagePayloadV1).v === 1 &&
      'body' in parsed &&
      typeof (parsed as MessagePayloadV1).body === 'string'
    ) {
      return (parsed as MessagePayloadV1).body;
    }
  } catch {
    // fall through
  }
  return encryptedContent;
}

export async function encodeSecureMessagePayload(body: string, key: CryptoKey): Promise<string> {
  const enc: MessagePayloadV3 = await encryptPlaintextAesGcm(body, key);
  return JSON.stringify(enc);
}

/**
 * Decrypts v1 JSON, v3 AES-GCM, or returns raw string when key is missing for v3.
 */
export async function decodeMessagePayloadAdaptive(
  encryptedContent: string,
  key: CryptoKey | null,
): Promise<string> {
  try {
    const parsed: unknown = JSON.parse(encryptedContent);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'v' in parsed &&
      (parsed as MessagePayloadV1).v === 1 &&
      'body' in parsed &&
      typeof (parsed as MessagePayloadV1).body === 'string'
    ) {
      return (parsed as MessagePayloadV1).body;
    }
    if (isPayloadV3(parsed)) {
      if (!key) {
        return '[Encrypted message — key unavailable]';
      }
      return decryptPlaintextAesGcm(parsed, key);
    }
  } catch {
    // fall through
  }
  return encryptedContent;
}
