/**
 * Target for Database Webhooks (or custom POST) when `match_queue` rows change.
 * Set MATCH_QUEUE_WEBHOOK_SECRET in Edge secrets; send the same value as header `x-match-queue-secret`.
 * Does not send email by default — logs an event tag for observability; extend to Resend/SMS as needed.
 */
import { corsHeadersFor } from '../_shared/cors.ts';
import { logInfo } from '../_shared/log.ts';

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

  // The webhook body can include user ids and queue metadata that we never want
  // surfaced in logs. Emit a fixed-schema event with only a count of fields seen,
  // so operators can see the webhook fired without leaking PII. Extend
  // downstream notifiers (Resend / SMS) to consume `body` directly.
  const fieldCount = body && typeof body === 'object' ? Object.keys(body as object).length : 0;
  logInfo('match_queue_webhook_received', {
    function: 'match-notify',
    count: fieldCount,
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...ch, 'Content-Type': 'application/json' },
  });
});
