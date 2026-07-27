// ============================================================
// SquadRidge Role helpers
// ============================================================
import { supabase } from './supabase';
import type { UserRole, RoleKey } from '../types/roles';
import { ROLE_PRIORITY, ROLE_DASHBOARD_MAP } from '../types/roles';
import { logError, safeErrorMessage } from './log';

export async function fetchUserRoles(userId?: string): Promise<UserRole[]> {
  const { data, error } = await supabase.rpc('get_effective_user_roles', {
    p_user_id: userId ?? null,
  });

  if (error) {
    logError('roles.fetch_failed', {
      feature: 'roles',
      error_message: safeErrorMessage(error),
    });
    return [];
  }
  return (data ?? []) as UserRole[];
}

// ------------------------------------------------------------
// Admin role-management helpers — wrap the SECURITY DEFINER RPCs added in
// `supabase/migrations/20260703_001_role_management_rpcs.sql`. Non-admin
// callers get filtered results (list) or an error response (grant/revoke).
// ------------------------------------------------------------

export interface UserWithRoles {
  user_id: string;
  email: string | null;
  display_name: string | null;
  status: string;
  primary_role: string | null;
  onboarding_completed: boolean;
  created_at: string;
  roles: Array<{
    role_key: string;
    workspace_id: string | null;
    institution_id: string | null;
    granted_at: string;
    granted_by: string | null;
  }>;
}

export interface RoleMutationScope {
  workspaceId?: string | null;
  institutionId?: string | null;
}

export async function listUsersWithRoles(
  options: { limit?: number; offset?: number } = {},
): Promise<UserWithRoles[]> {
  const { data, error } = await supabase.rpc('list_users_with_roles', {
    p_limit: options.limit ?? 100,
    p_offset: options.offset ?? 0,
  });
  if (error) {
    logError('roles.list_users_failed', {
      feature: 'roles',
      error_message: safeErrorMessage(error),
    });
    return [];
  }
  return (data ?? []) as UserWithRoles[];
}

export async function grantRoleToUser(
  targetUserId: string,
  roleKey: RoleKey,
  scope: RoleMutationScope = {},
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('grant_role_to_user', {
    p_target_user_id: targetUserId,
    p_role_key: roleKey,
    p_workspace_id: scope.workspaceId ?? null,
    p_institution_id: scope.institutionId ?? null,
  });
  if (error) return { success: false, error: error.message };
  const payload = data as { success?: boolean } | null;
  return { success: payload?.success === true };
}

export async function revokeRoleFromUser(
  targetUserId: string,
  roleKey: RoleKey,
  scope: RoleMutationScope = {},
): Promise<{ success: boolean; reason?: string; error?: string }> {
  const { data, error } = await supabase.rpc('revoke_role_from_user', {
    p_target_user_id: targetUserId,
    p_role_key: roleKey,
    p_workspace_id: scope.workspaceId ?? null,
    p_institution_id: scope.institutionId ?? null,
  });
  if (error) return { success: false, error: error.message };
  const payload = (data ?? {}) as { success?: boolean; reason?: string };
  return { success: payload.success === true, reason: payload.reason };
}

export function getHighestPriorityRole(roles: UserRole[]): RoleKey | null {
  for (const key of ROLE_PRIORITY) {
    if (roles.some((r) => r.role_key === key)) return key;
  }
  return null;
}

export function getDashboardForRole(role: RoleKey): string {
  return ROLE_DASHBOARD_MAP[role] ?? '/app';
}

export function hasRole(roles: UserRole[], role: RoleKey): boolean {
  return roles.some((r) => r.role_key === role);
}

export function hasAnyRole(roles: UserRole[], allowed: RoleKey[]): boolean {
  return allowed.some((a) => hasRole(roles, a));
}
