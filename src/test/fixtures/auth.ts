import type { Session, User } from '@supabase/supabase-js';

/** Stable ids for tests — not real UUID semantics beyond shape. */
export const FIXTURE_USER_ID = '00000000-0000-4000-8000-0000000000aa';

/**
 * Minimal Supabase `User` for component tests (fields unused by guards omitted).
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: FIXTURE_USER_ID,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    ...overrides,
  } as User;
}

/**
 * Minimal Supabase `Session` for auth-guard tests.
 */
export function createMockSession(overrides: Partial<Session> = {}): Session {
  const user = overrides.user ?? createMockUser();
  return {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    ...overrides,
    user,
  } as Session;
}
