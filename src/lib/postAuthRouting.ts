// ============================================================
// Post-authentication routing — single source for sign-in/callback
// ============================================================
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '../types/auth';
import type { UserRole } from '../types/roles';
import { resolveLocalDashboard } from './dashboardRouting';

export function safeNextPath(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback;
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith('/') && !decoded.startsWith('//')) return decoded;
  } catch {
    /* ignore malformed */
  }
  return fallback;
}

/**
 * Where to send a user immediately after auth resolves.
 * Never returns `/sign-in` when a session exists (avoids blank sign-in loop).
 */
export function resolvePostAuthPath(opts: {
  session: Session | null;
  profile: Profile | null;
  roles: UserRole[];
  explicitNext?: string | null;
}): string {
  const { session, profile, roles, explicitNext } = opts;

  if (!session) return '/sign-in';

  const explicit = explicitNext ? safeNextPath(explicitNext, '') : '';
  if (explicit && explicit !== '/sign-in') {
    return explicit;
  }

  if (!profile || profile.status === 'pending') return '/access-pending';
  if (profile.status === 'suspended') return '/unauthorized';
  if (roles.length === 0) return '/access-pending';

  if (profile.last_dashboard) return profile.last_dashboard;
  return resolveLocalDashboard(roles);
}
