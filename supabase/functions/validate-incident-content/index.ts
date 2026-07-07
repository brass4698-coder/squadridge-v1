/**
 * validate-incident-content Edge Function — pre-flight validation for incident dialogue text.
 *
 * POST /functions/v1/validate-incident-content
 * Authorization: Bearer <user JWT>
 * Body: { body: string }
 *
 * Returns 200 { ok: true } when safe, 400 { error: string } when contact info is detected.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersFor } from '../_shared/cors.ts';

const EMAIL_RE =
  /\b[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+\b/i;
const PHONE_RE =
  /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,6}\b/;
const STREET_RE =
  /\b\d{1,5}\s+[a-z]+(?:\s+[a-z]+){0,2}\s+(?:street|st\.|road|rd\.|avenue|ave\.|boulevard|blvd\.|drive|dr\.|lane|ln\.|court|ct\.)\b/i;

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

function contactInfoError(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return 'Body is required.';
  if (EMAIL_RE.test(trimmed)) {
    return 'Remove email addresses before posting.';
  }
  const phoneMatch = trimmed.match(PHONE_RE);
  if (phoneMatch) {
    const digits = phoneMatch[0].replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 15) {
      return 'Remove phone numbers before posting.';
    }
  }
  if (STREET_RE.test(trimmed)) {
    return 'Remove street addresses before posting.';
  }
  return null;
}

Deno.serve(async (req) => {
  const ch = corsHeadersFor(req, { 'Access-Control-Allow-Methods': 'POST, OPTIONS' });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: ch });
  if (req.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed' }, ch);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  if (!supabaseUrl || !anonKey) {
    return jsonResponse(500, { error: 'Server configuration error' }, ch);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse(401, { error: 'Unauthorized' }, ch);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) return jsonResponse(401, { error: 'Unauthorized' }, ch);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' }, ch);
  }

  const text =
    typeof (body as { body?: unknown }).body === 'string' ? (body as { body: string }).body : '';
  const validationError = contactInfoError(text);
  if (validationError) {
    return jsonResponse(400, { error: validationError }, ch);
  }

  return jsonResponse(200, { ok: true }, ch);
});
