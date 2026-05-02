import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { AuthContext, type AuthContextValue } from '../contexts/AuthContext';
import type { Database } from '../lib';

/**
 * Test helper: wraps `ui` in a fresh QueryClient + an AuthContext value built
 * from `supabase` (and an optional `session`). Each hook test is encouraged to
 * provide a Supabase stub fit for the contract under test rather than trying
 * to share one across every behaviour.
 */
export function renderWithAuth(
  ui: ReactElement,
  supabase: SupabaseClient<Database> | null,
  session: Session | null = null,
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading: false,
    supabase,
    supabaseClientInitError: null,
    sessionError: null,
    ensureAnonymousSession: async () => {},
    signIn: async () => ({ error: null }),
    signOut: async () => {},
  };
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>{ui}</AuthContext.Provider>
    </QueryClientProvider>,
  );
}
