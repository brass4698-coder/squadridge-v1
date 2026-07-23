import { renderHook } from '@testing-library/react';
import type { Session } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthContextValue } from '../contexts/AuthContext';
import { AuthContext } from '../contexts/AuthContext';
import { LAST_SQUAD_KEY } from '../lib';
import { useAppNavContext } from './useAppNavContext';

const mockUseProfile = vi.fn();

vi.mock('./useProfile', () => ({
  useProfile: () => mockUseProfile(),
}));

function makeSession(partial?: Partial<Session>): Session {
  return {
    access_token: 't',
    refresh_token: 'r',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: 'user-1',
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {},
    },
    ...partial,
  } as Session;
}

function wrapper({
  children,
  initialPath,
  auth,
}: {
  children: ReactNode;
  initialPath: string;
  auth: AuthContextValue;
}) {
  return (
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
    </AuthContext.Provider>
  );
}

function baseAuth(session: Session | null): AuthContextValue {
  return {
    session,
    user: session?.user ?? null,
    loading: false,
    supabase: null,
    supabaseClientInitError: null,
    sessionError: null,
    ensureAnonymousSession: async () => {},
    signIn: async () => ({ error: null }),
    signOut: async () => {},
    profile: null,
    roles: [],
    initialized: true,
    refreshProfile: async () => {},
    refreshRoles: async () => {},
  };
}

describe('useAppNavContext', () => {
  beforeEach(() => {
    localStorage.removeItem(LAST_SQUAD_KEY);
    mockUseProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      upsertProfile: vi.fn(),
      patchProfile: vi.fn(),
      profileComplete: true,
    });
  });

  afterEach(() => {
    localStorage.removeItem(LAST_SQUAD_KEY);
  });

  it('exposes resume href when last squad is in storage and user is elsewhere', () => {
    localStorage.setItem(LAST_SQUAD_KEY, 'squad-abc');
    const { result } = renderHook(() => useAppNavContext(), {
      wrapper: ({ children }) =>
        wrapper({ children, initialPath: '/', auth: baseAuth(makeSession()) }),
    });
    expect(result.current.resumeSquadId).toBe('squad-abc');
    expect(result.current.resumeHref).toBe('/session/squad-abc');
    expect(result.current.showResumeCta).toBe(true);
  });

  it('hides resume CTA when already on that session route', () => {
    localStorage.setItem(LAST_SQUAD_KEY, 'squad-abc');
    const { result } = renderHook(() => useAppNavContext(), {
      wrapper: ({ children }) =>
        wrapper({
          children,
          initialPath: '/session/squad-abc',
          auth: baseAuth(makeSession()),
        }),
    });
    expect(result.current.showResumeCta).toBe(false);
  });

  it('shows onboarding CTA when signed in and profile incomplete', () => {
    mockUseProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      upsertProfile: vi.fn(),
      patchProfile: vi.fn(),
      profileComplete: false,
    });
    const { result } = renderHook(() => useAppNavContext(), {
      wrapper: ({ children }) =>
        wrapper({ children, initialPath: '/ledger', auth: baseAuth(makeSession()) }),
    });
    expect(result.current.showOnboardingCta).toBe(true);
    expect(result.current.onboardingHref).toBe('/onboarding/mission');
  });

  it('does not show onboarding CTA on profile settings route', () => {
    mockUseProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      upsertProfile: vi.fn(),
      patchProfile: vi.fn(),
      profileComplete: false,
    });
    const { result } = renderHook(() => useAppNavContext(), {
      wrapper: ({ children }) =>
        wrapper({
          children,
          initialPath: '/settings/profile',
          auth: baseAuth(makeSession()),
        }),
    });
    expect(result.current.showOnboardingCta).toBe(false);
  });

  it('does not show onboarding CTA when already in the onboarding wizard', () => {
    mockUseProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      upsertProfile: vi.fn(),
      patchProfile: vi.fn(),
      profileComplete: false,
    });
    const { result } = renderHook(() => useAppNavContext(), {
      wrapper: ({ children }) =>
        wrapper({ children, initialPath: '/onboarding/mission', auth: baseAuth(makeSession()) }),
    });
    expect(result.current.showOnboardingCta).toBe(false);
  });
});
