/**
 * Pure, dependency-injected ingest-message logic. The Deno wrapper in `edgeHandler.ts`
 * is a thin adapter that builds these deps from `Deno.env` + Supabase clients; tests
 * import this module directly and supply mocks (no Deno / no `_shared/cors.ts` import).
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export interface IngestDeps {
  cors: Record<string, string>;
  userSupabase: SupabaseClient;
  adminSupabase: SupabaseClient;
  redact: (body: string, squadId: string, userId: string) => Promise<string>;
  decode: (cipher: string, key: CryptoKey) => Promise<string>;
  encode: (plain: string, key: CryptoKey) => Promise<string>;
  importKey: (b64u: string) => Promise<CryptoKey>;
  /** Optional: throws on 429 / non-OK rate limit response. */
  rateLimit?: (jwt: string, action: string) => Promise<void>;
}

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
  ch: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...ch, 'Content-Type': 'application/json' },
  });
}

export async function processIngestRequest(req: Request, deps: IngestDeps): Promise<Response> {
  const { cors: ch } = deps;

  if (req.method === 'OPTIONS') return new Response('ok', { headers: ch });
  if (req.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed' }, ch);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return jsonResponse(401, { error: 'Unauthorized' }, ch);
  const jwt = authHeader.slice(7).trim();

  const {
    data: { user },
    error: userErr,
  } = await deps.userSupabase.auth.getUser();
  if (userErr || !user) return jsonResponse(401, { error: 'Unauthorized' }, ch);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' }, ch);
  }
  const b = body as { squad_id?: string; payload_ciphertext?: string };
  const squadId = typeof b?.squad_id === 'string' ? b.squad_id.trim() : '';
  const payloadCiphertext = typeof b?.payload_ciphertext === 'string' ? b.payload_ciphertext : '';
  if (!squadId || !payloadCiphertext.length) {
    return jsonResponse(400, { error: 'Missing squad_id or payload_ciphertext' }, ch);
  }

  if (deps.rateLimit) {
    try {
      await deps.rateLimit(jwt, 'messages_insert');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Rate limited';
      return jsonResponse(429, { error: msg }, ch);
    }
  }

  const { data: memb, error: membErr } = await deps.userSupabase
    .from('squad_members')
    .select('user_id')
    .eq('squad_id', squadId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (membErr || !memb) return jsonResponse(403, { error: 'Forbidden' }, ch);

  const { data: squadRow, error: squadErr } = await deps.userSupabase
    .from('squads')
    .select('message_encryption_key, archived_at')
    .eq('id', squadId)
    .single();
  if (squadErr || !squadRow?.message_encryption_key) {
    return jsonResponse(400, { error: 'Squad unavailable' }, ch);
  }
  if (squadRow.archived_at != null) return jsonResponse(403, { error: 'Squad archived' }, ch);

  let aesKey: CryptoKey;
  try {
    aesKey = await deps.importKey(squadRow.message_encryption_key);
  } catch {
    return jsonResponse(500, { error: 'Encryption key unavailable' }, ch);
  }

  const plain = await deps.decode(payloadCiphertext, aesKey);

  let redacted: string;
  try {
    redacted = await deps.redact(plain, squadId, user.id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Redaction failed';
    return jsonResponse(400, { error: msg }, ch);
  }

  let ciphertextOut: string;
  try {
    ciphertextOut = await deps.encode(redacted, aesKey);
  } catch {
    return jsonResponse(500, { error: 'Could not encrypt message' }, ch);
  }

  const { data: inserted, error: insErr } = await deps.adminSupabase
    .from('messages')
    .insert({ squad_id: squadId, sender_id: user.id, payload_ciphertext: ciphertextOut })
    .select('*')
    .single();

  if (insErr) {
    return jsonResponse(400, { error: insErr.message, code: insErr.code }, ch);
  }

  return jsonResponse(200, { message: inserted }, ch);
}
