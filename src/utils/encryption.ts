/**
 * encryption.ts — KMS-wrapped AES-GCM encrypt/decrypt scaffold
 *
 * STATUS: SCAFFOLD — not wired to a real KMS. See "NEXT STEPS" below.
 *
 * PURPOSE
 * -------
 * This file shows the intended encryption architecture for SquadRidge message
 * keys and any other high-value secrets that currently live as plaintext in
 * Postgres.
 *
 * CURRENT STATE (MVP)
 * -------------------
 * Squad message keys are stored as raw base64 bytes in `squads.message_encryption_key`.
 * Any Supabase user with service-role access can read them. See:
 *   docs/security/threat-model.md §5
 *   docs/security/encryption-scope.md
 *
 * TARGET ARCHITECTURE (this scaffold)
 * ------------------------------------
 *
 *   ┌─────────────────┐    wrap/unwrap     ┌──────────────────┐
 *   │  AWS KMS / CF   │◀──────────────────▶│  KMS client      │
 *   │  KV / Vault     │                    │  (this module)   │
 *   └─────────────────┘                    └────────┬─────────┘
 *                                                   │
 *              ┌────────────────────────────────────┤
 *              │                                    │
 *    ┌─────────▼────────┐                ┌─────────▼────────┐
 *    │  Data key (DEK)  │                │  Wrapped DEK     │
 *    │  (32 random bytes│                │  (stored in DB   │
 *    │   in memory only)│                │   or alongside   │
 *    └─────────┬────────┘                │   ciphertext)    │
 *              │                         └──────────────────┘
 *    ┌─────────▼────────┐
 *    │  AES-256-GCM     │
 *    │  encrypt/decrypt │
 *    │  (this module)   │
 *    └──────────────────┘
 *
 * Envelope encryption pattern:
 *   1. Generate a random 32-byte data encryption key (DEK).
 *   2. Encrypt the plaintext with DEK using AES-256-GCM.
 *   3. Wrap (encrypt) the DEK with the KMS key — this produces a `wrappedKey`.
 *   4. Store: ciphertext, IV, auth tag, and wrappedKey reference in DB.
 *   5. To decrypt: unwrap DEK from KMS, then decrypt ciphertext.
 *
 * WHAT THIS GIVES YOU
 * -------------------
 * - If the database is breached, the attacker has ciphertext + wrapped keys.
 *   Without KMS access, they cannot unwrap the DEKs.
 * - KMS access is audited and MFA-gated separately from the DB.
 * - Key rotation: generate a new DEK, re-encrypt the plaintext, wrap the new
 *   DEK — the KMS master key doesn't need to change.
 * - This does NOT provide E2E encryption against the platform — the server
 *   holds KMS access. It protects against DB-only breaches.
 *
 * NEXT STEPS (to wire a real KMS)
 * --------------------------------
 * Option A: AWS KMS
 *   1. npm install @aws-sdk/client-kms
 *   2. Create a symmetric KMS key in your AWS account.
 *   3. Set KMS_KEY_ARN, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 *      (or use instance profile / IRSA for EC2/EKS).
 *   4. Replace generateWrappedKey() and unwrapKey() with real KMS calls.
 *
 * Option B: Cloudflare D1 / Workers KV (if using CF infrastructure)
 *   1. Use CF's native encryption-at-rest + Workers KV for key storage.
 *   2. Wrap DEK with a KV-stored master key.
 *
 * Option C: Hashicorp Vault (self-hosted or HCP)
 *   1. npm install node-vault
 *   2. Use the Transit secrets engine for wrap/unwrap.
 *
 * ENV VARS (when wired to real KMS)
 * ----------------------------------
 * KMS_KEY_ARN          — AWS KMS key ARN (Option A)
 * KMS_PROVIDER         — 'aws' | 'cloudflare' | 'vault' | 'local' (local = dev only)
 * AWS_REGION           — AWS region for KMS
 * VAULT_ADDR           — Vault address (Option C)
 * VAULT_TOKEN          — Vault token (Option C)
 */

// ─── Result types ─────────────────────────────────────────────────────────────

export interface EncryptedPayload {
  /** Base64url-encoded ciphertext (AES-GCM encrypted data). */
  ciphertext: string;
  /** Base64url-encoded 12-byte GCM initialization vector. */
  iv: string;
  /**
   * Opaque reference to the wrapped DEK stored in your KMS / DB.
   * On decryption, pass this back to `decrypt()` so it can unwrap the key.
   *
   * SCAFFOLD: In this placeholder implementation this IS the wrapped key bytes.
   * In production it should be a reference (e.g. KMS ciphertext blob in base64,
   * or a UUID pointing to a row in `encrypted_keys`).
   */
  wrappedKeyRef: string;
  /** Algorithm identifier — always 'AES-256-GCM' here. */
  alg: 'AES-256-GCM';
}

