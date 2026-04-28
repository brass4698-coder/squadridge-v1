/**
 * ingest-message Edge — decrypt → server redact (`redactOutgoingLiveMessage`) → re-encrypt → insert (service_role).
 * Bundle with `npm run bundle:ingest-message` → `edge.bundle.mjs`.
 */
import { createClient } from '@supabase/supabase-js';

import {
  decodeMessagePayloadAdaptive,
  encodeSecureMessagePayload,
} from '../../../src/lib/messagePayload';
import { importAes256GcmKeyFromBase64Url } from '../../../src/lib/messageCrypto';
import { redactOutgoingLiveMessage } from '../../../src/lib/liveMessageRedaction';
import { corsHeadersFor } from '../_shared/cors.ts';

async function assertEdgeRateLimit(jwt: string, action: string): Promise<void> {
  const rawUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  if (!rawUrl || !anonKey) return;
  const baseUrl = rawUrl.replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/functions/v1/rate-limit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action }),
  });
  if (res.status === 429) {
    const ra = res.headers.get('retry-after');
    const hint =
      ra && /^\d+$/.test(ra.trim())
        ? ` Try again in about ${ra.trim()} seconds.`
        : ' Try again shortly.';
    throw new Error(`You’re sending requests too quickly.${hint}`);
  }
  if (res.status === 503) return;
  if (!res.ok) throw new Error('Rate limit check failed');
}

export default async function ingestMessageHandler(req: Request): Promise<Response> {
  const ch = corsHeadersFor(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: ch });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authHeader = req.headers.get('Authorization');

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const userSb = createClient(supabaseUrl, anonKey, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
    auth: { persistSession: false },
  });

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }
  const jwt = authHeader.slice(7).trim();

  const {
    data: { user },
    error: userErr,
  } = await userSb.auth.getUser();
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }
  const b = body as { squad_id?: string; payload_ciphertext?: string };
  const squadId = typeof b?.squad_id === 'string' ? b.squad_id.trim() : '';
  const payloadCiphertext = typeof b?.payload_ciphertext === 'string' ? b.payload_ciphertext : '';
  if (!squadId || !payloadCiphertext.length) {
    return new Response(JSON.stringify({ error: 'Missing squad_id or payload_ciphertext' }), {
      status: 400,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  try {
    await assertEdgeRateLimit(jwt, 'messages_insert');
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Rate limited';
    return new Response(JSON.stringify({ error: msg }), {
      status: 429,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: memb, error: membErr } = await userSb
    .from('squad_members')
    .select('user_id')
    .eq('squad_id', squadId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (membErr || !memb) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const { data: squadRow, error: squadErr } = await userSb
    .from('squads')
    .select('message_encryption_key, archived_at')
    .eq('id', squadId)
    .single();

  if (squadErr || !squadRow?.message_encryption_key) {
    return new Response(JSON.stringify({ error: 'Squad unavailable' }), {
      status: 400,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }
  if (squadRow.archived_at != null) {
    return new Response(JSON.stringify({ error: 'Squad archived' }), {
      status: 403,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  let aesKey: CryptoKey;
  try {
    aesKey = await importAes256GcmKeyFromBase64Url(squadRow.message_encryption_key);
  } catch {
    return new Response(JSON.stringify({ error: 'Encryption key unavailable' }), {
      status: 500,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const plain = await decodeMessagePayloadAdaptive(payloadCiphertext, aesKey);

  let redacted: string;
  try {
    redacted = await redactOutgoingLiveMessage(plain, squadId, user.id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Redaction failed';
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  let ciphertextOut: string;
  try {
    ciphertextOut = await encodeSecureMessagePayload(redacted, aesKey);
  } catch {
    return new Response(JSON.stringify({ error: 'Could not encrypt message' }), {
      status: 500,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const { data: inserted, error: insErr } = await admin
    .from('messages')
    .insert({
      squad_id: squadId,
      sender_id: user.id,
      payload_ciphertext: ciphertextOut,
    })
    .select('*')
    .single();

  if (insErr) {
    return new Response(JSON.stringify({ error: insErr.message, code: insErr.code }), {
      status: 400,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ message: inserted }), {
    status: 200,
    headers: { ...ch, 'Content-Type': 'application/json' },
  });
}
