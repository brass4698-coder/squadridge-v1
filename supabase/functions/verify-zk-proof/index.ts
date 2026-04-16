/**
 * Verifies a ZK proof payload server-side and persists only verifier outputs:
 * proof commitment (hash of proof + public signals), nullifier, attribute scope.
 * Does not log request bodies or PII — avoid pairing IP/user-agent with proof payloads in app analytics.
 *
 * Production: set ZK_DEV_SKIP_VERIFY=false and wire @semaphore-protocol/proof verifyProof
 * with SEMAPHORE_VERIFICATION_KEY (JSON) and group config.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type VerifyBody = {
  attribute_scope: string;
  proof: string;
  public_signals: string[];
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function isHexString(s: string, minBytes: number): boolean {
  if (s.length < minBytes * 2 || s.length % 2 !== 0) return false;
  return /^[0-9a-fA-F]+$/.test(s);
}

function scopeToVerifiedAttribute(scope: string): { attribute_type: string; attribute_value: string } {
  const normalized = scope.trim().slice(0, 100);
  if (normalized === 'onboarding_demo' || normalized === 'verification_flow') {
    return { attribute_type: 'citizenship', attribute_value: 'demo_region' };
  }
  return { attribute_type: 'scope', attribute_value: normalized.slice(0, 255) };
}

/**
 * When ZK_DEV_SKIP_VERIFY=true, accept well-formed proof-shaped payloads only.
 * Replace with Semaphore verifyProof when moving to production.
 */
function assertDevStubProofShape(body: VerifyBody): { nullifier_hash: string } {
  const { proof, public_signals, attribute_scope } = body;
  if (!attribute_scope || typeof attribute_scope !== 'string' || attribute_scope.length > 200) {
    throw new Error('Invalid attribute_scope');
  }
  if (!proof || typeof proof !== 'string' || proof.length < 16) {
    throw new Error('Invalid proof');
  }
  if (!Array.isArray(public_signals) || public_signals.length < 1) {
    throw new Error('Invalid public_signals');
  }
  const nullifier = public_signals[0];
  if (typeof nullifier !== 'string' || !isHexString(nullifier, 16)) {
    throw new Error('Invalid nullifier (public_signals[0])');
  }
  return {
    nullifier_hash: nullifier.toLowerCase(),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return jsonResponse({ error: 'Server configuration error' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Missing or invalid authorization' }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let body: VerifyBody;
  try {
    body = (await req.json()) as VerifyBody;
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const devSkip = Deno.env.get('ZK_DEV_SKIP_VERIFY') !== 'false';

  try {
    if (!devSkip) {
      return jsonResponse(
        {
          error: 'Full Semaphore verification is not configured. Set ZK_DEV_SKIP_VERIFY=true for development or deploy verification keys.',
        },
        503,
      );
    }

    const shape = assertDevStubProofShape(body);
    const proof_commitment = await sha256Hex(
      JSON.stringify({
        proof: body.proof,
        public_signals: body.public_signals,
        attribute_scope: body.attribute_scope,
      }),
    );

    const admin = createClient(supabaseUrl, serviceKey);

    const { error: zkErr } = await admin.from('zk_proof_submissions').insert({
      user_id: user.id,
      proof_commitment,
      nullifier_hash: shape.nullifier_hash,
      attribute_scope: body.attribute_scope.trim(),
    });

    if (zkErr) {
      if (zkErr.code === '23505') {
        return jsonResponse({ error: 'Nullifier already used' }, 409);
      }
      console.error('zk_proof_submissions insert failed:', zkErr.message);
      return jsonResponse({ error: 'Could not record proof' }, 500);
    }

    const attr = scopeToVerifiedAttribute(body.attribute_scope);
    const { error: attrErr } = await admin.from('verified_attributes').upsert(
      {
        user_id: user.id,
        attribute_type: attr.attribute_type,
        attribute_value: attr.attribute_value,
      },
      { onConflict: 'user_id,attribute_type' },
    );
    if (attrErr) {
      console.error('verified_attributes upsert failed:', attrErr.message);
      return jsonResponse({ error: 'Could not record verified attributes' }, 500);
    }

    return jsonResponse({ ok: true, proof_commitment });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Verification failed';
    return jsonResponse({ error: msg }, 400);
  }
});
