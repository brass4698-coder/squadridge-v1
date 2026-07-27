// ============================================================
// ActiveUserGate — profile status enforcement for /app/*
// Server-side RLS remains authoritative; this is UX routing.
// ============================================================
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { RouteSkeleton } from '../system/RouteSkeleton';

interface Props {
  children: ReactNode;
}

export function ActiveUserGate({ children }: Props) {
  const { session, profile, roles, loading, initialized } = useAuthContext();

  if (!initialized || loading) {
    return <RouteSkeleton label="Loading account" />;
  }

  if (!session) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!profile || profile.status === 'pending') {
    return <Navigate to="/access-pending" replace />;
  }

  if (profile.status === 'suspended') {
    return <Navigate to="/unauthorized" replace />;
  }

  if (roles.length === 0) {
    return <Navigate to="/access-pending" replace />;
  }

  return <>{children}</>;
}
