// ============================================================
// SquadRidge AuthContext
// ============================================================
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import { fetchProfile } from '../lib/auth';
import { fetchUserRoles } from '../lib/roles';
import type { AuthState, Profile, AuthUser } from '../types/auth';
import type { UserRole } from '../types/roles';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

interface AuthContextValue extends AuthState {
  /** The Supabase client — forwarded so pages like AuthCallbackPage can
   *  subscribe to auth events without importing the singleton directly. */
  supabase: SupabaseClient;
  /** The current Supabase session, or null when signed out. */
  session: Session | null;
  refreshProfile: () => Promise<void>;
  refreshRoles: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const loadProfileAndRoles = useCallback(async (userId: string) => {
    const [p, r] = await Promise.all([
      fetchProfile(userId),
      fetchUserRoles(userId),
    ]);
    setProfile(p);
    setRoles(r);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Hydrate session on mount.
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        const u = { id: s.user.id, email: s.user.email ?? '' };
        setUser(u);
        loadProfileAndRoles(u.id).finally(() => {
          if (mounted) {
            setLoading(false);
            setInitialized(true);
          }
        });
      } else {
        setLoading(false);
        setInitialized(true);
      }
    });

    // Keep session/profile/roles in sync on every auth state change
    // (magic-link exchange, token refresh, sign-out, etc.).
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        if (!mounted) return;
        setSession(s);
        if (s?.user) {
          const u = { id: s.user.id, email: s.user.email ?? '' };
          setUser(u);
          // Re-enter loading so guards don't flash the wrong state while we
          // fetch a fresh profile and role set.
          setLoading(true);
          loadProfileAndRoles(u.id).finally(() => {
            if (mounted) setLoading(false);
          });
        } else {
          setUser(null);
          setProfile(null);
          setRoles([]);
          setLoading(false);
        }
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfileAndRoles]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    setProfile(p);
  }, [user]);

  const refreshRoles = useCallback(async () => {
    if (!user) return;
    const r = await fetchUserRoles(user.id);
    setRoles(r);
  }, [user]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setRoles([]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        supabase,
        session,
        user,
        profile,
        roles,
        loading,
        initialized,
        refreshProfile,
        refreshRoles,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used inside <AuthProvider>');
  }
  return ctx;
}

/** Convenience alias — matches the import used across pages. */
export const useAuth = useAuthContext;
