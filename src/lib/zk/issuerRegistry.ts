/**
 * Issuer-managed anonymity group resolver — env-driven registry.
 *
 * In production deployments where a partner organization has published a
 * signed Semaphore Merkle root (see `docs/technical/rfc-issuer-managed-anonymity-group.md`),
 * the client proof path needs to know:
 *   1. Which `group_id` the user belongs to (the cohort identifier).
 *   2. Where to fetch the issuer's signed manifest.
 *   3. The pinned Ed25519 public key used to verify the manifest signature.
 *
 * All three are wired through env vars so an operator can swap issuers without
 * code changes; deployments without these vars fall back to the existing
 * decoy / demo path in `buildAnonymityGroup.ts`. The Edge function continues
 * to enforce `issuer_group_id` against `issuer_groups.current_root` when the
 * client sends one (see `supabase/functions/_shared/handleZkProofVerification.ts`).
 *
 * Returning `null` from {@link resolveIssuerRegistry} is the documented
 * "decoys / single-issuer not configured" branch — callers must not treat it
 * as an error.
 */

import { createManifestFetcher, type ManifestFetcher } from './issuerManifest';

export interface IssuerRegistryConfig {
  /** Cohort identifier (matches the issuer manifest's `group_id`). */
  groupId: string;
  /** HTTPS URL serving the signed issuer manifest JSON. */
  manifestUrl: string;
  /** Pinned Ed25519 public key (base64url, 32 bytes raw). */
  signingKeyBase64Url: string;
  /** Bound fetcher for {@link buildSessionAnonymityGroup}. */
  fetcher: ManifestFetcher;
}

export interface IssuerRegistryEnvSlice {
  readonly VITE_ISSUER_GROUP_ID?: string;
  readonly VITE_ISSUER_MANIFEST_URL?: string;
  readonly VITE_ISSUER_SIGNING_KEY_BASE64URL?: string;
}

/**
 * Build an issuer registry from a Vite env slice. Returns `null` when any of
 * the three required vars is missing or empty — the documented opt-in path.
 *
 * Test injection is supported via {@link fetchImpl}. Production callers leave
 * it undefined so the global `fetch` is used.
 */
export function resolveIssuerRegistry(
  env: IssuerRegistryEnvSlice,
  fetchImpl?: typeof fetch,
): IssuerRegistryConfig | null {
  const groupId = env.VITE_ISSUER_GROUP_ID?.trim();
  const manifestUrl = env.VITE_ISSUER_MANIFEST_URL?.trim();
  const signingKeyBase64Url = env.VITE_ISSUER_SIGNING_KEY_BASE64URL?.trim();
  if (!groupId || !manifestUrl || !signingKeyBase64Url) {
    return null;
  }
  const fetcher = createManifestFetcher({
    registry: {
      [groupId]: {
        manifest_url: manifestUrl,
        signing_key_base64url: signingKeyBase64Url,
      },
    },
    fetchImpl,
  });
  return { groupId, manifestUrl, signingKeyBase64Url, fetcher };
}
