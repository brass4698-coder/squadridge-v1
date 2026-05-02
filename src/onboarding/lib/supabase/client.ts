/**
 * Onboarding-scoped Supabase accessor. Previously this file called
 * `createClient` directly, producing a second browser-wide auth session.
 * It now returns the **canonical** shared singleton from `src/lib/supabase.ts`
 * so anonymous → verified promotion, magic-link callbacks, and Realtime
 * channels all see the same session.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { isSupabaseConfigured as isConfigured, type Database } from '../../../lib';

export function isSupabaseConfigured(): boolean {
  return isConfigured();
}

/** Shared anon client; returns null when env is missing (local/demo without backend). */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (!isConfigured()) return null;
  return supabase;
}
