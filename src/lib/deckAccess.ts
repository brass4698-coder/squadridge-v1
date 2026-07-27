import { supabase } from './supabase';
import { logWarn, safeErrorMessage } from './log';

export async function checkDeckAccess(): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_deck_access');
  if (error) {
    logWarn('deck_access.check_failed', {
      feature: 'deck_access',
      error_message: safeErrorMessage(error),
    });
    return false;
  }
  return data === true;
}

export async function redeemDeckInvite(
  token: string,
): Promise<{ ok: boolean; error?: string; audience_scopes?: string[] }> {
  const { data, error } = await supabase.rpc('redeem_deck_invite', {
    p_token: token.trim(),
  });
  if (error) return { ok: false, error: error.message };
  const row = data as { ok?: boolean; error?: string; audience_scopes?: string[] };
  if (!row?.ok) return { ok: false, error: row?.error ?? 'REDEEM_FAILED' };
  return { ok: true, audience_scopes: row.audience_scopes };
}

export async function issueDeckInvite(input: {
  email: string;
  audienceScopes: string[];
  label?: string;
  expiresHours?: number;
}): Promise<{ ok: boolean; token?: string; error?: string }> {
  const { data, error } = await supabase.rpc('issue_deck_invite', {
    p_email: input.email,
    p_audience_scopes: input.audienceScopes,
    p_label: input.label ?? null,
    p_expires_hours: input.expiresHours ?? 168,
  });
  if (error) return { ok: false, error: error.message };
  const row = data as { ok?: boolean; token?: string; error?: string };
  if (!row?.ok) return { ok: false, error: row?.error ?? 'ISSUE_FAILED' };
  return { ok: true, token: row.token };
}
