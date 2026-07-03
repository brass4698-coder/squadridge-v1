// ============================================================
// RoleProtectedRoute — enforces role-based access client-side
// NOTE: server-side RLS is the authoritative guard; this is UX only
// ============================================================
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { canAccessRoute } from '../../lib/guards';
import type { RoleKey } from '../../types/roles';

interface Props {
  children: ReactNode;
  allowed: RoleKey[];
}

export function RoleProtectedRoute({ children, allowed }: Props) {
  const { roles } = useAuthContext();
  if (!canAccessRoute(roles, allowed)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}
