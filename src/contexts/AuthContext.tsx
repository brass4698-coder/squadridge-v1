import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import {
  addAuthTransitionBreadcrumb,
  captureAppError,
  ensureAnonymousSession,
  getAuthCallbackUrl,
  getSupabase,
  isSupabaseConfigured,
  queryKeys,
  setSentryUserContext,
  type Database,
} from '../lib';
import type { Profile } from '../types/auth';
import type { UserRole } from '../types/roles';

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  supabase: SupabaseClient<Database> | null;
  /** Set when env is configured but the client singleton could not be created (rare). */
  supabaseClientInitError: Error | null;
  /** Initial session load failed (network, refresh, or API error). */
  sessionError: Error | null;
  ensureAnonymousSession: () => Promise<void>;
  /** Magic link (passwordless) sign-in. `nextPath` is stored for `/auth/callback` → post-login redirect. */
  signIn: (email: string, options?: { nextPath?: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  /** Role workspace fields (may be empty until RPCs are available). */
  profile: Profile | null;
  roles: UserRole[];
  initialized: boolean;
  refreshProfile: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

/** Exported for test harnesses that inject a mock provider value. */
export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [initialized, setInitialized] = useState(false);

  const { supabase, supabaseClientInitError } = useMemo(() => {
    if (!isSupabaseConfigured()) {
      return { supabase: null as SupabaseClient<Database> | null, supabaseClientInitError: null };
    }
    try {
      return { supabase: getSupabase(), supabaseClientInitError: null };
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      return { supabase: null as SupabaseClient<Database> | null, supabaseClientInitError: err };
    }
  }, []);

  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      if (!supabase) return null;
      const {
        data: { session: s },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return s;
    },
    enabled: !!supabase,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

  useEffect(() => {
    if (!supabase) {
      setInitialized(true);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      addAuthTransitionBreadcrumb(event, { userId: s?.user?.id ?? null });
      queryClient.setQueryData(queryKeys.auth.session, s);
      if (event === 'TOKEN_REFRESHED' && !s) {
        captureAppError(new Error('Auth: TOKEN_REFRESHED with null session'), {
          feature: 'auth_refresh',
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, queryClient]);

  const session = supabase ? (sessionQuery.data ?? null) : null;
  const loading = supabase ? sessionQuery.isPending : false;
  const user = session?.user ?? null;
  const sessionError = useMemo((): Error | null => {
    const err = sessionQuery.error;
    if (!err) return null;
    if (err instanceof Error) return err;
    return new Error(String(err));
  }, [sessionQuery.error]);

  useEffect(() => {
    setSentryUserContext(session?.user?.id ?? null);
  }, [session?.user?.id]);

  const loadProfileAndRoles = useCallback(
    async (userId: string) => {
      if (!supabase) {
        setProfile(null);
        setRoles([]);
        return;
      }
      const [profileRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.rpc('get_effective_user_roles', { p_user_id: userId }),
      ]);
      setProfile((profileRes.data as Profile | null) ?? null);
      setRoles((rolesRes.data as UserRole[] | null) ?? []);
    },
    [supabase],
  );

  useEffect(() => {
    let cancelled = false;
    if (!sessionQuery.isFetched && supabase) return;

    void (async () => {
      if (user?.id) {
        try {
          await loadProfileAndRoles(user.id);
        } catch {
          if (!cancelled) {
            setProfile(null);
            setRoles([]);
          }
        }
      } else {
        setProfile(null);
        setRoles([]);
      }
      if (!cancelled) setInitialized(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, sessionQuery.isFetched, supabase, loadProfileAndRoles]);

  const ensureSession = useCallback(async () => {
    if (!supabase) throw new Error('Supabase is not configured.');
    await ensureAnonymousSession(supabase);
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, options?: { nextPath?: string }) => {
      if (!supabase) return { error: new Error('Supabase is not configured.') };
      const trimmed = email.trim();
      if (!trimmed) return { error: new Error('Enter an email address.') };
      const emailRedirectTo = getAuthCallbackUrl(options?.nextPath);
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo,
        },
      });
      // Deferred: device-bound keypair after verified OTP — see docs/adr/003-zk-device-bootstrap-deferred.md
      return { error: error ? new Error(error.message) : null };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    addAuthTransitionBreadcrumb('signOut_requested', { userId: null });
    await supabase.auth.signOut();
    queryClient.setQueryData(queryKeys.auth.session, null);
    queryClient.removeQueries({ queryKey: ['profile'] });
    queryClient.removeQueries({ queryKey: ['messages'] });
    setProfile(null);
    setRoles([]);
  }, [supabase, queryClient]);

  const refreshProfile = useCallback(async () => {
    if (!user || !supabase) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    setProfile((data as Profile | null) ?? null);
  }, [user, supabase]);

  const refreshRoles = useCallback(async () => {
    if (!user || !supabase) {
      setRoles([]);
      return;
    }
    const { data } = await supabase.rpc('get_effective_user_roles', { p_user_id: user.id });
    setRoles((data as UserRole[] | null) ?? []);
  }, [user, supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      loading,
      supabase,
      supabaseClientInitError,
      sessionError,
      ensureAnonymousSession: ensureSession,
      signIn,
      signOut,
      profile,
      roles,
      initialized,
      refreshProfile,
      refreshRoles,
    }),
    [
      session,
      user,
      loading,
      supabase,
      supabaseClientInitError,
      sessionError,
      ensureSession,
      signIn,
      signOut,
      profile,
      roles,
      initialized,
      refreshProfile,
      refreshRoles,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export const useAuthContext = useAuth;
