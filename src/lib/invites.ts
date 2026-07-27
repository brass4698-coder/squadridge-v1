// ============================================================
// SquadRidge Invite helpers
// ============================================================
import { supabase } from './supabase';
import type { InviteValidationResult, CreateInviteParams, Invite } from '../types/invites';
import { logError, safeErrorMessage } from './log';

export async function validateInviteToken(token: string): Promise<InviteValidationResult> {
  const { data, error } = await supabase.rpc('validate_invite_token', {
    p_token: token,
  });
  if (error) {
    logError('invites.validate_failed', {
      feature: 'invites',
      error_message: safeErrorMessage(error),
    });
    return { valid: false, reason: 'not_found' };
  }
  return data as InviteValidationResult;
}

export async function acceptInvite(
  token: string,
  userId: string,
  displayName: string,
): Promise<{ success: boolean; dashboard?: string; error?: string }> {
  const { data, error } = await supabase.rpc('accept_invite', {
    p_token: token,
    p_user_id: userId,
    p_display_name: displayName,
  });
  if (error) return { success: false, error: error.message };
  const payload = data as Record<string, unknown>;
  if (payload.valid === false) {
    return { success: false, error: String(payload.reason ?? 'invalid_invite') };
  }
  return data as { success: boolean; dashboard: string };
}

export async function createInvite(
  params: CreateInviteParams,
): Promise<{ success: boolean; token?: string; invite_id?: string; error?: string }> {
  const { data, error } = await supabase.rpc('create_invite', {
    p_email: params.email,
    p_invite_type: params.invite_type,
    p_role_key: params.role_key,
    p_institution_id: params.institution_id ?? null,
    p_workspace_id: params.workspace_id ?? null,
    p_expires_hours: params.expires_hours ?? 72,
    p_metadata: params.metadata ?? {},
  });
  if (error) return { success: false, error: error.message };
  return data as { success: boolean; token: string; invite_id: string };
}

export async function revokeInvite(
  inviteId: string,
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('revoke_invite', {
    p_invite_id: inviteId,
  });
  if (error) return { success: false, error: error.message };
  return data as { success: boolean };
}

export async function listInvites(): Promise<Invite[]> {
  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    logError('invites.list_failed', {
      feature: 'invites',
      error_message: safeErrorMessage(error),
    });
    return [];
  }
  return (data ?? []) as Invite[];
}
