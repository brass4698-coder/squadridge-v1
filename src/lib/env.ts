import { z } from 'zod';
import { logError } from './log';

/** Boolean flags exposed as the strings `"true"` / `"false"` in Vite env. */
const viteBoolString = z.enum(['true', 'false']);

/** Empty or unset in `.env` becomes `''` or `undefined` — treat as optional. */
const optionalUrlOrEmpty = z.union([z.string().url(), z.literal('')]).optional();

const envSchema = z
  .object({
    VITE_SITE_URL: optionalUrlOrEmpty,
    VITE_SUPABASE_URL: z.string().url(),
    VITE_SUPABASE_ANON_KEY: z.string().optional(),
    VITE_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
    VITE_ENABLE_AI: viteBoolString.optional(),
    VITE_ENABLE_REMOTE_TONE: viteBoolString.optional(),
    VITE_DEBUG_CONNECTION_LOG: viteBoolString.optional(),
    VITE_ENABLE_DEMO_SQUAD: viteBoolString.optional(),
    VITE_ZK_STUB: viteBoolString.optional(),
    VITE_ZKTLS_LABS: viteBoolString.optional(),
    VITE_WAITLIST_FORM_URL: optionalUrlOrEmpty,
    VITE_CONTACT_EMAIL: z.union([z.literal(''), z.string().email()]).optional(),
    VITE_SENTRY_DSN: z.union([z.string().url(), z.literal('')]).optional(),
    VITE_SENTRY_ENVIRONMENT: z.string().optional(),
    VITE_SENTRY_USER_HASH_SALT: z.string().optional(),
    VITE_ENABLE_EDGE_RATE_LIMIT: viteBoolString.optional(),
    /** When `true`, App.v2 shows MaintenancePage for all routes except health probes. */
    VITE_MAINTENANCE_MODE: viteBoolString.optional(),
  })
  .superRefine((data, ctx) => {
    const pub = data.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
    const anon = data.VITE_SUPABASE_ANON_KEY?.trim();
    if (!pub && !anon) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Set VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY',
        path: ['VITE_SUPABASE_PUBLISHABLE_KEY'],
      });
    }
    const dsn = data.VITE_SENTRY_DSN?.trim();
    const salt = data.VITE_SENTRY_USER_HASH_SALT?.trim();
    /** When Sentry is wired up in production, refuse to ship without a salt — keeps
     * the hashed user id meaningful (see src/lib/sentryUserHash.ts). The bootstrap
     * runs in DEV too; we only enforce the gate in PROD builds. */
    if (import.meta.env.PROD && dsn && !salt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'VITE_SENTRY_USER_HASH_SALT is required when VITE_SENTRY_DSN is set in production builds',
        path: ['VITE_SENTRY_USER_HASH_SALT'],
      });
    }
  });

export type ValidatedViteEnv = z.infer<typeof envSchema>;

/**
 * Validates all `VITE_*` variables from `import.meta.env` at startup.
 * Call from the app entry (`env-bootstrap.ts`) before other application modules load.
 */
export const validateEnv = (): ValidatedViteEnv => {
  const result = envSchema.safeParse(import.meta.env);
  if (!result.success) {
    // Log only the *names* of the offending fields. The values may include
    // Supabase URLs or partial keys; we never want to echo those into a console
    // that could be screenshotted or persisted to Sentry breadcrumbs.
    const fieldErrors = result.error.flatten().fieldErrors ?? {};
    const offendingKeys = Object.keys(fieldErrors).join(',');
    logError('env_validation_failed', {
      feature: 'env_bootstrap',
      error_code: 'invalid_env',
      error_message: offendingKeys.length > 0 ? `keys=${offendingKeys}` : 'unknown',
    });
    throw new Error('Environment validation failed');
  }
  return result.data;
};

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
 * Allows the legacy dev path (`submitZkProofStub`) unless `VITE_ZK_STUB=false`.
 * The hash-only stub is only *active* when `VITE_ZK_STUB=true` — see {@link isZkHashStubExplicit}.
 * Production builds fail when `VITE_ZK_STUB=true` (enforced in `vite.config.ts`).
 */
export function isZkStubDevPathAllowed(): boolean {
  return env.VITE_ZK_STUB !== 'false';
}

/** True only when `VITE_ZK_STUB=true` — explicit hash stub; use for UI warnings. */
export function isZkHashStubExplicit(): boolean {
  return env.VITE_ZK_STUB === 'true';
}

/** Research: zkTLS / web-origin proof experiments. Default off; see docs/technical/rfc-zktls-attribute-proofs.md */
export function isZkTlsLabsEnabled(): boolean {
  return env.VITE_ZKTLS_LABS === 'true';
}

/**
 * Pilot / demo flags in one place for UI gating (see pilot readiness review).
 */
export function getPilotSurfaceConfig(): {
  zkStubExplicit: boolean;
  demoSquadShortcutsEnabled: boolean;
} {
  return {
    zkStubExplicit: env.VITE_ZK_STUB === 'true',
    demoSquadShortcutsEnabled: isDemoSquadShortcutsEnabled(),
  };
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

/** Ops kill-switch: show maintenance page instead of the app shell. */
export function isMaintenanceMode(): boolean {
  return env.VITE_MAINTENANCE_MODE === 'true';
}
