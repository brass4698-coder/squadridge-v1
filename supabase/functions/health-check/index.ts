/**
 * Public health probe for Edge / platform readiness (no JWT).
 * Returns metadata only — never secrets, user ids, or message bodies.
 *
 * GET /functions/v1/health-check
 *   200: { ok: true, service: 'squadridge', ts: ISO, checks: { … } }
 */
import { corsHeadersFor } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const ch = corsHeadersFor(req, { 'Access-Control-Allow-Methods': 'GET, OPTIONS' });
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: ch });
  }
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const hasUrl = Boolean(Deno.env.get('SUPABASE_URL')?.trim());
  const hasAnon = Boolean(
    (Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY'))?.trim(),
  );
  const hasService = Boolean(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim());
  const resendConfigured = Boolean(Deno.env.get('RESEND_API_KEY')?.trim());

  const body = {
    ok: true,
    service: 'squadridge',
    ts: new Date().toISOString(),
    checks: {
      supabase_url: hasUrl,
      anon_or_publishable_key: hasAnon,
      service_role_present: hasService,
      resend_configured: resendConfigured,
    },
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      ...ch,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
});
