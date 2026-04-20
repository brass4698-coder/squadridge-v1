/**
 * Target for Database Webhooks (or custom POST) when `match_queue` rows change.
 * Set MATCH_QUEUE_WEBHOOK_SECRET in Edge secrets; send the same value as header `x-match-queue-secret`.
 * Does not send email by default — logs payload for observability; extend to Resend/SMS as needed.
 */
import { corsHeadersFor } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const ch = corsHeadersFor(req, { 'Access-Control-Allow-Methods': 'POST, OPTIONS' });
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: ch });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const expected = Deno.env.get('MATCH_QUEUE_WEBHOOK_SECRET')?.trim();
  if (!expected) {
    return new Response(JSON.stringify({ error: 'MATCH_QUEUE_WEBHOOK_SECRET not configured' }), {
      status: 503,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const sent = req.headers.get('x-match-queue-secret')?.trim();
  if (sent !== expected) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = { raw: await req.text() };
  }

  console.log(JSON.stringify({ tag: 'match_queue_webhook', body }));

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...ch, 'Content-Type': 'application/json' },
  });
});
