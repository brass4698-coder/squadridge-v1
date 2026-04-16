import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase browser client (Supabase quickstart pattern).
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
 */
export const supabase = createClient<Database>(
  supabaseUrl ?? '',
  supabaseKey ?? '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
