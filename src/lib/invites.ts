import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export type ActiveInvite = {
  inviteId: string;
  label: string;
  cohortKey: string | null;
  redeemedAt?: string | null;
  expiresAt?: string | null;
};

export type InviteErrorCode =
  | 'authentication_required'
  | 'invite_required'
  | 'invalid_code'
  | 'invite_disabled'
  | 'invite_expired'
  | 'invite_full'
  | 'server_error';

export type InviteResult =
  | { ok: true; invite: ActiveInvite }
  | { ok: false; errorCode: InviteErrorCode };

function parseInviteResult(data: unknown): InviteResult {
  if (!data || typeof data !== 'object') return { ok: false, errorCode: 'server_error' };
  const value = data as Record<string, unknown>;
  if (value.ok === true && typeof value.invite_id === 'string' && typeof value.label === 'string') {
    return {
      ok: true,
      invite: {
        inviteId: value.invite_id,
        label: value.label,
        cohortKey: typeof value.cohort_key === 'string' ? value.cohort_key : null,
        redeemedAt: typeof value.redeemed_at === 'string' ? value.redeemed_at : null,
        expiresAt: typeof value.expires_at === 'string' ? value.expires_at : null,
      },
    };
  }

  const errorCode = typeof value.error_code === 'string' ? value.error_code : 'server_error';
  return { ok: false, errorCode: normalizeInviteError(errorCode) };
}

function normalizeInviteError(code: string): InviteErrorCode {
  if (
    code === 'authentication_required' ||
    code === 'invite_required' ||
    code === 'invalid_code' ||
    code === 'invite_disabled' ||
    code === 'invite_expired' ||
    code === 'invite_full'
  ) {
    return code;
  }
  return 'server_error';
}

export async function redeemInviteCode(
  supabase: SupabaseClient<Database>,
  code: string,
): Promise<InviteResult> {
  const { data, error } = await supabase.rpc('redeem_invite_code', { p_code: code });
  if (error) return { ok: false, errorCode: 'server_error' };
  return parseInviteResult(data);
}

export async function getMyActiveInvite(supabase: SupabaseClient<Database>): Promise<InviteResult> {
  const { data, error } = await supabase.rpc('get_my_active_invite');
  if (error) return { ok: false, errorCode: 'server_error' };
  return parseInviteResult(data);
}

export function describeInviteResult(result: InviteResult): string {
  if (result.ok) return `Invite accepted: ${result.invite.label}.`;

  switch (result.errorCode) {
    case 'authentication_required':
      return 'Sign in before redeeming an invite.';
    case 'invite_required':
      return 'Enter a valid pilot invite before joining the match queue.';
    case 'invalid_code':
      return 'That invite code was not recognized.';
    case 'invite_disabled':
      return 'That invite has been disabled by the pilot team.';
    case 'invite_expired':
      return 'That invite has expired.';
    case 'invite_full':
      return 'That invite has already reached its redemption limit.';
    case 'server_error':
      return 'Could not verify the invite right now. Try again in a moment.';
  }
}
