import { describe, it, expect } from 'vitest';
import {
  canAccessRoute,
  isActiveUser,
  isAuthenticated,
  isPendingUser,
  ROUTE_ROLE_MAP,
} from './guards';
import type { UserRole, RoleKey } from '../types/roles';
import type { Profile, UserStatus } from '../types/auth';

function role(key: RoleKey): UserRole {
  return {
    role_key: key,
    workspace_id: null,
    institution_id: null,
    granted_at: '2026-01-01T00:00:00Z',
  };
}

function profile(status: UserStatus): Profile {
  return {
    id: 'user-1',
    email: 'test@example.com',
    display_name: null,
    avatar_url: null,
    status,
    primary_role: null,
    onboarding_completed: true,
    last_dashboard: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };
}

describe('canAccessRoute', () => {
  it('returns true when the user holds one of the allowed roles', () => {
    expect(canAccessRoute([role('facilitator')], ['facilitator'])).toBe(true);
  });

  it('returns true when the user holds any of several allowed roles', () => {
    expect(canAccessRoute([role('facilitator')], ['super_admin', 'facilitator', 'mediator'])).toBe(
      true,
    );
  });

  it('returns false when the user holds a role that is not in the allow-list', () => {
    expect(canAccessRoute([role('observer')], ['facilitator', 'mediator'])).toBe(false);
  });

  it('returns false when the user has no roles', () => {
    expect(canAccessRoute([], ['facilitator'])).toBe(false);
  });

  it('super_admin does NOT bypass the allow-list on its own', () => {
    // The current allow-list model requires explicit inclusion. If bypass is desired,
    // ROUTE_ROLE_MAP already puts `super_admin` in each entry.
    expect(canAccessRoute([role('super_admin')], ['facilitator'])).toBe(false);
    expect(canAccessRoute([role('super_admin')], ['super_admin', 'facilitator'])).toBe(true);
  });
});

describe('ROUTE_ROLE_MAP', () => {
  it('scopes /app/admin to super_admin only', () => {
    expect(ROUTE_ROLE_MAP['/app/admin']).toEqual(['super_admin']);
  });

  it('gives super_admin access to every non-admin scoped dashboard', () => {
    const scoped: Array<keyof typeof ROUTE_ROLE_MAP> = [
      '/app/institution',
      '/app/facilitator',
      '/app/mediator',
      '/app/analyst',
      '/app/participant',
      '/app/observer',
    ];
    for (const route of scoped) {
      expect(ROUTE_ROLE_MAP[route]).toContain('super_admin');
    }
  });

  it('lets any role reach /app/settings and /app/profile', () => {
    const allRoles: RoleKey[] = [
      'super_admin',
      'institution_admin',
      'facilitator',
      'mediator',
      'analyst',
      'participant',
      'observer',
    ];
    for (const r of allRoles) {
      expect(ROUTE_ROLE_MAP['/app/settings']).toContain(r);
      expect(ROUTE_ROLE_MAP['/app/profile']).toContain(r);
    }
  });
});

describe('profile status helpers', () => {
  it('isAuthenticated returns false for null profile', () => {
    expect(isAuthenticated(null)).toBe(false);
    expect(isAuthenticated(profile('active'))).toBe(true);
  });

  it('isActiveUser is true only when status is active', () => {
    expect(isActiveUser(null)).toBe(false);
    expect(isActiveUser(profile('active'))).toBe(true);
    expect(isActiveUser(profile('pending'))).toBe(false);
    expect(isActiveUser(profile('suspended'))).toBe(false);
  });

  it('isPendingUser is true only when status is pending', () => {
    expect(isPendingUser(null)).toBe(false);
    expect(isPendingUser(profile('active'))).toBe(false);
    expect(isPendingUser(profile('pending'))).toBe(true);
    expect(isPendingUser(profile('suspended'))).toBe(false);
  });
});
