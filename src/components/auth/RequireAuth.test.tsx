import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthContextValue } from '../../contexts/AuthContext';
import { createMockSession } from '../../test/fixtures';
import { RequireAuth } from './RequireAuth';

function SignInSearchProbe() {
  const { search } = useLocation();
  return <div data-testid="sign-in-search">{search}</div>;
}

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));
vi.mock('../../hooks/useProfile', () => ({
  useProfile: vi.fn(),
}));

import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';

const authDefaults: AuthContextValue = {
  session: null,
  user: null,
  profile: null,
  roles: [],
  loading: false,
  initialized: true,
  refreshProfile: vi.fn(),
  refreshRoles: vi.fn(),
  supabase: null,
  supabaseClientInitError: null,
  sessionError: null,
  ensureAnonymousSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
};

function renderProtectedRoute(initialEntry = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <RequireAuth requireCompleteProfile>
              <div data-testid="protected-child">ok</div>
            </RequireAuth>
          }
        />
        <Route path="/sign-in" element={<div data-testid="sign-in-page">sign-in</div>} />
        <Route
          path="/app/settings/profile"
          element={<div data-testid="profile-page">profile</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireAuth', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
    vi.mocked(useProfile).mockReset();
  });

  it('shows loading when auth is loading', () => {
    vi.mocked(useAuth).mockReturnValue({ ...authDefaults, loading: true });
    vi.mocked(useProfile).mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      upsertProfile: vi.fn(),
      patchProfile: vi.fn(),
      profileComplete: false,
    });
    renderProtectedRoute();
    expect(screen.getByLabelText('Checking session')).toBeInTheDocument();
  });

  it('redirects to sign-in when there is no session', () => {
    vi.mocked(useAuth).mockReturnValue({ ...authDefaults, session: null, loading: false });
    vi.mocked(useProfile).mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      upsertProfile: vi.fn(),
      patchProfile: vi.fn(),
      profileComplete: false,
    });
    renderProtectedRoute();
    expect(screen.getByTestId('sign-in-page')).toBeInTheDocument();
  });

  it('redirects to demo sign-in when a walkthrough is active and demo login is enabled', () => {
    sessionStorage.setItem('demoWalkthrough', '1');
    vi.mocked(useAuth).mockReturnValue({ ...authDefaults, session: null, loading: false });
    vi.mocked(useProfile).mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      upsertProfile: vi.fn(),
      patchProfile: vi.fn(),
      profileComplete: false,
    });
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RequireAuth>
                <div data-testid="protected-child">ok</div>
              </RequireAuth>
            }
          />
          <Route path="/sign-in" element={<SignInSearchProbe />} />
        </Routes>
      </MemoryRouter>,
    );
    const search = screen.getByTestId('sign-in-search').textContent ?? '';
    expect(search).toContain('demo=1');
    expect(search).toContain('next=');
    sessionStorage.removeItem('demoWalkthrough');
  });

  it('redirects to profile settings when profile is incomplete', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...authDefaults,
      session: createMockSession(),
      loading: false,
    });
    vi.mocked(useProfile).mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      upsertProfile: vi.fn(),
      patchProfile: vi.fn(),
      profileComplete: false,
    });
    renderProtectedRoute();
    expect(screen.getByTestId('profile-page')).toBeInTheDocument();
  });

  it('shows loading while profile loads when session exists and complete profile required', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...authDefaults,
      session: createMockSession(),
      loading: false,
    });
    vi.mocked(useProfile).mockReturnValue({
      profile: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
      upsertProfile: vi.fn(),
      patchProfile: vi.fn(),
      profileComplete: false,
    });
    renderProtectedRoute();
    expect(screen.getByLabelText('Checking session')).toBeInTheDocument();
  });

  it('renders children when session exists and profile is complete', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...authDefaults,
      session: createMockSession(),
      loading: false,
    });
    vi.mocked(useProfile).mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      upsertProfile: vi.fn(),
      patchProfile: vi.fn(),
      profileComplete: true,
    });
    renderProtectedRoute();
    expect(screen.getByTestId('protected-child')).toBeInTheDocument();
  });
});
