/**
 * HMAC-SHA-256 signed tokens used by `mint-deck-share` and `serve-pitch-deck`
 * to gate access to non-public pitch-deck assets.
 *
 * Format is a compact JWT (`header.payload.signature`) with `alg: HS256`. We
 * sign with `DECK_SHARE_SIGNING_SECRET` (a long random string injected at
 * deploy time, never sent to the client). The signature binds:
 *   - the deck id, so a token minted for one deck cannot view another
 *   - the audience (`self` for moderator-only viewing, `share` for external),
 *     so a leaked self-token cannot be promoted into a share URL
 *   - an expiry, enforced server-side on every fetch
 *   - a `jti` so share tokens can be revoked and self-tokens discarded fast
 *
 * Using a separate symmetric key (rather than reusing Supabase's JWT secret)
 * keeps the blast radius small: a stolen `DECK_SHARE_SIGNING_SECRET` only
 * forges deck tokens, not application sessions, and rotation requires no
 * user-facing churn.
 */

export type DeckShareAudience = 'self' | 'share';

export interface DeckShareTokenClaims {
  deckId: string;
  aud: DeckShareAudience;
  exp: number;
  iat: number;
  jti: string;
  mintedBy: string;
}

const SECRET_ENV_VAR = 'DECK_SHARE_SIGNING_SECRET';

type EnvLike = { get: (key: string) => string | undefined };
type RuntimeWithEnv = { env?: EnvLike };

/**
 * Read the signing secret from Deno's env; throws when missing or too short.
 * Edge handlers should call this once and pass the result through to
 * `signDeckShareToken` / `verifyDeckShareToken` so a missing secret surfaces
 * as a 500 with `SERVER_CONFIG`, never a forged token. The reference to
 * `globalThis.Deno` is typed loosely so the file remains importable from
 * vitest (Node) without pulling Deno's d.ts into the application tsconfig.
 */
export function readDeckSigningSecret(): string {
  const denoRuntime = (globalThis as { Deno?: RuntimeWithEnv }).Deno;
  const secret = denoRuntime?.env?.get(SECRET_ENV_VAR)?.trim();
  if (!secret || secret.length < 32) {
    throw new Error(
      `${SECRET_ENV_VAR} is not set or is shorter than 32 characters; refusing to sign or verify tokens`,
    );
  }
  return secret;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < u8.byteLength; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  const normalized = pad ? padded + '='.repeat(4 - pad) : padded;
  const bin = atob(normalized);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function jsonToBase64Url(value: unknown): string {
  const json = JSON.stringify(value);
  return base64UrlEncode(new TextEncoder().encode(json));
}

function base64UrlToJson<T>(input: string): T {
  const bytes = base64UrlDecode(input);
  const text = new TextDecoder().decode(bytes);
  return JSON.parse(text) as T;
}

export interface SignDeckShareTokenInput {
  deckId: string;
  audience: DeckShareAudience;
  ttlSeconds: number;
  mintedBy: string;
  /** Override the secret; defaults to `readDeckSigningSecret()` (Deno env). */
  secret?: string;
  jti?: string;
}

export async function signDeckShareToken(input: SignDeckShareTokenInput): Promise<{
  token: string;
  claims: DeckShareTokenClaims;
}> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const claims: DeckShareTokenClaims = {
    deckId: input.deckId,
    aud: input.audience,
    exp: nowSeconds + input.ttlSeconds,
    iat: nowSeconds,
    jti: input.jti ?? crypto.randomUUID(),
    mintedBy: input.mintedBy,
  };

  const headerB64 = jsonToBase64Url({ alg: 'HS256', typ: 'JWT' });
  const payloadB64 = jsonToBase64Url(claims);
  const signingInput = `${headerB64}.${payloadB64}`;

  const secret = input.secret ?? readDeckSigningSecret();
  const key = await importHmacKey(secret);
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
  const sigB64 = base64UrlEncode(sigBuf);

  return { token: `${signingInput}.${sigB64}`, claims };
}

