// ============================================================
// AuthGate — shows SessionLoader while auth initializes
// ============================================================
import type { ReactNode } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { SessionLoader } from './SessionLoader';

export function AuthGate({ children }: { children: ReactNode }) {
  const { initialized } = useAuthContext();
  if (!initialized) return <SessionLoader />;
  return <>{children}</>;
}
