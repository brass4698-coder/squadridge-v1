/**
 * encryption.ts
 *
 * Server-side AES-GCM field-level encryption helpers with KMS key-wrapping.
 *
 * Status: SCAFFOLD — the AES-GCM logic is complete and safe for use.
 * The KMS integration is stubbed; wire `fetchDataKey` to your cloud KMS
 * (AWS KMS, GCP Cloud KMS, Azure Key Vault) before using in production.
 *
 * Design:
 * - Generate a 256-bit data key via KMS (or local crypto in dev/test).
 * - Encrypt plaintext with AES-GCM + random 96-bit IV.
 * - Store: { ciphertext (base64), iv (base64), wrappedKey (base64) }.
 * - Decrypt: unwrap key via KMS, then AES-GCM decrypt with stored IV.
 *
 * See docs/security/encryption-scope.md and docs/ThreatModel.md.
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Encrypted payload stored in the database. */
export interface EncryptedPayload {
  /** Base64-encoded ciphertext (includes AES-GCM auth tag appended). */
  ciphertext: string;
  /** Base64-encoded 96-bit IV (12 bytes). */
  iv: string;
  /**
   * Base64-encoded wrapped (encrypted) data key from KMS.
   * In dev mode this is a hex-encoded plaintext key — never use in production.
   */
  wrappedKey: string;
}

// ---------------------------------------------------------------------------
// KMS stub (replace with real implementation)
// ---------------------------------------------------------------------------

export interface KmsClient {
  /** Generate and wrap a 256-bit AES data key. Returns the wrapped key bytes. */
  generateDataKey(): Promise<{ plaintext: Buffer; wrapped: Buffer }>;
  /** Decrypt a previously wrapped key. Returns the plaintext key bytes. */
  decryptDataKey(wrapped: Buffer): Promise<Buffer>;
}

/**
 * devKmsClient — plaintext no-op KMS for local development and testing.
 * Generates a random key and "wraps" it by XOR-ing with a fixed byte (0x5A).
 * This is NOT secure. Replace with a real KMS client before production.
 */
export const devKmsClient: KmsClient = {
  async generateDataKey() {
    const plaintext = randomBytes(32);
    // "Wrap" by XOR with 0x5A — intentionally trivial, dev/test only.
    const wrapped = Buffer.from(plaintext.map((b) => b ^ 0x5a));
    return { plaintext, wrapped };
  },
  async decryptDataKey(wrapped: Buffer) {
    return Buffer.from(wrapped.map((b) => b ^ 0x5a));
  },
};

// ---------------------------------------------------------------------------
// Encrypt
// ---------------------------------------------------------------------------

/**
 * encryptField
 *
 * Encrypts `plaintext` using AES-256-GCM with a KMS-generated data key.
 *
 * @param plaintext - UTF-8 string to encrypt.
 * @param kms - KMS client (defaults to devKmsClient — replace in production).
 * @returns EncryptedPayload ready to store in the database.
 */
export async function encryptField(
  plaintext: string,
  kms: KmsClient = devKmsClient,
): Promise<EncryptedPayload> {
  const { plaintext: dataKey, wrapped } = await kms.generateDataKey();
  const iv = randomBytes(12); // 96-bit IV is the GCM standard

  const cipher = createCipheriv('aes-256-gcm', dataKey, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag(); // 128-bit authentication tag

  // Append auth tag to ciphertext for single-blob storage.
  const ciphertextWithTag = Buffer.concat([encrypted, authTag]);

  // Zero out the plaintext key from memory (best-effort in JS).
  dataKey.fill(0);

  return {
    ciphertext: ciphertextWithTag.toString('base64'),
    iv: iv.toString('base64'),
    wrappedKey: wrapped.toString('base64'),
  };
}

// ---------------------------------------------------------------------------
// Decrypt
// ---------------------------------------------------------------------------

/**
 * decryptField
 *
 * Decrypts an EncryptedPayload produced by `encryptField`.
 *
 * @param payload - The stored EncryptedPayload.
 * @param kms - KMS client (must match the one used for encryption).
 * @returns Decrypted UTF-8 string.
 * @throws If authentication tag verification fails (data integrity error).
 */
export async function decryptField(
  payload: EncryptedPayload,
  kms: KmsClient = devKmsClient,
): Promise<string> {
  const wrapped = Buffer.from(payload.wrappedKey, 'base64');
  const dataKey = await kms.decryptDataKey(wrapped);
  const iv = Buffer.from(payload.iv, 'base64');
  const ciphertextWithTag = Buffer.from(payload.ciphertext, 'base64');

  // Split ciphertext and 16-byte auth tag.
  const authTag = ciphertextWithTag.subarray(ciphertextWithTag.length - 16);
  const ciphertext = ciphertextWithTag.subarray(0, ciphertextWithTag.length - 16);

  const decipher = createDecipheriv('aes-256-gcm', dataKey, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  // Zero out the plaintext key from memory (best-effort in JS).
  dataKey.fill(0);

  return decrypted.toString('utf8');
}
