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

interface AuthContextValue extends AuthState {
  refreshProfile: () => Promise<void>;
  refreshRoles: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const loadProfileAndRoles = useCallback(async (userId: string) => {
    const [p, r] = await Promise.all([
      fetchProfile(userId),
      fetchUserRoles(),
    ]);
    setProfile(p);
    setRoles(r);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (!mounted) return;
      if (session?.user) {
        const u = { id: session.user.id, email: session.user.email ?? '' };
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

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const u = { id: session.user.id, email: session.user.email ?? '' };
          setUser(u);
          loadProfileAndRoles(u.id);
        } else {
          setUser(null);
          setProfile(null);
          setRoles([]);
        }
      }
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
    const r = await fetchUserRoles();
    setRoles(r);
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRoles([]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
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

// Export as 'useAuth' for widespread compatibility
export const useAuth = useAuthContext;
