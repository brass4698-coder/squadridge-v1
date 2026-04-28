/**
 * Shared Semaphore verification + DB persistence for `verify-zk-proof`.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersFor } from './cors.ts';
import { logError, safeErrorMessage } from './log.ts';
import { semaphoreFieldFromLabel } from './semaphoreFieldEncoding.ts';
import { verifySemaphoreProof } from './verifySemaphoreProof.ts';

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
  /**
   * Optional: when set, the Edge handler enforces that
   *   `semaphore_proof.merkleTreeRoot === issuer_groups.current_root`
   * for the named issuer group (RFC: rfc-issuer-managed-anonymity-group).
   * When omitted, the proof is accepted with whatever root the prover used —
   * this is the legacy demo / bundled-decoy path and is intended for staging only.
   */
  issuer_group_id?: string;
};

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
  if (proof.message !== semaphoreFieldFromLabel(attributeScope)) {
    throw new Error('Proof message does not match attribute_scope');
  }
  if (proof.scope !== semaphoreFieldFromLabel(credentialType)) {
    throw new Error('Proof scope does not match credential_type');
  }
}

function zkFailBody(
  message: string,
  errorCode: string,
): { ok: false; error: string; errorCode: string } {
  return { ok: false, error: message, errorCode };
}

function zkErrorCodeForMessage(msg: string): string {
  switch (msg) {
    case 'Nullifier already used':
      return 'NULLIFIER_REUSE';
    case 'Invalid Semaphore proof':
      return 'INVALID_SEMAPHORE_PROOF';
    case 'Proof message does not match attribute_scope':
    case 'Proof scope does not match credential_type':
      return 'PROOF_BINDING_MISMATCH';
    case 'Could not record proof':
    case 'Could not record verified attributes':
      return 'SERVER_WRITE_FAILED';
    case 'Invalid attribute_scope':
    case 'Invalid credential_type':
    case 'Invalid semaphore_proof':
    case 'Invalid issuer_group_id':
      return 'INVALID_REQUEST';
    case 'Issuer group not enrolled':
      return 'ISSUER_NOT_ENROLLED';
    case 'Stale proof root':
      return 'STALE_PROOF_ROOT';
    default:
      return 'VERIFICATION_FAILED';
  }
}

interface IssuerGroupRow {
  group_id: string;
  current_root: string;
}

/**
 * Look up the enrolled issuer group and assert the proof's Merkle root matches
 * the issuer's current published root. Returns the row (for persistence) on
 * success; throws otherwise. Manifest *refetching* (when the cached root has
 * expired) is intentionally out of scope for v1: the migration column
 * `current_root_expires_at` is in place so a follow-up Edge cron can refresh
 * the row server-side. For now, an expired cache fails closed with
 * `Stale proof root`, which clients can surface as "issuer manifest needs
 * refresh — try again shortly".
 */
async function assertIssuerRootOrThrow(
  supabaseUrl: string,
  serviceKey: string,
  issuerGroupId: string,
  proofRoot: string,
): Promise<IssuerGroupRow> {
  const admin = createClient(supabaseUrl, serviceKey);
  const { data, error } = await admin
    .from('issuer_groups')
    .select('group_id, current_root, current_root_expires_at')
    .eq('group_id', issuerGroupId)
    .maybeSingle();
  if (error) {
    logError('issuer_groups_lookup_failed', {
      function: 'handleZkProofVerification',
      error_code: error.code ?? null,
      error_message: safeErrorMessage(new Error(error.message)),
    });
    throw new Error('Issuer group not enrolled');
  }
  if (!data) {
    throw new Error('Issuer group not enrolled');
  }
  const expiresAt = Date.parse(String(data.current_root_expires_at));
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    throw new Error('Stale proof root');
  }
  if (proofRoot !== data.current_root) {
    throw new Error('Stale proof root');
  }
  return { group_id: data.group_id, current_root: data.current_root };
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

  const ok = await verifySemaphoreProof(semaphore_proof);
  if (!ok) {
    throw new Error('Invalid Semaphore proof');
  }

  assertProofMatchesRequest(semaphore_proof, attribute_scope, credential_type);

  // Issuer-managed anonymity group enforcement (RFC: rfc-issuer-managed-anonymity-group).
  // When the request declares an issuer_group_id, refuse the proof unless its
  // Merkle root matches the issuer's current published root. Without this the
  // client could pick its own group of {user, decoy_*} and the issuer story is
  // decorative.
  let issuerGroupId: string | null = null;
  if (typeof body.issuer_group_id === 'string' && body.issuer_group_id.trim().length > 0) {
    const trimmed = body.issuer_group_id.trim();
    if (trimmed.length > 200) {
      throw new Error('Invalid issuer_group_id');
    }
    const row = await assertIssuerRootOrThrow(
      supabaseUrl,
      serviceKey,
      trimmed,
      semaphore_proof.merkleTreeRoot,
    );
    issuerGroupId = row.group_id;
  }

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
    issuer_group_id: issuerGroupId,
  });

  if (zkErr) {
    if (zkErr.code === '23505') {
      throw new Error('Nullifier already used');
    }
    logError('zk_proof_submissions_insert_failed', {
      function: 'handleZkProofVerification',
      error_code: zkErr.code ?? null,
      error_message: safeErrorMessage(new Error(zkErr.message)),
    });
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
    logError('verified_attributes_upsert_failed', {
      function: 'handleZkProofVerification',
      error_code: attrErr.code ?? null,
      error_message: safeErrorMessage(new Error(attrErr.message)),
    });
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
    return jsonResponse(zkFailBody('Method not allowed', 'METHOD_NOT_ALLOWED'), 405, req);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return jsonResponse(zkFailBody('Server configuration error', 'SERVER_CONFIG'), 500, req);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse(zkFailBody('Missing or invalid authorization', 'MISSING_AUTH'), 401, req);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) {
    return jsonResponse(zkFailBody('Unauthorized', 'UNAUTHORIZED'), 401, req);
  }

  let body: ZkVerifyRequestBody;
  try {
    body = (await req.json()) as ZkVerifyRequestBody;
  } catch {
    return jsonResponse(zkFailBody('Invalid JSON', 'INVALID_JSON'), 400, req);
  }

  try {
    const result = await verifyAndPersistZkProof(supabaseUrl, serviceKey, user.id, body);
    return jsonResponse(
      {
        ok: true,
        proof: {
          proofId: result.proofId,
          credentialType: result.credentialType,
          nullifierHash: result.nullifierHash,
          commitment: result.commitment,
          verifiedAt: result.verifiedAt,
          isStub: false,
        },
      },
      200,
      req,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Verification failed';
    const code = zkErrorCodeForMessage(msg);
    const bodyErr = zkFailBody(msg, code);
    if (msg === 'Nullifier already used') {
      return jsonResponse(bodyErr, 409, req);
    }
    if (msg === 'Could not record proof' || msg === 'Could not record verified attributes') {
      return jsonResponse(bodyErr, 500, req);
    }
    return jsonResponse(bodyErr, 400, req);
  }
}
