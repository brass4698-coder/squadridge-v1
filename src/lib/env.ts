const env = import.meta.env;

export function getSupabaseUrl(): string | undefined {
  const v = env.VITE_SUPABASE_URL;
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

export function getSupabaseAnonKey(): string | undefined {
  const v = env.VITE_SUPABASE_ANON_KEY;
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function isAiPipelineEnabled(): boolean {
  return env.VITE_ENABLE_AI === 'true';
}

export function isZkVerifierStubEnabled(): boolean {
  return env.VITE_ZK_STUB !== 'false';
}
