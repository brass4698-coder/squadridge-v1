// ============================================================
// SquadRidge AuthContext
//
// Backwards-compatible with pre-invite-only-auth consumers: exposes both the
// new fields (`profile`, `roles`, `initialized`, `refreshProfile`,
// `refreshRoles`) AND the legacy fields (`session`, `supabase`,
// `sessionError`, `supabaseClientInitError`, `ensureAnonymousSession`,
// `signIn`). Removing the legacy fields broke ~30 v1 hooks/components and
// their tests; the shim keeps both live during the v2 migration.
// ============================================================
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fetchProfile } from '../lib/auth';
import { fetchUserRoles } from '../lib/roles';
import type { AuthState, Profile, AuthUser } from '../types/auth';
import type { UserRole } from '../types/roles';

export interface AuthContextValue extends AuthState {
  // v2 (invite-only) API — see incoming auth wave in main.
  refreshProfile: () => Promise<void>;
  refreshRoles: () => Promise<void>;
  signOut: () => Promise<void>;
  // v1 compat fields — remove only when every consumer (see grep for
  // `useAuth().session` / `.supabase`) has been ported to the v2 API.
  session: Session | null;
  supabase: SupabaseClient | null;
  supabaseClientInitError: Error | null;
  sessionError: Error | null;
  ensureAnonymousSession: () => Promise<void>;
  signIn: (email: string, options?: { nextPath?: string }) => Promise<{ error: Error | null }>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionError, setSessionError] = useState<Error | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const loadProfileAndRoles = useCallback(async (userId: string) => {
    const [p, r] = await Promise.all([fetchProfile(userId), fetchUserRoles()]);
    setProfile(p);
    setRoles(r);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setSessionError(error instanceof Error ? error : new Error(String(error)));
        }
        const s = data.session;
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
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        setSessionError(e instanceof Error ? e : new Error(String(e)));
        setLoading(false);
        setInitialized(true);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        const u = { id: s.user.id, email: s.user.email ?? '' };
        setUser(u);
        loadProfileAndRoles(u.id);
      } else {
        setUser(null);
        setProfile(null);
        setRoles([]);
      }
    });

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
    const r = await fetchUserRoles();
    setRoles(r);
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  }, []);

  const ensureAnonymousSession = useCallback(async () => {
    // Legacy demo path — real anon sign-in flow lives in the sign-in page for
    // v2, but we still expose a no-op here so v1 consumers don't crash.
    const { data } = await supabase.auth.getSession();
    if (data.session) return;
    const { data: signInData, error } = await supabase.auth.signInAnonymously();
    if (error) {
      setSessionError(error instanceof Error ? error : new Error(String(error)));
      return;
    }
    setSession(signInData.session ?? null);
    if (signInData.user) {
      setUser({ id: signInData.user.id, email: signInData.user.email ?? '' });
    }
  }, []);

  const signIn = useCallback(
    async (email: string, options?: { nextPath?: string }): Promise<{ error: Error | null }> => {
      const emailRedirectTo =
        typeof window !== 'undefined' && options?.nextPath
          ? new URL(
              `/auth/callback?next=${encodeURIComponent(options.nextPath)}`,
              window.location.origin,
            ).toString()
          : undefined;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: emailRedirectTo ? { emailRedirectTo } : undefined,
      });
      if (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setSessionError(err);
        return { error: err };
      }
      return { error: null };
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      roles,
      loading,
      initialized,
      refreshProfile,
      refreshRoles,
      signOut: handleSignOut,
      session,
      supabase,
      supabaseClientInitError: null,
      sessionError,
      ensureAnonymousSession,
      signIn,
    }),
    [
      user,
      profile,
      roles,
      loading,
      initialized,
      refreshProfile,
      refreshRoles,
      handleSignOut,
      session,
      sessionError,
      ensureAnonymousSession,
      signIn,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used inside <AuthProvider>');
  }
  return ctx;
}

export const useAuth = useAuthContext;
