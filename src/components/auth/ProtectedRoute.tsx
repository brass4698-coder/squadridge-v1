// ============================================================
// ProtectedRoute — redirects unauthenticated users
// ============================================================
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { SessionLoader } from './SessionLoader';

interface Props {
  children: ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { user, profile, loading, initialized } = useAuthContext();
  const location = useLocation();

  if (!initialized || loading) return <SessionLoader />;
  if (!user) return <Navigate to="/sign-in" state={{ from: location }} replace />;
  if (profile?.status === 'pending') return <Navigate to="/access-pending" replace />;
  if (profile?.status === 'suspended') return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}
