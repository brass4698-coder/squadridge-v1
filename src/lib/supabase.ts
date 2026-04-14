import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { supabase } from '../utils/supabase';

/**
 * Same client as {@link supabase} in `utils/supabase.ts` (typed singleton for the app).
 */
export function getSupabase(): SupabaseClient<Database> {
  return supabase;
}
