/**
 * Canonical Supabase browser client (same HMR-safe singleton as `supabaseClient.ts`).
 *
 * Exported as an untyped `SupabaseClient` so call sites that use RPCs / tables not
 * yet present in `Database` (invite-only auth, v2 session RPCs) keep compiling.
 * Prefer importing `supabase` from `./supabaseClient` when you want full
 * `Database` typing against `src/types/supabase.ts`.
 *
 * Never import or embed a service_role key here.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase as getTypedSupabase, supabase as typedSupabase } from './supabaseClient';

export const supabase = typedSupabase as unknown as SupabaseClient;

export function getSupabase(): SupabaseClient {
  return getTypedSupabase() as unknown as SupabaseClient;
}
