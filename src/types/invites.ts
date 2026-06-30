// ============================================================
// SquadRidge Invite Types
// ============================================================

export type InviteType =
  | 'participant'
  | 'facilitator'
  | 'mediator'
  | 'analyst'
  | 'institution_admin'
  | 'observer'
  | 'super_admin';

export type InviteStatus = 'valid' | 'expired' | 'used' | 'revoked' | 'not_found';

export interface Invite {
  id: string;
  email: string;
  token: string;
  invite_type: InviteType;
  role_key: string;
  institution_id: string | null;
  workspace_id: string | null;
  issued_by: string | null;
  expires_at: string;
  used_at: string | null;
  revoked_at: string | null;
  auth_user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface InviteValidationResult {
  valid: boolean;
  reason?: 'not_found' | 'revoked' | 'already_used' | 'expired';
  invite_id?: string;
  email?: string;
  role_key?: string;
  invite_type?: InviteType;
  institution_id?: string;
  workspace_id?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateInviteParams {
  email: string;
  invite_type: InviteType;
  role_key: string;
  institution_id?: string;
  workspace_id?: string;
  expires_hours?: number;
  metadata?: Record<string, unknown>;
}

export interface AccessRequest {
  id: string;
  full_name: string;
  email: string;
  organization: string | null;
  role_requested: string | null;
  use_case: string | null;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
  reviewed_by: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmitAccessRequestParams {
  full_name: string;
  email: string;
  organization?: string;
  role_requested?: string;
  use_case?: string;
}
