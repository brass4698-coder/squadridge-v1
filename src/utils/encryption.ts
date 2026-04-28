/**
 * KMS-backed server-side field encryption skeleton.
 *
 * This module demonstrates the recommended pattern for wrapping AES-256-GCM
 * data keys with a cloud KMS (AWS KMS, GCP Cloud KMS, or Azure Key Vault).
 *
 * Current state: this is a PSEUDOCODE / SKELETON for planning purposes.
 * The in-browser AES-256-GCM implementation for squad messages is already
 * production-ready in `src/lib/messageCrypto.ts`.
 * This file documents the KMS-wrapping layer needed for server-side (Edge
 * Function or backend service) field-level encryption.
 *
 * Architecture:
 *
 *   ┌────────────────────────────────────────────────────────────────────┐
 *   │  KMS (AWS/GCP/Azure)                                               │
 *   │  Customer Master Key (CMK) — never leaves KMS                      │
 *   └─────────────┬──────────────────────────────────────────────────────┘
 *                 │ GenerateDataKey / Wrap
 *                 ▼
 *   ┌────────────────────────────────────────────────────────────────────┐
 *   │  Data Key (32 bytes, plaintext — in-memory only)                   │
 *   │  Wrapped Data Key (ciphertext — stored in DB alongside ciphertext) │
 *   └─────────────┬──────────────────────────────────────────────────────┘
 *                 │ AES-256-GCM encrypt
 *                 ▼
 *   ┌────────────────────────────────────────────────────────────────────┐
 *   │  messages.ciphertext (bytea) + messages.iv + messages.wrapped_key  │
 *   └────────────────────────────────────────────────────────────────────┘
 *
 * Key rotation: generate a new CMK → re-encrypt each wrapped_key without
 * touching ciphertext — only the key-wrapping layer changes.
 *
 * Required environment variables (set via secret manager):
 *  - KMS_KEY_ARN (AWS) or KMS_KEY_NAME (GCP) — identifier of the CMK.
 *  - AWS_REGION / GCP_PROJECT — cloud region/project.
 *  - KMS_PROVIDER — "aws" | "gcp" | "azure" | "local" (local = dev/test only).
 *
 * FIXME: Replace pseudocode stubs with real KMS SDK calls before production use.
 * See ROADMAP.md for timeline.
 */

export interface EncryptedField {
  /** AES-256-GCM ciphertext (base64url). */
  ciphertext: string;
  /** Random 12-byte IV (base64url). */
  iv: string;
  /**
   * KMS-wrapped (encrypted) form of the data key.
   * Store this alongside the ciphertext; never store the plaintext data key.
   */
  wrappedKey: string;
  /** KMS key identifier used to wrap the data key (for rotation tracking). */
  kmsKeyId: string;
}

// ── KMS stub types (replace with real SDK types) ──────────────────────────────

interface KmsClient {
  /** Generate a data key and return both plaintext and wrapped forms. */
  generateDataKey(keyId: string): Promise<{ plaintextKey: Uint8Array; wrappedKey: string }>;
  /** Decrypt a wrapped data key, returning the plaintext key. */
  decryptDataKey(wrappedKey: string, keyId: string): Promise<Uint8Array>;
}

/**
 * PSEUDOCODE: Replace this with real AWS/GCP/Azure KMS SDK initialisation.
 *
 * AWS example:
 *   import { KMSClient, GenerateDataKeyCommand } from '@aws-sdk/client-kms';
 *   const kms = new KMSClient({ region: process.env.AWS_REGION });
 *
 * GCP example:
 *   import { KeyManagementServiceClient } from '@google-cloud/kms';
 *   const kms = new KeyManagementServiceClient();
 */
function createKmsClient(): KmsClient {
  // FIXME: Implement with real KMS SDK.
  // This stub throws at runtime to prevent accidental use in production.
  return {
    async generateDataKey(_keyId: string) {
      throw new Error(
        '[encryption] KMS client not implemented. ' +
          'Replace createKmsClient() in src/utils/encryption.ts with a real KMS SDK.',
      );
    },
    async decryptDataKey(_wrappedKey: string, _keyId: string) {
      throw new Error(
        '[encryption] KMS client not implemented. ' +
          'Replace createKmsClient() in src/utils/encryption.ts with a real KMS SDK.',
      );
    },
  };
}

const kmsClient: KmsClient = createKmsClient();

// ── AES-256-GCM helpers (Web Crypto — same as messageCrypto.ts) ────────────

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Encrypts `plaintext` using a fresh KMS-derived data key.
 *
 * Steps:
 *  1. Ask KMS to generate a data key (32 bytes); receive plaintext + wrapped forms.
 *  2. Encrypt `plaintext` with AES-256-GCM using the plaintext data key.
 *  3. Discard the plaintext data key from memory immediately after use.
 *  4. Return ciphertext, IV, wrapped key, and the KMS key identifier.
 *
 * The caller stores `ciphertext`, `iv`, `wrappedKey`, and `kmsKeyId` together.
 * The plaintext key is never persisted.
 *
 * @param plaintext  UTF-8 string to encrypt.
 * @param kmsKeyId   CMK identifier (ARN, resource name, etc.).
 */
