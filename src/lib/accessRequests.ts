// ============================================================
// MENDguild Access Request helpers
// ============================================================
import { supabase } from './supabase';
import type { AccessRequest, SubmitAccessRequestParams } from '../types/invites';

export async function submitAccessRequest(
  params: SubmitAccessRequestParams
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('access_requests').insert({
    full_name: params.full_name,
    email: params.email,
    organization: params.organization ?? null,
    role_requested: params.role_requested ?? null,
    use_case: params.use_case ?? null,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function listAccessRequests(): Promise<AccessRequest[]> {
  const { data, error } = await supabase
    .from('access_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[accessRequests] listAccessRequests error', error);
    return [];
  }
  return (data ?? []) as AccessRequest[];
}

export async function approveAccessRequest(
  requestId: string,
  roleKey: string,
  institutionId?: string,
  workspaceId?: string,
  reviewNotes?: string
): Promise<{ success: boolean; invite?: unknown; error?: string }> {
  const { data, error } = await supabase.rpc(
    'approve_access_request_and_issue_invite',
    {
      p_request_id: requestId,
      p_role_key: roleKey,
      p_institution_id: institutionId ?? null,
      p_workspace_id: workspaceId ?? null,
      p_review_notes: reviewNotes ?? null,
    }
  );
  if (error) return { success: false, error: error.message };
  return data as { success: boolean; invite: unknown };
}
