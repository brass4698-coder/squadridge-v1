import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export type SessionInviteLinkKind = 'invite' | 'review';

export type SendSessionInviteResult =
  | {
      ok: true;
      delivery: 'email' | 'manual';
      url?: string;
      message?: string;
    }
  | {
      ok: false;
      error_code:
        | 'unauthorized'
        | 'forbidden'
        | 'rate_limited'
        | 'invalid'
        | 'not_found'
        | 'server_error';
      message?: string;
      url?: string;
    };

type InvokeBody = {
  ok?: boolean;
  delivery?: 'email' | 'manual';
  url?: string;
  message?: string;
  error?: string;
  hint?: string;
};

/**
 * Facilitator-only: email a participant invite or review link via Edge Function.
 * When Resend is not configured, the function returns `delivery: 'manual'` + `url`
 * so the UI can fall back to copy/paste. Never claims email sent without provider.
 */
export async function sendSessionInvite(
  supabase: SupabaseClient<Database> | SupabaseClient,
  opts: {
    participantId: string;
    toEmail: string;
    linkKind?: SessionInviteLinkKind;
  },
): Promise<SendSessionInviteResult> {
  try {
    const { data, error } = await supabase.functions.invoke<InvokeBody>('send-session-invite', {
      body: {
        participant_id: opts.participantId,
        to_email: opts.toEmail,
        link_kind: opts.linkKind ?? 'invite',
      },
    });

    if (error) {
      const ctx = error.context as { status?: number } | undefined;
      const status = ctx?.status ?? 0;
      if (status === 401) return { ok: false, error_code: 'unauthorized' };
      if (status === 403) return { ok: false, error_code: 'forbidden' };
      if (status === 404) return { ok: false, error_code: 'not_found' };
      if (status === 429) return { ok: false, error_code: 'rate_limited' };
      if (status >= 400 && status < 500) return { ok: false, error_code: 'invalid' };
      return { ok: false, error_code: 'server_error' };
    }

    if (data?.ok && (data.delivery === 'email' || data.delivery === 'manual')) {
      return {
        ok: true,
        delivery: data.delivery,
        url: typeof data.url === 'string' ? data.url : undefined,
        message: typeof data.message === 'string' ? data.message : undefined,
      };
    }

    return {
      ok: false,
      error_code: 'server_error',
      message: typeof data?.error === 'string' ? data.error : undefined,
      url: typeof data?.url === 'string' ? data.url : undefined,
    };
  } catch {
    return { ok: false, error_code: 'server_error' };
  }
}

export function describeSendSessionInviteResult(r: SendSessionInviteResult): string {
  if (r.ok) {
    if (r.delivery === 'email') return r.message ?? 'Email accepted by provider.';
    return r.message ?? 'Email not configured — use the copy link instead.';
  }
  switch (r.error_code) {
    case 'unauthorized':
      return 'Sign in again to send invites.';
    case 'forbidden':
      return 'You do not have access to send this invite.';
    case 'rate_limited':
      return 'Too many send attempts. Wait a moment and try again.';
    case 'not_found':
      return 'Participant not found for this session.';
    case 'invalid':
      return 'Check the email address and try again.';
    default:
      return r.message ?? 'Could not send. Copy the link and share it out of band.';
  }
}
