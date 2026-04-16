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

/**
 * Local proof-shaped payload (dev / stub). Server-side verification uses the `zk-verify` Edge Function.
 */
export async function generateProof(credentialType: CredentialType, rawInput: string): Promise<ZKProof> {
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