// ─── Base64url helpers ────────────────────────────────────────────────────────

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]!);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i)!;
  }
  return out;
}

// ─── KMS interface (swap the implementation for a real KMS) ──────────────────

export interface KmsProvider {
  /**
   * Generate a fresh 32-byte data encryption key and return it alongside a
   * "wrapped" (KMS-encrypted) copy. Store the wrapped copy; keep the raw DEK
   * only in memory for the duration of the operation.
   */
  generateDataKey(): Promise<{ rawKey: Uint8Array; wrappedKeyRef: string }>;

  /**
   * Unwrap (decrypt) a wrapped DEK using the KMS master key.
   * @param wrappedKeyRef — the wrappedKeyRef returned by generateDataKey()
   * @returns the raw 32-byte DEK
   */
  unwrapDataKey(wrappedKeyRef: string): Promise<Uint8Array>;
}

// ─── Local (dev-only) KMS provider — NOT for production ──────────────────────

/**
 * SCAFFOLD placeholder that "wraps" keys by XOR-ing with a local master key.
 * This provides zero actual security — it exists only so the encrypt/decrypt
 * functions compile and run in tests without a real KMS.
 *
 * DO NOT use this in production. Replace with a real KmsProvider implementation
 * using AWS KMS, Vault, or Cloudflare.
 */
export class LocalDevKmsProvider implements KmsProvider {
  private readonly masterKey: Uint8Array;

  constructor(masterKeyHex?: string) {
    // In tests, use a deterministic master key; in prod, this must be a secret.
    const hex =
      masterKeyHex ??
      (typeof process !== 'undefined' ? process.env.KMS_LOCAL_MASTER_KEY : undefined) ??
      'a'.repeat(64); // 32 bytes — DO NOT USE IN PRODUCTION
    this.masterKey = new Uint8Array(Buffer.from(hex, 'hex'));
  }

  async generateDataKey(): Promise<{ rawKey: Uint8Array; wrappedKeyRef: string }> {
    const rawKey = new Uint8Array(32);
    crypto.getRandomValues(rawKey);
    // "Wrap" = XOR with master key (placeholder — not real encryption).
    const wrapped = rawKey.map((b, i) => b ^ (this.masterKey[i % this.masterKey.length] ?? 0));
    return { rawKey, wrappedKeyRef: bytesToBase64Url(wrapped) };
  }

  async unwrapDataKey(wrappedKeyRef: string): Promise<Uint8Array> {
    const wrapped = base64UrlToBytes(wrappedKeyRef);
    const rawKey = wrapped.map((b, i) => b ^ (this.masterKey[i % this.masterKey.length] ?? 0));
    return rawKey;
  }
}

// ─── Encrypt ─────────────────────────────────────────────────────────────────

/**
 * Encrypt a plaintext string using AES-256-GCM with a KMS-wrapped data key.
 *
 * @param plaintext — the data to encrypt (UTF-8 string)
 * @param kms — KMS provider to generate and wrap the data key
 * @returns EncryptedPayload — safe to store in a database
 *
 * SCAFFOLD: In production, the `wrappedKeyRef` should be stored alongside the
 * ciphertext in a dedicated column (e.g. `wrapped_key_ref` in the messages table),
 * not embedded in the ciphertext payload itself.
 */
export async function encrypt(plaintext: string, kms: KmsProvider): Promise<EncryptedPayload> {
  const { rawKey, wrappedKeyRef } = await kms.generateDataKey();

  // Import the raw DEK into WebCrypto — it never leaves memory as plaintext.
  const cryptoKey = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt']);

  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const enc = new TextEncoder();
  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    enc.encode(plaintext),
  );

  return {
    alg: 'AES-256-GCM',
    iv: bytesToBase64Url(iv),
    ciphertext: bytesToBase64Url(new Uint8Array(cipherBuf)),
    wrappedKeyRef,
  };
}

// ─── Decrypt ─────────────────────────────────────────────────────────────────

/**
 * Decrypt an EncryptedPayload using a KMS provider to unwrap the data key.
 *
 * @param payload — EncryptedPayload from encrypt()
 * @param kms — KMS provider (must use the same master key as during encryption)
 * @returns plaintext string
 */
export async function decrypt(payload: EncryptedPayload, kms: KmsProvider): Promise<string> {
  const rawKey = await kms.unwrapDataKey(payload.wrappedKeyRef);

  const cryptoKey = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['decrypt']);

  const iv = base64UrlToBytes(payload.iv);
  const cipherBuf = base64UrlToBytes(payload.ciphertext);

  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, cipherBuf);
  return new TextDecoder().decode(plainBuf);
}
