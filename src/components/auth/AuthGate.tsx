// ============================================================
// AuthGate — shows SessionLoader while auth initializes
// Public marketing routes paint immediately so nav does not flash blank.
// ============================================================
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { SessionLoader } from './SessionLoader';

const PUBLIC_PAINT_PREFIXES = [
  '/how-it-works',
  '/use-cases',
  '/security',
  '/ledger',
  '/faq',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/request-access',
  '/briefings',
  '/sign-in',
  '/enter',
  '/auth/callback',
  '/access-pending',
];

function allowsImmediatePaint(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_PAINT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { initialized } = useAuthContext();
  const { pathname } = useLocation();

  if (initialized) return <>{children}</>;

  // Marketing / public entry: keep shell + content available while auth finishes.
  if (allowsImmediatePaint(pathname)) {
    return <>{children}</>;
  }

  return <SessionLoader />;
}
