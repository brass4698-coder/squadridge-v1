/**
 * Issuer-managed Semaphore anonymity group support
 * (per `docs/technical/rfc-issuer-managed-anonymity-group.md`).
 *
 * An "issuer" is an external organization (humanitarian org, academic registry,
 * partner platform) that publishes the set of identity commitments authorised
 * to participate in a SquadRidge cohort. The platform never sees the mapping
 * commitment ↔ real identity; it only consumes the issuer's signed Merkle root.
 *
 * This module is responsible for fetching, signature-verifying, and caching
 * issuer manifests in the browser. The Edge verifier independently re-fetches
 * the same manifest when verifying proofs (see
 * `supabase/functions/_shared/handleZkProofVerification.ts`); the client and
 * Edge agreement is what makes the anonymity claim non-trivial.
 *
 * Manifest schema (also documented in the RFC §4.1):
 *
 *     {
 *       "group_id":     "issuer.example/2026-04-cohort",
 *       "tree_depth":   20,
 *       "root":         "0xabc…",
 *       "members_url":  "https://issuer.example/squadridge/members.json",
 *       "issued_at":    "2026-04-28T00:00:00Z",
 *       "expires_at":   "2026-05-28T00:00:00Z",
 *       "signature":    "ed25519:<base64url-of-64-byte-signature>"
 *     }
 *
 * The signature covers the canonical JSON of every other field (sorted keys,
 * no whitespace) — see {@link canonicalManifestBytes}. Issuers MUST publish
 * canonical JSON in the same order, otherwise verification fails.
 */

export interface IssuerManifest {
  group_id: string;
  tree_depth: number;
  root: string;
  members_url: string;
  issued_at: string;
  expires_at: string;
  signature: string;
}

export interface VerifiedIssuerManifest extends IssuerManifest {
  /** When this manifest was retrieved (UTC). For staleness checks in caches. */
  fetched_at: string;
}

/** Fields we serialize for signature verification (everything except `signature` itself). */
const SIGNED_FIELDS = [
  'group_id',
  'tree_depth',
  'root',
  'members_url',
  'issued_at',
  'expires_at',
] as const;

const SIG_PREFIX = 'ed25519:';

/**
 * Canonical bytes that the issuer's Ed25519 signature commits to. Matches the
 * server-side helper in `supabase/functions/_shared/handleZkProofVerification.ts`.
 * Keep both implementations identical — any drift breaks pilots.
 */
export function canonicalManifestBytes(manifest: IssuerManifest): Uint8Array {
  const canonical: Record<string, unknown> = {};
  for (const f of SIGNED_FIELDS) {
    canonical[f] = manifest[f];
  }
  // JSON.stringify with sorted keys — small, deterministic, no whitespace.
  const json = JSON.stringify(canonical, Object.keys(canonical).sort());
  return new TextEncoder().encode(json);
}

function base64UrlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * Verify a manifest signature against a pinned issuer Ed25519 public key.
 * Throws if anything is malformed; returns void on success. Web Crypto's
 * Ed25519 support is GA in modern browsers (Chrome 113+, Safari 17+,
 * Firefox 130+). Edge runtime (Deno) supports it too.
 */
export async function verifyManifestSignature(
  manifest: IssuerManifest,
  pinnedPublicKeyBase64Url: string,
): Promise<void> {
  if (!manifest.signature.startsWith(SIG_PREFIX)) {
    throw new Error('issuer manifest: signature must start with "ed25519:"');
  }
  const sigBytes = base64UrlToBytes(manifest.signature.slice(SIG_PREFIX.length));
  if (sigBytes.length !== 64) {
    throw new Error(`issuer manifest: signature must be 64 bytes, got ${sigBytes.length}`);
  }
  const keyBytes = base64UrlToBytes(pinnedPublicKeyBase64Url);
  if (keyBytes.length !== 32) {
    throw new Error(`issuer manifest: public key must be 32 bytes, got ${keyBytes.length}`);
  }

  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'Ed25519' }, false, [
    'verify',
  ]);
  const ok = await crypto.subtle.verify(
    'Ed25519',
    cryptoKey,
    sigBytes,
    canonicalManifestBytes(manifest),
  );
  if (!ok) {
    throw new Error('issuer manifest: signature verification failed');
  }
}

