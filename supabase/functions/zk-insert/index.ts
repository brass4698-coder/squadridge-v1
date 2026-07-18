/**
 * zk-insert — verify a ZK proof then persist via service_role (bypasses client INSERT RLS).
 *
 * POST body:
 *   {
 *     proof: string,              // JSON: Semaphore wire proof OR 8-point Groth16 tuple
 *     publicSignals: string[],    // [merkleTreeRoot, nullifier, message, scope]
 *     payload: {
 *       attribute_scope: string,
 *       credential_type: string,
 *       merkleTreeDepth: number,
 *       issuer_group_id?: string
 *     }
 *   }
 *
 * 200: { id: string }  — zk_proof_submissions.id
 * 400: invalid / failed proof
 * 401: missing JWT
 *
 * SUPABASE_SERVICE_ROLE_KEY is read from Edge secrets / supabase/functions/.env only —
 * never from the Vite client bundle.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersFor } from '../_shared/cors.ts';
import {
  jsonResponse,
  type SemaphoreProofBody,
  type ZkVerifyRequestBody,
  verifyAndPersistZkProof,
} from '../_shared/handleZkProofVerification.ts';

type ZkInsertPayload = {
  attribute_scope?: unknown;
  credential_type?: unknown;
  merkleTreeDepth?: unknown;
  issuer_group_id?: unknown;
};

type ZkInsertBody = {
  proof?: unknown;
  publicSignals?: unknown;
  payload?: ZkInsertPayload;
};

function isPointsTuple(v: unknown): v is SemaphoreProofBody['points'] {
  return (
    Array.isArray(v) && v.length === 8 && v.every((p) => typeof p === 'string' && p.length > 0)
  );
}

function isSemaphoreWire(v: unknown): v is SemaphoreProofBody {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.merkleTreeDepth === 'number' &&
    typeof o.merkleTreeRoot === 'string' &&
    typeof o.message === 'string' &&
    typeof o.nullifier === 'string' &&
    typeof o.scope === 'string' &&
    isPointsTuple(o.points)
  );
}

/**
 * Map the groth16-style { proof, publicSignals, payload } contract onto the
 * shared Semaphore verification + persistence path (snarkjs via verifySemaphoreProof).
 */
export function zkInsertBodyToVerifyRequest(raw: ZkInsertBody): ZkVerifyRequestBody {
  const payload = raw.payload;
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload');
  }
  if (typeof payload.attribute_scope !== 'string' || !payload.attribute_scope.trim()) {
    throw new Error('Invalid attribute_scope');
  }
  if (typeof payload.credential_type !== 'string' || !payload.credential_type.trim()) {
    throw new Error('Invalid credential_type');
  }
  if (typeof payload.merkleTreeDepth !== 'number' || !Number.isFinite(payload.merkleTreeDepth)) {
    throw new Error('Invalid merkleTreeDepth');
  }

  if (typeof raw.proof !== 'string' || raw.proof.length === 0) {
    throw new Error('Invalid proof');
  }
  if (!Array.isArray(raw.publicSignals) || raw.publicSignals.length < 4) {
    throw new Error('Invalid publicSignals');
  }
  if (!raw.publicSignals.every((s) => typeof s === 'string' && s.length > 0)) {
    throw new Error('Invalid publicSignals');
  }

  const [merkleTreeRoot, nullifier, message, scope] = raw.publicSignals as string[];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.proof);
  } catch {
    throw new Error('Invalid proof');
  }

  let semaphore_proof: SemaphoreProofBody;
  if (isSemaphoreWire(parsed)) {
    semaphore_proof = {
      ...parsed,
      merkleTreeRoot: merkleTreeRoot || parsed.merkleTreeRoot,
      nullifier: nullifier || parsed.nullifier,
      message: message || parsed.message,
      scope: scope || parsed.scope,
      merkleTreeDepth: payload.merkleTreeDepth,
    };
  } else if (isPointsTuple(parsed)) {
    semaphore_proof = {
      merkleTreeDepth: payload.merkleTreeDepth,
      merkleTreeRoot,
      nullifier,
      message,
      scope,
      points: parsed,
    };
  } else {
    throw new Error('Invalid proof');
  }

  const body: ZkVerifyRequestBody = {
    attribute_scope: payload.attribute_scope.trim(),
    credential_type: payload.credential_type.trim(),
    semaphore_proof,
  };
  if (typeof payload.issuer_group_id === 'string' && payload.issuer_group_id.trim()) {
    body.issuer_group_id = payload.issuer_group_id.trim();
  }
  return body;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeadersFor(req) });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, req);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
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
    auth: { persistSession: false },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401, req);
  }

  let raw: ZkInsertBody;
  try {
    raw = (await req.json()) as ZkInsertBody;
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, req);
  }

  let verifyBody: ZkVerifyRequestBody;
  try {
    verifyBody = zkInsertBodyToVerifyRequest(raw);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid request';
    return jsonResponse({ error: msg }, 400, req);
  }

  try {
    const result = await verifyAndPersistZkProof(supabaseUrl, serviceKey, user.id, verifyBody);
    return jsonResponse({ id: result.proofId }, 200, req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Verification failed';
    if (msg === 'Nullifier already used') {
      return jsonResponse({ error: msg }, 409, req);
    }
    if (msg === 'Could not record proof' || msg === 'Could not record verified attributes') {
      return jsonResponse({ error: msg }, 500, req);
    }
    // Invalid Semaphore proof and binding failures → 400
    return jsonResponse({ error: msg }, 400, req);
  }
});
