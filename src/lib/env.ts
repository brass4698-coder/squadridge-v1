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

/**
 * When true, the app may persist client-side tone samples to `sentiment_metrics` (see `recordLocalToneAndMaybePersist`).
 * Translation and de-escalation run in-browser without this flag; use it only when you want optional analytics persistence.
 * **MVP default:** unset or `false` in production unless you explicitly want sentiment rows.
 */
export function isAiPipelineEnabled(): boolean {
  return env.VITE_ENABLE_AI === 'true';
}

/**
 * When true, optional remote tone/suggestion calls may run (Edge Function or similar).
 * Default off; local heuristic + `sentiment_metrics` still use `VITE_ENABLE_AI` where applicable.
 */
export function isRemoteToneEnabled(): boolean {
  return env.VITE_ENABLE_REMOTE_TONE === 'true';
}

/** Persist connection debug events to IndexedDB (operator diagnostics). Off unless dev or explicit opt-in. */
export function isConnectionDebugLogEnabled(): boolean {
  return env.DEV || env.VITE_DEBUG_CONNECTION_LOG === 'true';
}

/**
 * Demo squad shortcuts (create demo, static demo session route). Disabled in production builds unless explicitly enabled (e.g. staging).
 */
export function isDemoSquadShortcutsEnabled(): boolean {
  return env.DEV || env.VITE_ENABLE_DEMO_SQUAD === 'true';
}

/**
 * Hash-only ZK path for local/dev speed. **Production builds fail if `VITE_ZK_STUB=true`** (`vite.config.ts`).
 * **MVP policy:** ship real Semaphore + Edge verification (`VITE_ZK_STUB=false`); reserve stub for developers only.
 */
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
