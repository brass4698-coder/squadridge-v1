import type { SemaphoreProof } from '@semaphore-protocol/proof';
import { generateProof as generateSemaphoreProofLib } from '@semaphore-protocol/proof';
import { buildSessionAnonymityGroup } from './zk/buildAnonymityGroup';
import { getOrCreateSessionIdentity } from './zk/semaphoreIdentityStorage';
import { semaphoreFieldFromLabel } from './zk/semaphoreFieldEncoding';

export type CredentialType = string;

export type ZKProof = {
  proofId: string;
  credentialType: string;
  nullifierHash: string;
  commitment: string;
  verifiedAt: string;
  isStub?: boolean;
};

async function sha256Hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function generateStubProof(
  credentialType: CredentialType,
  rawInput: string,
): Promise<ZKProof> {
  const encoder = new TextEncoder();
  const nullifierData = encoder.encode(`nullifier:${credentialType}:${rawInput}`);
  const commitData = encoder.encode(`commitment:${credentialType}:${Date.now()}`);
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

export async function generateSemaphoreProof(
  credentialType: CredentialType,
  attributeScope: string,
): Promise<SemaphoreProof> {
  const identity = getOrCreateSessionIdentity();
  const group = buildSessionAnonymityGroup(identity);
  const message = semaphoreFieldFromLabel(attributeScope);
  const scope = semaphoreFieldFromLabel(credentialType);
  return generateSemaphoreProofLib(identity, group, message, scope);
}
