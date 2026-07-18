import type { SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '../../../lib/env';
import { supabase } from '../../../lib/supabase';

/**
 * Shared anon client for onboarding — same HMR-safe singleton as the rest of the app.
 * Returns null if public env keys are missing (local/demo without backend).
 *
 * Untyped `SupabaseClient` so callers match `lib/profile` helpers that still use
 * the hand-maintained `database.types` schema shape.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return supabase;
}

export { isSupabaseConfigured };
