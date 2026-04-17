/**
 * Shared Semaphore verification + DB persistence for `verify-zk-proof` and `zk-verify`.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { verifyProof } from 'npm:@semaphore-protocol/proof@4.14.2';
import { encodeBytes32String } from 'npm:ethers@6.13.4/abi';
import { toBigInt } from 'npm:ethers@6.13.4/utils';
import { corsHeadersFor } from './cors.ts';

const MAX_LABEL = 31;

export type SemaphoreProofBody = {
  merkleTreeDepth: number;
  merkleTreeRoot: string;
  message: string;
  nullifier: string;
  scope: string;
  points: [string, string, string, string, string, string, string, string];
};

export type ZkVerifyRequestBody = {
  attribute_scope: string;
  credential_type: string;
  semaphore_proof: SemaphoreProofBody;
};

function fieldFromLabel(label: string): string {
  const s = label.trim().slice(0, MAX_LABEL);
  return toBigInt(encodeBytes32String(s)).toString();
}

function scopeToVerifiedAttribute(scope: string): {
  attribute_type: string;
  attribute_value: string;
} {
  const normalized = scope.trim().slice(0, 100);
  if (normalized === 'onboarding_demo' || normalized === 'verification_flow') {
    return { attribute_type: 'citizenship', attribute_value: 'demo_region' };
  }
  return { attribute_type: 'scope', attribute_value: normalized.slice(0, 255) };
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function assertProofMatchesRequest(
  proof: { message: string; scope: string },
  attributeScope: string,
  credentialType: string,
): void {
  if (proof.message !== fieldFromLabel(attributeScope)) {
    throw new Error('Proof message does not match attribute_scope');
  }
  if (proof.scope !== fieldFromLabel(credentialType)) {
    throw new Error('Proof scope does not match credential_type');
  }
}

export async function verifyAndPersistZkProof(
  supabaseUrl: string,
  serviceKey: string,
  userId: string,
  body: ZkVerifyRequestBody,
): Promise<{
  proof_commitment: string;
  proofId: string;
  credentialType: string;
  nullifierHash: string;
  commitment: string;
  verifiedAt: string;
  isStub: false;
}> {
  const { attribute_scope, credential_type, semaphore_proof } = body;

  if (!attribute_scope || typeof attribute_scope !== 'string' || attribute_scope.length > 200) {
    throw new Error('Invalid attribute_scope');
  }
  if (!credential_type || typeof credential_type !== 'string' || credential_type.length > 200) {
    throw new Error('Invalid credential_type');
  }
  if (!semaphore_proof || typeof semaphore_proof !== 'object') {
    throw new Error('Invalid semaphore_proof');
  }

  const ok = await verifyProof(semaphore_proof as Parameters<typeof verifyProof>[0]);
  if (!ok) {
    throw new Error('Invalid Semaphore proof');
  }

  assertProofMatchesRequest(semaphore_proof, attribute_scope, credential_type);

  const proof_commitment = await sha256Hex(
    JSON.stringify({
      merkleTreeRoot: semaphore_proof.merkleTreeRoot,
      nullifier: semaphore_proof.nullifier,
      message: semaphore_proof.message,
      scope: semaphore_proof.scope,
      points: semaphore_proof.points,
    }),
  );

  const nullifierHash = semaphore_proof.nullifier.toLowerCase();
  const proofId = crypto.randomUUID();
  const verifiedAt = new Date().toISOString();

  const admin = createClient(supabaseUrl, serviceKey);

  const { error: zkErr } = await admin.from('zk_proof_submissions').insert({
    user_id: userId,
    proof_commitment,
    nullifier_hash: nullifierHash,
    attribute_scope: attribute_scope.trim(),
  });

  if (zkErr) {
    if (zkErr.code === '23505') {
      throw new Error('Nullifier already used');
    }
    console.error('zk_proof_submissions insert failed:', zkErr.message);
    throw new Error('Could not record proof');
  }

  const attr = scopeToVerifiedAttribute(attribute_scope);
  const { error: attrErr } = await admin.from('verified_attributes').upsert(
    {
      user_id: userId,
      attribute_type: attr.attribute_type,
      attribute_value: attr.attribute_value,
    },
    { onConflict: 'user_id,attribute_type' },
  );
  if (attrErr) {
    console.error('verified_attributes upsert failed:', attrErr.message);
    throw new Error('Could not record verified attributes');
  }

  return {
    proof_commitment,
    proofId,
    credentialType: credential_type,
    nullifierHash,
    commitment: proof_commitment,
    verifiedAt,
    isStub: false,
  };
}

export function jsonResponse(body: unknown, status = 200, req: Request): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
  });
}

export function getCorsHeaders(req: Request): Record<string, string> {
  return corsHeadersFor(req);
}

export async function handleZkProofPost(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeadersFor(req) });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, req);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return jsonResponse({ error: 'Server configuration error' }, 500, req);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Missing or invalid authorization' }, 401, req);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401, req);
  }

  let body: ZkVerifyRequestBody;
  try {
    body = (await req.json()) as ZkVerifyRequestBody;
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, req);
  }

  try {
    const result = await verifyAndPersistZkProof(supabaseUrl, serviceKey, user.id, body);
    return jsonResponse(result, 200, req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Verification failed';
    if (msg === 'Nullifier already used') {
      return jsonResponse({ error: msg }, 409, req);
    }
    if (msg === 'Could not record proof' || msg === 'Could not record verified attributes') {
      return jsonResponse({ error: msg }, 500, req);
    }
    return jsonResponse({ error: msg }, 400, req);
  }
}
