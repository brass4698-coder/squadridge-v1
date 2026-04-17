import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicKey, getSupabaseUrl, type Database } from '../../../lib';

let browserClient: SupabaseClient<Database> | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl()?.trim() && getSupabasePublicKey()?.trim());
}

/** Shared anon client; returns null if env is missing (local/demo without backend). */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;
  if (browserClient) return browserClient;
  const url = getSupabaseUrl() as string;
  const key = getSupabasePublicKey() as string;
  browserClient = createClient<Database>(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return browserClient;
}