export type DeckShareTokenError =
  | 'MALFORMED'
  | 'BAD_HEADER'
  | 'BAD_SIGNATURE'
  | 'EXPIRED'
  | 'BAD_PAYLOAD'
  | 'AUDIENCE_MISMATCH'
  | 'DECK_MISMATCH';

export class DeckShareTokenInvalid extends Error {
  readonly code: DeckShareTokenError;
  constructor(code: DeckShareTokenError, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export interface VerifyDeckShareTokenOptions {
  expectedDeckId?: string;
  /** When set, only accept these audiences. Defaults to allowing both. */
  acceptedAudiences?: DeckShareAudience[];
  /** Override the secret; defaults to `readDeckSigningSecret()` (Deno env). */
  secret?: string;
}

/** Constant-time byte comparison to avoid leaking signature info. */
function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function verifyDeckShareToken(
  token: string,
  options: VerifyDeckShareTokenOptions = {},
): Promise<DeckShareTokenClaims> {
  if (typeof token !== 'string' || !token) {
    throw new DeckShareTokenInvalid('MALFORMED');
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new DeckShareTokenInvalid('MALFORMED');
  }
  const [headerB64, payloadB64, sigB64] = parts;

  let header: { alg?: unknown; typ?: unknown };
  try {
    header = base64UrlToJson(headerB64);
  } catch {
    throw new DeckShareTokenInvalid('BAD_HEADER');
  }
  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    throw new DeckShareTokenInvalid('BAD_HEADER');
  }

  const secret = options.secret ?? readDeckSigningSecret();
  const key = await importHmacKey(secret);
  const expected = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${headerB64}.${payloadB64}`)),
  );
  let actual: Uint8Array;
  try {
    actual = base64UrlDecode(sigB64);
  } catch {
    throw new DeckShareTokenInvalid('BAD_SIGNATURE');
  }
  if (!bytesEqual(expected, actual)) {
    throw new DeckShareTokenInvalid('BAD_SIGNATURE');
  }

  let claims: DeckShareTokenClaims;
  try {
    claims = base64UrlToJson<DeckShareTokenClaims>(payloadB64);
  } catch {
    throw new DeckShareTokenInvalid('BAD_PAYLOAD');
  }

  if (
    typeof claims.deckId !== 'string' ||
    !claims.deckId ||
    typeof claims.exp !== 'number' ||
    typeof claims.iat !== 'number' ||
    typeof claims.jti !== 'string' ||
    typeof claims.mintedBy !== 'string' ||
    (claims.aud !== 'self' && claims.aud !== 'share')
  ) {
    throw new DeckShareTokenInvalid('BAD_PAYLOAD');
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (claims.exp <= nowSeconds) {
    throw new DeckShareTokenInvalid('EXPIRED');
  }

  if (options.expectedDeckId && claims.deckId !== options.expectedDeckId) {
    throw new DeckShareTokenInvalid('DECK_MISMATCH');
  }

  if (options.acceptedAudiences && !options.acceptedAudiences.includes(claims.aud)) {
    throw new DeckShareTokenInvalid('AUDIENCE_MISMATCH');
  }

  return claims;
}

/**
 * Maximum allowed TTL per audience. Self-tokens are intentionally tiny so
 * a stolen URL from a moderator's referrer / clipboard cannot outlive the
 * page transition that minted it.
 */
export const MAX_TTL_SECONDS: Record<DeckShareAudience, number> = {
  self: 60,
  share: 7 * 24 * 60 * 60,
};

export const DEFAULT_TTL_SECONDS: Record<DeckShareAudience, number> = {
  self: 30,
  share: 7 * 24 * 60 * 60,
};

export function clampTtlSeconds(
  audience: DeckShareAudience,
  requested: number | undefined,
): number {
  const fallback = DEFAULT_TTL_SECONDS[audience];
  const max = MAX_TTL_SECONDS[audience];
  if (typeof requested !== 'number' || !Number.isFinite(requested) || requested <= 0) {
    return fallback;
  }
  return Math.min(Math.floor(requested), max);
}
