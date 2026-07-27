// ============================================================
// AuthGate — shows SessionLoader while auth initializes
// Public marketing routes paint immediately so nav does not flash blank.
// ============================================================
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { allowsImmediatePublicPaint } from '../../lib/publicRoutes';
import { SessionLoader } from './SessionLoader';

export function AuthGate({ children }: { children: ReactNode }) {
  const { initialized } = useAuthContext();
  const { pathname } = useLocation();

  if (initialized) return <>{children}</>;

  // Marketing / public entry: keep shell + content available while auth finishes.
  if (allowsImmediatePublicPaint(pathname)) {
    return <>{children}</>;
  }

  return <SessionLoader />;
}
