import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';
import { getAuthCallbackUrl } from '../lib/authUrls';
import { isSupabaseConfigured } from '../lib/env';
import { getSupabase } from '../lib/supabase';
import { ensureAnonymousSession } from '../lib/squad';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  supabase: SupabaseClient<Database> | null;
  ensureAnonymousSession: () => Promise<void>;
  /** Magic link (passwordless) sign-in. `nextPath` is stored for `/auth/callback` → post-login redirect. */
  signIn: (email: string, options?: { nextPath?: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo<SupabaseClient<Database> | null>(() => {
    if (!isSupabaseConfigured()) return null;
    try {
      return getSupabase();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    void supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        if (!cancelled) {
          setSession(s);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSession(null);
          setLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const user = session?.user ?? null;

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
      // TODO(ZK): On first verified session after OTP callback, bootstrap device-bound keypair / commitment registration.
      return { error: error ? new Error(error.message) : null };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      loading,
      supabase,
      ensureAnonymousSession: ensureSession,
      signIn,
      signOut,
    }),
    [session, user, loading, supabase, ensureSession, signIn, signOut],
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
