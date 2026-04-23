import { z } from 'zod';

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
    VITE_ENABLE_EDGE_RATE_LIMIT: viteBoolString.optional(),
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
  });

export type ValidatedViteEnv = z.infer<typeof envSchema>;

/**
 * Validates all `VITE_*` variables from `import.meta.env` at startup.
 * Call from the app entry (`env-bootstrap.ts`) before other modules load.
 */
export const validateEnv = (): ValidatedViteEnv => {
  const result = envSchema.safeParse(import.meta.env);
  if (!result.success) {
    console.error('Invalid environment:', result.error.flatten());
    throw new Error('Environment validation failed');
  }
  return result.data;
};

const env = import.meta.env;

/** Canonical site origin for auth redirects. Defaults to `window.location.origin`. */
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

export function getSupabaseAnonKey(): string | undefined {
  const v = env.VITE_SUPABASE_ANON_KEY;
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

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

export function isRemoteToneEnabled(): boolean {
  return env.VITE_ENABLE_REMOTE_TONE === 'true';
}

/** Persist connection debug events to IndexedDB (operator diagnostics). Off unless dev or explicit opt-in. */
export function isConnectionDebugLogEnabled(): boolean {
  return env.DEV || env.VITE_DEBUG_CONNECTION_LOG === 'true';
}

export function isDemoSquadShortcutsEnabled(): boolean {
  return env.DEV || env.VITE_ENABLE_DEMO_SQUAD === 'true';
}

export function isZkStubDevPathAllowed(): boolean {
  return env.VITE_ZK_STUB !== 'false';
}

export function isZkHashStubExplicit(): boolean {
  return env.VITE_ZK_STUB === 'true';
}

export function isZkTlsLabsEnabled(): boolean {
  return env.VITE_ZKTLS_LABS === 'true';
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
