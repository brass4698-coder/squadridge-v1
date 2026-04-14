import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getSupabasePublicKey, getSupabaseUrl } from './env';

let browserClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Browser Supabase client. Call only when {@link isSupabaseConfigured} is true.
 */
export function getSupabase(): ReturnType<typeof createClient<Database>> {
  const url = getSupabaseUrl();
  const key = getSupabasePublicKey();
  if (!url || !key) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and either VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY.',
    );
  }
  if (!browserClient) {
    browserClient = createClient<Database>(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return browserClient;
}
