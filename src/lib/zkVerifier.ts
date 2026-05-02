import type { SemaphoreProof } from '@semaphore-protocol/proof';
import { generateProof as generateSemaphoreProofLib } from '@semaphore-protocol/proof';
import {
  buildSessionAnonymityGroup,
  type SessionAnonymityGroupOptions,
} from './zk/buildAnonymityGroup';
import { getOrCreateSessionIdentity } from './zk/semaphoreIdentityStorage';
import { semaphoreFieldFromLabel } from './zk/semaphoreFieldEncoding';

export type CredentialType = string;

export type ZKProof = {
  proofId: string;
  credentialType: string;
  nullifierHash: string;
  commitment: string;
  verifiedAt: string;
  /** @deprecated Hash-only path; prefer Semaphore (`isStub: false`). */
  isStub?: boolean;
};

async function sha256Hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Local hash-shaped payload for demos / tests when `VITE_ZK_STUB=true`.
 * Does not provide Semaphore security guarantees.
 *
 * Both `nullifierHash` and `commitment` are derived deterministically from
 * `(credentialType, rawInput)`. Determinism is required so callers can use the
 * commitment for dedup / nullifier-style double-submit checks even on the stub
 * path; mixing in `Date.now()` (the previous behaviour) made the stub unusable
 * for any such check and silently diverged from the Semaphore path's contract.
 */
export async function generateStubProof(
  credentialType: CredentialType,
  rawInput: string,
): Promise<ZKProof> {
  const encoder = new TextEncoder();
  const nullifierData = encoder.encode(`nullifier:${credentialType}:${rawInput}`);
  const commitData = encoder.encode(`commitment:${credentialType}:${rawInput}`);
  const nullifierHash = await sha256Hex(nullifierData);
  const commitment = await sha256Hex(commitData);
  return {
    proofId: crypto.randomUUID(),
    credentialType,
    nullifierHash,
    commitment,
    verifiedAt: new Date().toISOString(),
    isStub: true,
  };
}

/**
 * Generates a Semaphore proof in-browser: membership in a padded group + bound message/scope fields.
 * Proof verification runs on the `verify-zk-proof` Edge Function via `verifyProof`.
 *
 * When `groupOptions.issuerGroupId` + `groupOptions.issuerManifestFetcher` are
 * supplied, the anonymity group is built from the issuer's signed Merkle root
 * (RFC: `docs/technical/rfc-issuer-managed-anonymity-group.md`) and the
 * caller is expected to forward the same `issuer_group_id` to the Edge
 * verifier so the server can cross-check `merkleTreeRoot` against
 * `issuer_groups.current_root`. Without options, the existing decoy / demo
 * path is used per `shouldUseBuiltinSemaphoreDecoys`.
 */
export async function generateSemaphoreProof(
  credentialType: CredentialType,
  attributeScope: string,
  groupOptions?: SessionAnonymityGroupOptions,
): Promise<SemaphoreProof> {
  const identity = getOrCreateSessionIdentity();
  const group = await buildSessionAnonymityGroup(identity, groupOptions);
  const message = semaphoreFieldFromLabel(attributeScope);
  const scope = semaphoreFieldFromLabel(credentialType);
  return generateSemaphoreProofLib(identity, group, message, scope);
}
