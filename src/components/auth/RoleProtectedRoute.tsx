import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SessionLoader } from './SessionLoader';
import type { RoleKey } from '../../types/roles';
import { hasAnyRole } from '../../lib/roles';
import { getDemoRoleOverride } from '../../demo/demoRoleSwitcher';
import { isDemoSquadShortcutsEnabled } from '../../lib/env';

interface RoleProtectedRouteProps {
  /** Roles allowed to view this route. Empty / omitted = any authenticated user. */
  allowedRoles?: RoleKey[];
  /**
   * When true (default), users with no assigned roles may pass in DEV / demo
   * so local tooling and the demo catalog remain reachable.
   */
  allowEmptyRolesInDev?: boolean;
}

/**
 * Auth gate that also checks role membership.
 * Demo role override (sessionStorage) is honored only as chrome/workspace access —
 * never treated as production identity.
 */
export function RoleProtectedRoute({
  allowedRoles,
  allowEmptyRolesInDev = true,
}: RoleProtectedRouteProps) {
  const { user, roles, loading, initialized } = useAuth();
  const location = useLocation();

  if (!initialized || loading) return <SessionLoader />;
  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    return <Outlet />;
  }

  const demoOverride = getDemoRoleOverride();
  const effectiveRoles = demoOverride
    ? [
        ...roles,
        {
          role_key: demoOverride,
          workspace_id: null,
          institution_id: null,
          granted_at: new Date(0).toISOString(),
        },
      ]
    : roles;

  const allowed = hasAnyRole(effectiveRoles, allowedRoles);
  const emptyOk =
    allowEmptyRolesInDev && effectiveRoles.length === 0 && isDemoSquadShortcutsEnabled();

  if (!allowed && !emptyOk) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}
