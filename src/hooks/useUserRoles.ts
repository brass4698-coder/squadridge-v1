// ============================================================
// useUserRoles — roles array + helpers from context
// ============================================================
import { useAuthContext } from '../contexts/AuthContext';
import { hasRole, hasAnyRole, getHighestPriorityRole } from '../lib/roles';
import type { RoleKey } from '../types/roles';

export function useUserRoles() {
  const { roles, refreshRoles } = useAuthContext();

  return {
    roles,
    refreshRoles,
    hasRole: (role: RoleKey) => hasRole(roles, role),
    hasAnyRole: (allowed: RoleKey[]) => hasAnyRole(roles, allowed),
    highestRole: getHighestPriorityRole(roles),
  };
}