/** A function pinned with the issuer's public key, returning a verified manifest. */
export type ManifestFetcher = (groupId: string) => Promise<VerifiedIssuerManifest>;

/** Options for the default manifest fetcher. */
export interface DefaultManifestFetcherOptions {
  /** Map of `group_id` → `{manifest_url, signing_key_base64url}`. */
  registry: Record<string, { manifest_url: string; signing_key_base64url: string }>;
  /** Optional fetch override (for tests). Defaults to global `fetch`. */
  fetchImpl?: typeof fetch;
}

/**
 * Returns a {@link ManifestFetcher} that, given a `group_id`:
 *   - looks up the registered manifest URL and pinned key,
 *   - HTTPS-fetches the manifest,
 *   - verifies its Ed25519 signature against the pinned key,
 *   - asserts that `expires_at` is in the future,
 *   - returns the verified manifest with a `fetched_at` timestamp.
 *
 * **Does not** cache; callers wrap with {@link memoize} if needed (the cache
 * boundary belongs in the application, not here, so test mocks stay simple).
 */
export function createManifestFetcher(opts: DefaultManifestFetcherOptions): ManifestFetcher {
  const fetchImpl = opts.fetchImpl ?? fetch.bind(globalThis);
  return async (groupId) => {
    const entry = opts.registry[groupId];
    if (!entry) {
      throw new Error(`issuer manifest: group_id not registered: ${groupId}`);
    }
    const res = await fetchImpl(entry.manifest_url);
    if (!res.ok) {
      throw new Error(
        `issuer manifest fetch failed: HTTP ${res.status} from ${entry.manifest_url}`,
      );
    }
    const raw = (await res.json()) as unknown;
    const manifest = parseManifest(raw);
    if (manifest.group_id !== groupId) {
      throw new Error(
        `issuer manifest group_id mismatch: requested ${groupId}, manifest says ${manifest.group_id}`,
      );
    }
    if (Date.parse(manifest.expires_at) <= Date.now()) {
      throw new Error('issuer manifest expired');
    }
    await verifyManifestSignature(manifest, entry.signing_key_base64url);
    return { ...manifest, fetched_at: new Date().toISOString() };
  };
}

function parseManifest(raw: unknown): IssuerManifest {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('issuer manifest: not a JSON object');
  }
  const r = raw as Record<string, unknown>;
  for (const f of [...SIGNED_FIELDS, 'signature']) {
    if (typeof r[f] !== (f === 'tree_depth' ? 'number' : 'string')) {
      throw new Error(`issuer manifest: missing or invalid field "${f}"`);
    }
  }
  return raw as IssuerManifest;
}

/**
 * Fetch member identity commitments for a verified manifest. The members file
 * is a JSON array of decimal strings — one per identity commitment. Returns
 * BigInts ready to feed into a Semaphore `Group.addMember(commitment)`.
 *
 * The caller MUST cross-check that the constructed group's Merkle root matches
 * `manifest.root` before trusting the proof.
 */
export async function fetchIssuerMemberCommitments(
  manifest: VerifiedIssuerManifest,
  fetchImpl: typeof fetch = fetch.bind(globalThis),
): Promise<bigint[]> {
  const res = await fetchImpl(manifest.members_url);
  if (!res.ok) {
    throw new Error(`issuer members fetch failed: HTTP ${res.status} from ${manifest.members_url}`);
  }
  const raw = (await res.json()) as unknown;
  if (!Array.isArray(raw)) {
    throw new Error('issuer members: payload is not a JSON array');
  }
  const result: bigint[] = [];
  for (const entry of raw) {
    if (typeof entry !== 'string') {
      throw new Error('issuer members: entries must be decimal strings');
    }
    if (!/^[0-9]+$/.test(entry)) {
      throw new Error('issuer members: entry is not a non-negative decimal');
    }
    result.push(BigInt(entry));
  }
  return result;
}
