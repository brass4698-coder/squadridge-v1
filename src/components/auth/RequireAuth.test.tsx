import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthContextValue } from '../../contexts/AuthContext';
import { createMockSession } from '../../test/fixtures';
import { RequireAuth } from './RequireAuth';

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
  loading: false,
  supabase: null,
  supabaseClientInitError: null,
  sessionError: null,
  ensureAnonymousSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
};

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
}

function renderProtectedRoute() {
  render(
    <MemoryRouter initialEntries={['/protected']}>
      <LocationDisplay />
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
        <Route path="/settings/profile" element={<div data-testid="profile-page">profile</div>} />
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
    expect(screen.getByText('Loading…')).toBeInTheDocument();
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
    expect(screen.getByTestId('location-display').textContent).toMatch(/\/sign-in/);
    expect(screen.getByTestId('sign-in-page')).toBeInTheDocument();
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
    expect(screen.getByTestId('location-display').textContent).toMatch(/\/settings\/profile/);
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
    expect(screen.getByText('Loading…')).toBeInTheDocument();
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
