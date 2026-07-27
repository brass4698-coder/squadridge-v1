import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { canAccessRoute } from '../../lib/guards';
import type { RoleKey } from '../../types/roles';
import { UnauthorizedState } from '../auth/UnauthorizedState';

export type RoleGuardProps = {
  children: ReactNode;
  /** Roles that may see children. Empty array denies everyone. */
  allowed: RoleKey[];
  /**
   * When true, render UnauthorizedState inline instead of navigating to /unauthorized.
   * Prefer inline for nested panels; route-level guards may navigate.
   */
  inline?: boolean;
};

/**
 * Client-side role gate (UX only — RLS remains authoritative).
 * Renders a calm 403 state when the caller lacks permission.
 */
export function RoleGuard({ children, allowed, inline = true }: RoleGuardProps) {
  const { roles } = useAuthContext();
  const ok = canAccessRoute(roles, allowed);

  if (!ok) {
    if (inline) return <UnauthorizedState />;
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
