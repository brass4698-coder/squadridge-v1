/**
 * Client-side payload format stored in `messages.encrypted_content`.
 * Production should use real E2E encryption; this encodes structured text for MVP.
 */
export interface MessagePayloadV1 {
  v: 1;
  body: string;
}

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
