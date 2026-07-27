/**
 * Session participant invite / review-link email scaffold.
 *
 * POST /functions/v1/send-session-invite
 * Authorization: Bearer <facilitator JWT>
 * Body: {
 *   participant_id: string (uuid),
 *   to_email: string,
 *   link_kind?: 'invite' | 'review'  // default 'invite'
 * }
 *
 * Behavior:
 * - Verifies caller owns the participant's session (facilitator_id).
 * - Builds `/p/invite/:token` or `/p/review/:token` from SITE_URL / VITE_SITE_URL.
 * - If RESEND_API_KEY is set: attempts send via Resend; returns delivery: 'email'.
 * - If RESEND_API_KEY is unset: returns delivery: 'manual' + url for copy/paste fallback.
 *   Does NOT claim email was sent.
 *
 * Never logs the recipient email or invite token. Never persists plaintext email.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersFor } from '../_shared/cors.ts';
import { logError, logInfo, safeErrorMessage } from '../_shared/log.ts';

type LinkKind = 'invite' | 'review';

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

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function siteOrigin(): string {
  const raw = Deno.env.get('SITE_URL')?.trim() || Deno.env.get('VITE_SITE_URL')?.trim() || '';
  return raw.replace(/\/$/, '');
}

function buildLink(kind: LinkKind, token: string, origin: string): string {
  const path =
    kind === 'review'
      ? `/p/review/${encodeURIComponent(token)}`
      : `/p/invite/${encodeURIComponent(token)}`;
  return `${origin}${path}`;
}

async function assertEdgeRateLimit(jwt: string): Promise<'ok' | 'limited' | 'skip'> {
  const rawUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  if (!rawUrl || !anonKey) return 'skip';
  const baseUrl = rawUrl.replace(/\/$/, '');
  try {
    const res = await fetch(`${baseUrl}/functions/v1/rate-limit`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        apikey: anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'send_session_invite' }),
    });
    if (res.status === 429) return 'limited';
    if (res.status === 503) return 'skip';
    if (!res.ok) return 'skip';
    return 'ok';
  } catch {
    return 'skip';
  }
}

async function sendViaResend(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY')?.trim();
  if (!apiKey) return { ok: false, error: 'resend_not_configured' };

  const from = Deno.env.get('RESEND_FROM_EMAIL')?.trim() || 'SquadRidge <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      text: opts.text,
    }),
  });

  if (!res.ok) {
    return { ok: false, error: `resend_http_${res.status}` };
  }
  return { ok: true };
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
  const jwt = authHeader.slice('Bearer '.length).trim();

  const rate = await assertEdgeRateLimit(jwt);
  if (rate === 'limited') {
    return jsonResponse(429, { error: 'Too many requests' }, ch);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) {
    return jsonResponse(401, { error: 'Unauthorized' }, ch);
  }

  let participantId = '';
  let toEmail = '';
  let linkKind: LinkKind = 'invite';
  try {
    const body = (await req.json()) as {
      participant_id?: unknown;
      to_email?: unknown;
      link_kind?: unknown;
    };
    if (typeof body.participant_id === 'string') participantId = body.participant_id.trim();
    if (typeof body.to_email === 'string') toEmail = body.to_email.trim().toLowerCase();
    if (body.link_kind === 'review' || body.link_kind === 'invite') linkKind = body.link_kind;
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' }, ch);
  }

  if (!participantId || !isEmail(toEmail)) {
    return jsonResponse(400, { error: 'participant_id and valid to_email required' }, ch);
  }

  const origin = siteOrigin();
  if (!origin) {
    return jsonResponse(
      503,
      {
        error: 'SITE_URL not configured',
        delivery: 'manual',
        hint: 'Set SITE_URL (or VITE_SITE_URL) on Edge secrets, or copy the invite link from the console.',
      },
      ch,
    );
  }

  // Facilitator-scoped read via RLS (anon client + user JWT).
  const { data: row, error: rowErr } = await userClient
    .from('participants')
    .select('id, invite_token, session_id, sessions!inner(id, facilitator_id, title)')
    .eq('id', participantId)
    .maybeSingle();

  if (rowErr) {
    logError('send_session_invite_lookup_failed', {
      function: 'send-session-invite',
      message: safeErrorMessage(rowErr),
    });
    return jsonResponse(500, { error: 'Lookup failed' }, ch);
  }
  if (!row?.invite_token) {
    return jsonResponse(404, { error: 'Participant not found' }, ch);
  }

  const sessions = row.sessions as
    | { id: string; facilitator_id: string; title: string }
    | {
        id: string;
        facilitator_id: string;
        title: string;
      }[];
  const session = Array.isArray(sessions) ? sessions[0] : sessions;
  if (!session || session.facilitator_id !== user.id) {
    return jsonResponse(403, { error: 'Forbidden' }, ch);
  }

  const url = buildLink(linkKind, row.invite_token, origin);
  const subject =
    linkKind === 'review'
      ? `Review the decision memo — ${session.title}`
      : `You're invited to a SquadRidge session — ${session.title}`;
  const text =
    linkKind === 'review'
      ? `Please review and approve or dispute the decision memo for “${session.title}”.\n\nOpen your private review link:\n${url}\n\nThis link is a bearer secret. Do not forward it on insecure channels.`
      : `You have been invited to a facilitated session: “${session.title}”.\n\nOpen your private invite link:\n${url}\n\nThis link is a bearer secret. Do not forward it on insecure channels.`;

  const resendKey = Deno.env.get('RESEND_API_KEY')?.trim();
  if (!resendKey) {
    logInfo('send_session_invite_manual_fallback', {
      function: 'send-session-invite',
      link_kind: linkKind,
    });
    return jsonResponse(
      200,
      {
        ok: true,
        delivery: 'manual',
        url,
        message:
          'Email provider not configured. Copy the link and share it out of band. Set RESEND_API_KEY to enable delivery.',
      },
      ch,
    );
  }

  const sent = await sendViaResend({ to: toEmail, subject, text });
  if (!sent.ok) {
    logError('send_session_invite_resend_failed', {
      function: 'send-session-invite',
      message: sent.error,
    });
    return jsonResponse(
      200,
      {
        ok: true,
        delivery: 'manual',
        url,
        message: 'Email send failed. Copy the link and share it out of band.',
        provider_error: sent.error,
      },
      ch,
    );
  }

  logInfo('send_session_invite_sent', {
    function: 'send-session-invite',
    link_kind: linkKind,
  });

  return jsonResponse(
    200,
    {
      ok: true,
      delivery: 'email',
      message: 'Invite email accepted by provider.',
    },
    ch,
  );
});
