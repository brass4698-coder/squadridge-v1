import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Browser Supabase client (anon / publishable key only — never service_role).
 *
 * Module-level singleton stored on `globalThis` in all environments so Vite HMR
 * does not create a second GoTrueClient under the same storage key.
 */

const GLOBAL_KEY = '__squadridge_supabase_client__' as const;

type SupabaseGlobal = typeof globalThis & {
  [GLOBAL_KEY]?: SupabaseClient<Database>;
};

function readPublicEnv(): { url: string; anonKey: string } {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
  // Prefer VITE_SUPABASE_ANON_KEY; accept publishable as the same public credential.
  const anonKey =
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() ||
    '';

  if (import.meta.env.DEV && (!url || !anonKey)) {
    throw new Error(
      '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
        'Copy .env.example → .env and set both (or set VITE_SUPABASE_PUBLISHABLE_KEY instead of the anon key). ' +
        'Never put the service_role key in any VITE_* variable.',
    );
  }

  if (!url || !anonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY (public client key).');
  }

  return { url, anonKey };
}

function createBrowserClient(): SupabaseClient<Database> {
  const { url, anonKey } = readPublicEnv();
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

const g = globalThis as SupabaseGlobal;

/** Typed singleton — reused across Vite HMR. */
export const supabase: SupabaseClient<Database> =
  g[GLOBAL_KEY] ?? (g[GLOBAL_KEY] = createBrowserClient());

export function getSupabase(): SupabaseClient<Database> {
  return supabase;
}

export type { Database };
