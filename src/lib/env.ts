const env = import.meta.env;

export function getSupabaseUrl(): string | undefined {
  const v = env.VITE_SUPABASE_URL;
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

/**
 * Legacy JWT anon key (`eyJ...`) — still supported by Supabase.
 */
export function getSupabaseAnonKey(): string | undefined {
  const v = env.VITE_SUPABASE_ANON_KEY;
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

/**
 * New publishable key (`sb_publishable_...`) — preferred for new projects.
 * @see https://supabase.com/docs/guides/api/api-keys
 */
export function getSupabasePublishableKey(): string | undefined {
  const v = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

/** Public client key: publishable key if set, otherwise legacy anon JWT. */
export function getSupabasePublicKey(): string | undefined {
  return getSupabasePublishableKey() ?? getSupabaseAnonKey();
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublicKey());
}

export function isAiPipelineEnabled(): boolean {
  return env.VITE_ENABLE_AI === 'true';
}

export function isZkVerifierStubEnabled(): boolean {
  return env.VITE_ZK_STUB !== 'false';
}
