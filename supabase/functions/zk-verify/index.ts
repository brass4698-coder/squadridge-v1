/**
 * Verifies a ZK-shaped payload for credentialType + rawInput, persists commitment + nullifier
 * (same model as verify-zk-proof). Dev: stub hashes; production: swap in real prover + Semaphore verifyProof.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type VerifyBody = {
  credentialType: string;
  rawInput: string;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sha256HexBytes(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function scopeToVerifiedAttribute(scope: string): { attribute_type: string; attribute_value: string } {
  const normalized = scope.trim().slice(0, 100);
  if (normalized === 'onboarding_demo' || normalized === 'verification_flow') {
    return { attribute_type: 'citizenship', attribute_value: 'demo_region' };
  }
  return { attribute_type: 'scope', attribute_value: normalized.slice(0, 255) };
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

  const { credentialType, rawInput } = body;
  if (!credentialType || typeof credentialType !== 'string' || credentialType.length > 200) {
    return jsonResponse({ error: 'Invalid credentialType' }, 400);
  }
  if (!rawInput || typeof rawInput !== 'string' || rawInput.trim().length === 0 || rawInput.length > 200) {
    return jsonResponse({ error: 'Invalid rawInput' }, 400);
  }

  const attributeScope = rawInput.trim();
  const devSkip = Deno.env.get('ZK_DEV_SKIP_VERIFY') !== 'false';

  try {
    if (!devSkip) {
      return jsonResponse(
        {
          error:
            'Full Semaphore verification is not configured. Set ZK_DEV_SKIP_VERIFY=true for development or deploy verification keys.',
        },
        503,
      );
    }

    const encoder = new TextEncoder();
    const nullifierData = encoder.encode(`nullifier:${credentialType}:${rawInput}`);
    const commitData = encoder.encode(`commitment:${credentialType}:${Date.now()}`);
    const nullifierHash = await sha256HexBytes(nullifierData);
    const commitment = await sha256HexBytes(commitData);
    const proofId = crypto.randomUUID();
    const verifiedAt = new Date().toISOString();

    const admin = createClient(supabaseUrl, serviceKey);

    const { error: zkErr } = await admin.from('zk_proof_submissions').insert({
      user_id: user.id,
      proof_commitment: commitment,
      nullifier_hash: nullifierHash,
      attribute_scope: attributeScope,
    });

    if (zkErr) {
      if (zkErr.code === '23505') {
        return jsonResponse({ error: 'Nullifier already used' }, 409);
      }
      console.error('zk_proof_submissions insert failed:', zkErr.message);
      return jsonResponse({ error: 'Could not record proof' }, 500);
    }

    const attr = scopeToVerifiedAttribute(attributeScope);
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

    return jsonResponse({
      proofId,
      credentialType,
      nullifierHash,
      commitment,
      verifiedAt,
      isStub: true,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Verification failed';
    return jsonResponse({ error: msg }, 400);
  }
});
