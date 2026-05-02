/**
 * AES-256-GCM helpers for app-level message encryption (Web Crypto).
 * Keys live on `squads.message_encryption_key` (32 raw bytes, base64 or base64url). RLS limits members;
 * the DB also generates a key on insert if omitted (see migration `20260417150000_*`). This is not
 * end-to-end encryption against the platform — see `docs/security/threat-model.md`.
 */

const AES_GCM_IV_LENGTH = 12;

function base64UrlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]!);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Random 32-byte key, base64url-encoded. **Test/tooling only** — production squad keys are
 * owned by Postgres (`squads_set_default_message_encryption_key` trigger, migration
 * `20260417150000`). Calling this from a runtime client path would put unaudited key
 * material into the operator's database; do not import it from `src/pages/**` or
 * `src/lib/squad.ts`. See `docs/security/secrets-rotation.md`.
 */
export function generateSquadMessageKeyBase64Url(): string {
  const raw = new Uint8Array(32);
  crypto.getRandomValues(raw);
  return bytesToBase64Url(raw);
}

export async function importAes256GcmKeyFromBase64Url(base64Url: string): Promise<CryptoKey> {
  const raw = base64UrlToBytes(base64Url);
  if (raw.length !== 32) {
    throw new Error('Invalid squad encryption key length.');
  }
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export interface MessagePayloadV3 {
  v: 3;
  alg: 'AES-256-GCM';
  iv: string;
  ct: string;
}

export function isPayloadV3(parsed: unknown): parsed is MessagePayloadV3 {
  return (
    typeof parsed === 'object' &&
    parsed !== null &&
    'v' in parsed &&
    (parsed as MessagePayloadV3).v === 3 &&
    'iv' in parsed &&
    'ct' in parsed &&
    typeof (parsed as MessagePayloadV3).iv === 'string' &&
    typeof (parsed as MessagePayloadV3).ct === 'string'
  );
}

export async function encryptPlaintextAesGcm(
  plain: string,
  key: CryptoKey,
): Promise<MessagePayloadV3> {
  const iv = new Uint8Array(AES_GCM_IV_LENGTH);
  crypto.getRandomValues(iv);
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plain)),
  );
  return {
    v: 3,
    alg: 'AES-256-GCM',
    iv: bytesToBase64Url(iv),
    ct: bytesToBase64Url(ct),
  };
}

export async function decryptPlaintextAesGcm(
  payload: MessagePayloadV3,
  key: CryptoKey,
): Promise<string> {
  const iv = base64UrlToBytes(payload.iv);
  const ct = base64UrlToBytes(payload.ct);
  const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(buf);
}
