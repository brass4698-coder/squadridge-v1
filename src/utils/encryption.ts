/**
 * encryption.ts — server-side KMS-wrapped field encryption scaffold
 *
 * SCAFFOLD — This module shows the pattern for KMS-wrapped AES-GCM encryption.
 * It is NOT production-ready as written. See "What you need to wire" below.
 *
 * What this demonstrates:
 *   1. Generate a Data Encryption Key (DEK) using the Web Crypto API.
 *   2. Wrap the DEK with a KMS master key (the wrapping call is mocked here).
 *   3. Encrypt a plaintext field with AES-256-GCM using the DEK.
 *   4. Store: ciphertext + IV + wrapped DEK reference (not the raw DEK).
 *   5. To decrypt: unwrap the DEK via KMS, then decrypt the ciphertext.
 *
 * What you need to wire before deploying:
 *   - Replace wrapKeyWithKms() and unwrapKeyWithKms() with real KMS calls:
 *       AWS:  kms.encrypt({ KeyId, Plaintext: rawDek })
 *       GCP:  kmsSvc.encrypt({ name: keyName, plaintext: rawDek })
 *   - Store KMS_KEY_ID (the CMK ARN or resource name) in your secret manager,
 *     not as an environment variable in plain text.
 *   - In production, the DEK itself should never be logged or stored raw.
 *   - Consider adding key rotation: generate a new DEK per squad lifecycle event
 *     and re-wrap existing ciphertext with the new key.
 *
 * Why KMS wrapping matters:
 *   Storing the raw DEK alongside the ciphertext negates the protection.
 *   With KMS wrapping, an attacker who steals the database gets ciphertext +
 *   wrapped keys — but cannot decrypt without also compromising the KMS CMK,
 *   which lives in a separate, audited system.
 *
 * Related files:
 *   - src/lib/messageCrypto.ts    — browser-side AES-GCM (same algorithm, client use)
 *   - docs/security/encryption-scope.md — honest description of what is/isn't encrypted
 *   - ROADMAP.md                  — Phase 1 encryption hardening timeline
 */

/** A stored encrypted field: everything you need to decrypt later. */
export interface EncryptedField {
  /** Base64-encoded AES-GCM ciphertext (including 16-byte auth tag). */
  ciphertext: string;
  /** Base64-encoded 12-byte IV (GCM nonce). Unique per encrypt call. */
  iv: string;
  /**
   * Base64-encoded wrapped Data Encryption Key.
   * Wrapped by the KMS master key; useless without KMS access.
   * Store this alongside the ciphertext row.
   */
  wrappedDek: string;
  /** Identifier of the KMS master key used to wrap the DEK. */
  kmsKeyRef: string;
}

// ---------------------------------------------------------------------------
// KMS stub — replace with real SDK calls
// ---------------------------------------------------------------------------

/**
 * Wrap a raw DEK with KMS.
 *
 * SCAFFOLD — Replace this with your KMS SDK call.
 * AWS example:
 *   const { CiphertextBlob } = await kmsClient.encrypt({
 *     KeyId: kmsKeyId,
 *     Plaintext: rawDek,
 *   });
 *   return CiphertextBlob;
 */
async function wrapKeyWithKms(rawDek: Uint8Array, _kmsKeyId: string): Promise<Uint8Array> {
  // Stub: XOR with 0x42 as a placeholder transformation.
  // DO NOT ship this in production — it provides zero security.
  const wrapped = new Uint8Array(rawDek.length);
  for (let i = 0; i < rawDek.length; i++) {
    wrapped[i] = (rawDek[i] ?? 0) ^ 0x42;
  }
  return wrapped;
}

/**
 * Unwrap a wrapped DEK with KMS.
 *
 * SCAFFOLD — Replace this with your KMS SDK call.
 * AWS example:
 *   const { Plaintext } = await kmsClient.decrypt({ CiphertextBlob: wrappedDek });
 *   return Plaintext;
 */
async function unwrapKeyWithKms(wrappedDek: Uint8Array, _kmsKeyId: string): Promise<Uint8Array> {
  // Stub: reverse the XOR above.
  const raw = new Uint8Array(wrappedDek.length);
  for (let i = 0; i < wrappedDek.length; i++) {
    raw[i] = (wrappedDek[i] ?? 0) ^ 0x42;
  }
  return raw;
}

// ---------------------------------------------------------------------------
// Crypto helpers (Web Crypto API — works in browser, Deno, Node 18+)
// ---------------------------------------------------------------------------

function toBase64(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Encrypt a plaintext string using a freshly generated DEK, then wrap the DEK
 * with KMS. Returns a self-contained EncryptedField you can store in the DB.
 *
 * @param plaintext  - The value to encrypt (e.g. a message body, a PII field).
 * @param kmsKeyId   - The KMS master key reference (ARN, resource name, etc.).
 */
export async function encryptField(plaintext: string, kmsKeyId: string): Promise<EncryptedField> {
  // 1. Generate a fresh 256-bit DEK.
  const rawDek = new Uint8Array(32);
  crypto.getRandomValues(rawDek);

  // 2. Import the DEK as a Web Crypto key.
  const cryptoKey = await crypto.subtle.importKey('raw', rawDek, 'AES-GCM', false, ['encrypt']);

  // 3. Generate a random 12-byte IV (GCM nonce).
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  // 4. Encrypt.
  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    new TextEncoder().encode(plaintext),
  );

  // 5. Wrap the DEK with KMS.
  const wrappedDek = await wrapKeyWithKms(rawDek, kmsKeyId);

  // 6. Zero out the raw DEK in memory as best we can (not guaranteed in JS GC).
  rawDek.fill(0);

  return {
    ciphertext: toBase64(new Uint8Array(ciphertextBuf)),
    iv: toBase64(iv),
    wrappedDek: toBase64(wrappedDek),
    kmsKeyRef: kmsKeyId,
  };
}

/**
 * Decrypt an EncryptedField. Unwraps the DEK via KMS, then decrypts with AES-GCM.
 *
 * @param field - The stored EncryptedField (from encryptField or from the DB row).
 */
export async function decryptField(field: EncryptedField): Promise<string> {
  // 1. Unwrap the DEK via KMS.
  const rawDek = await unwrapKeyWithKms(fromBase64(field.wrappedDek), field.kmsKeyRef);

  // 2. Import as a Web Crypto key.
  const cryptoKey = await crypto.subtle.importKey('raw', rawDek, 'AES-GCM', false, ['decrypt']);

  // 3. Decrypt.
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(field.iv) },
    cryptoKey,
    fromBase64(field.ciphertext),
  );

  // 4. Zero out the raw DEK.
  rawDek.fill(0);

  return new TextDecoder().decode(plainBuf);
}