export async function encryptWithKms(plaintext: string, kmsKeyId: string): Promise<EncryptedField> {
  // 1. Generate data key via KMS
  const { plaintextKey, wrappedKey } = await kmsClient.generateDataKey(kmsKeyId);

  // 2. Import the plaintext data key into Web Crypto (non-extractable)
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    plaintextKey,
    { name: 'AES-GCM' },
    false, // non-extractable
    ['encrypt'],
  );

  // 3. Encrypt with a random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ctBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    new TextEncoder().encode(plaintext),
  );

  // 4. Plaintext key is now out of scope (GC will collect it).
  //    In environments with persistent processes, explicitly zero it:
  plaintextKey.fill(0);

  return {
    ciphertext: bytesToBase64Url(new Uint8Array(ctBuffer)),
    iv: bytesToBase64Url(iv),
    wrappedKey,
    kmsKeyId,
  };
}

/**
 * Decrypts an `EncryptedField` produced by `encryptWithKms`.
 *
 * Steps:
 *  1. Ask KMS to decrypt `wrappedKey` → plaintext data key.
 *  2. Decrypt `ciphertext` with AES-256-GCM.
 *  3. Discard the plaintext data key.
 */
export async function decryptWithKms(field: EncryptedField): Promise<string> {
  // 1. Unwrap data key via KMS
  const plaintextKey = await kmsClient.decryptDataKey(field.wrappedKey, field.kmsKeyId);

  // 2. Import into Web Crypto
  const cryptoKey = await crypto.subtle.importKey('raw', plaintextKey, { name: 'AES-GCM' }, false, [
    'decrypt',
  ]);

  // 3. Decrypt
  const iv = base64UrlToBytes(field.iv);
  const ct = base64UrlToBytes(field.ciphertext);
  const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ct);

  // 4. Zero plaintext key
  plaintextKey.fill(0);

  return new TextDecoder().decode(plainBuffer);
}

/**
 * Key rotation helper.
 *
 * Re-wraps a data key under a new CMK without decrypting the ciphertext.
 * Call this when rotating the KMS CMK.
 *
 * Steps:
 *  1. Decrypt the old wrapped key using the old CMK.
 *  2. Re-encrypt the plaintext key under the new CMK.
 *  3. Return an updated `EncryptedField` with the new `wrappedKey` and `kmsKeyId`.
 */
export async function rotateKmsKey(
  _field: EncryptedField,
  newKmsKeyId: string,
): Promise<EncryptedField> {
  // FIXME: Implement with real KMS SDK re-encryption (AWS: ReEncrypt, GCP: CryptoKeyVersion).
  // Pseudocode:
  //   const plaintextKey = await kmsClient.decryptDataKey(field.wrappedKey, field.kmsKeyId);
  //   const newWrappedKey = await kmsClient.wrapDataKey(plaintextKey, newKmsKeyId);
  //   plaintextKey.fill(0);
  //   return { ...field, wrappedKey: newWrappedKey, kmsKeyId: newKmsKeyId };
  throw new Error(
    `[encryption] rotateKmsKey not implemented. ` +
      `Manually re-encrypt wrappedKey under ${newKmsKeyId} using the KMS SDK.`,
  );
}

// ── Local dev fallback (no KMS) ───────────────────────────────────────────────

/**
 * Local-dev-only encryption using a static key from the environment.
 * **Never use in production** — there is no KMS wrapping.
 *
 * Set LOCAL_DEV_ENCRYPTION_KEY to a 32-byte base64 string in .env.
 * Falls back to a deterministic key derived from the string "local-dev" if unset.
 *
 * FIXME: Gate this behind an explicit `NODE_ENV !== 'production'` check or remove entirely.
 */
export async function encryptLocalDev(plaintext: string): Promise<EncryptedField> {
  const raw =
    typeof import.meta !== 'undefined'
      ? (import.meta.env?.LOCAL_DEV_ENCRYPTION_KEY as string | undefined)
      : undefined;

  let keyBytes: Uint8Array;
  if (raw) {
    const pad = raw.length % 4 === 0 ? '' : '='.repeat(4 - (raw.length % 4));
    const bin = atob(raw + pad);
    keyBytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) keyBytes[i] = bin.charCodeAt(i);
  } else {
    // Derive from constant — predictable, for tests only.
    keyBytes = new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode('local-dev-key')),
    );
  }

  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, [
    'encrypt',
  ]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ctBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    new TextEncoder().encode(plaintext),
  );

  return {
    ciphertext: bytesToBase64Url(new Uint8Array(ctBuffer)),
    iv: bytesToBase64Url(iv),
    wrappedKey: 'local-dev-no-kms',
    kmsKeyId: 'local-dev',
  };
}
