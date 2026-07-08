import { describe, it, expect } from 'vitest';
import { resolvePostAuthPath, safeNextPath } from './postAuthRouting';
import { createMockSession } from '../test/fixtures';
import type { Profile } from '../types/auth';
import type { UserRole, RoleKey } from '../types/roles';

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user-1',
    email: 'a@example.com',
    display_name: 'Test',
    avatar_url: null,
    status: 'active',
    primary_role: 'facilitator',
    onboarding_completed: true,
    last_dashboard: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function role(key: RoleKey): UserRole {
  return {
    role_key: key,
    workspace_id: null,
    institution_id: null,
    granted_at: '2026-01-01T00:00:00Z',
  };
}

describe('safeNextPath', () => {
  it('rejects external URLs', () => {
    expect(safeNextPath('//evil.com', '/app')).toBe('/app');
  });

  it('accepts internal paths', () => {
    expect(safeNextPath('/app/facilitator', '/app')).toBe('/app/facilitator');
  });
});

describe('resolvePostAuthPath', () => {
  it('returns sign-in when there is no session', () => {
    expect(resolvePostAuthPath({ session: null, profile: null, roles: [] })).toBe('/sign-in');
  });

  it('never returns sign-in when session exists but profile is missing', () => {
    expect(resolvePostAuthPath({ session: createMockSession(), profile: null, roles: [] })).toBe(
      '/access-pending',
    );
  });

  it('routes pending profiles to access-pending', () => {
    expect(
      resolvePostAuthPath({
        session: createMockSession(),
        profile: profile({ status: 'pending' }),
        roles: [role('facilitator')],
      }),
    ).toBe('/access-pending');
  });

  it('routes active users with roles to their dashboard', () => {
    expect(
      resolvePostAuthPath({
        session: createMockSession(),
        profile: profile(),
        roles: [role('facilitator')],
      }),
    ).toBe('/app/facilitator');
  });

  it('honours explicit next when safe', () => {
    expect(
      resolvePostAuthPath({
        session: createMockSession(),
        profile: profile(),
        roles: [role('facilitator')],
        explicitNext: '/app/sessions',
      }),
    ).toBe('/app/sessions');
  });
});
