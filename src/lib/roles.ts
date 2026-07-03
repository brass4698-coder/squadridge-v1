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
