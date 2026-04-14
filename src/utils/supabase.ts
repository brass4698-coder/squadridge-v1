import { getSupabase } from '../lib/supabase';

/**
 * Supabase browser client — same singleton as {@link getSupabase}.
 * Matches the Supabase quickstart pattern (`import { supabase } from './utils/supabase'`).
 */
export const supabase = getSupabase();
