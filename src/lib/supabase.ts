import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicKey, getSupabaseUrl } from './env';

const supabaseUrl = getSupabaseUrl();
const supabaseKey = getSupabasePublicKey();

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_ANON_KEY.',
    );
  }
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/** Singleton anon/publishable client — accepts either key env var. */
export const supabase: SupabaseClient = createSupabaseClient();

export function getSupabase(): SupabaseClient {
  return supabase;
}
