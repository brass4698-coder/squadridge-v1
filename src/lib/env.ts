const env = import.meta.env;

/**
 * Canonical site origin for auth redirects and emails. Prefer `VITE_SITE_URL` in staging/production
 * when the deployed origin must match exactly (e.g. behind a preview URL).
 * In the browser, defaults to `window.location.origin`.
 */
export function getSiteUrl(): string {
  const v = env.VITE_SITE_URL;
  if (typeof v === 'string' && v.trim().length > 0) {
    return v.trim().replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

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

/** External waitlist URL (Typeform, Tally, etc.). When set, landing primary CTA uses this. */
export function getWaitlistFormUrl(): string | undefined {
  const v = env.VITE_WAITLIST_FORM_URL;
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

/** Public contact email for footer / humans behind the product */
export function getPublicContactEmail(): string | undefined {
  const v = env.VITE_CONTACT_EMAIL;
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}
