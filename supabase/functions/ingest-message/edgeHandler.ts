/**
 * ingest-message Edge wrapper — builds Supabase clients from env, then delegates to
 * `processIngestRequest` (pure logic, unit-tested in `processIngestMessage.test.ts`).
 * Bundle with `npm run bundle:ingest-message` → `edge.bundle.mjs`.
 */
import { createClient } from '@supabase/supabase-js';

import {
  decodeMessagePayloadAdaptive,
  encodeSecureMessagePayload,
} from '../../../src/lib/crypto/messagePayload';
import { importAes256GcmKeyFromBase64Url } from '../../../src/lib/crypto/messageCrypto';
import { redactOutgoingLiveMessage } from '../../../src/lib/liveMessageRedaction';
import { corsHeadersFor } from '../_shared/cors.ts';
import { processIngestRequest } from './processIngestMessage';

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
  if (res.status === 503 && Deno.env.get('RATE_LIMIT_FAIL_OPEN') === 'true') return;
  if (res.status === 503) throw new Error('Rate limit unavailable');
  if (!res.ok) throw new Error('Rate limit check failed');
}

export default async function ingestMessageHandler(req: Request): Promise<Response> {
  const ch = corsHeadersFor(req);

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

  const userSupabase = createClient(supabaseUrl, anonKey, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
    auth: { persistSession: false },
  });
  const adminSupabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return processIngestRequest(req, {
    cors: ch,
    userSupabase,
    adminSupabase,
    redact: redactOutgoingLiveMessage,
    decode: decodeMessagePayloadAdaptive,
    encode: encodeSecureMessagePayload,
    importKey: importAes256GcmKeyFromBase64Url,
    rateLimit: assertEdgeRateLimit,
  });
}
