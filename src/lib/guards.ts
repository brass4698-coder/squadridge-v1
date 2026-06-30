// ============================================================
// SquadRidge Guard helpers
// ============================================================
import type { UserRole, RoleKey } from '../types/roles';
import type { Profile } from '../types/auth';

export function isAuthenticated(profile: Profile | null): boolean {
  return profile !== null;
}

export function isActiveUser(profile: Profile | null): boolean {
  return profile?.status === 'active';
}

export function isPendingUser(profile: Profile | null): boolean {
  return profile?.status === 'pending';
}

export function canAccessRoute(
  roles: UserRole[],
  allowed: RoleKey[]
): boolean {
  return roles.some((r) => (allowed as string[]).includes(r.role_key));
}

export const ROUTE_ROLE_MAP: Record<string, RoleKey[]> = {
  '/app/admin':       ['super_admin'],
  '/app/institution': ['institution_admin', 'super_admin'],
  '/app/facilitator': ['facilitator', 'super_admin'],
  '/app/mediator':    ['mediator', 'super_admin'],
  '/app/analyst':     ['analyst', 'super_admin'],
  '/app/participant': ['participant', 'super_admin'],
  '/app/observer':    ['observer', 'super_admin'],
  '/app/settings':    ['super_admin','institution_admin','facilitator','mediator','analyst','participant','observer'],
  '/app/profile':     ['super_admin','institution_admin','facilitator','mediator','analyst','participant','observer'],
};
