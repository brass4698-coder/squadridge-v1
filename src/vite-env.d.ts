/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  /** Legacy JWT; use publishable key for new projects. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Preferred public key (sb_publishable_...). */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_ENABLE_AI?: string;
  /** Optional future Edge tone model; see `fetchRemoteToneInsight` in src/lib/ai/pipeline.ts */
  readonly VITE_ENABLE_REMOTE_TONE?: string;
  /** IndexedDB connection debug log (default: dev only). */
  readonly VITE_DEBUG_CONNECTION_LOG?: string;
  /** Enable demo squad shortcuts in production-like builds (e.g. staging). */
  readonly VITE_ENABLE_DEMO_SQUAD?: string;
  readonly VITE_ZK_STUB?: string;
  /**
   * When `true`, allows bundled Squadridge demo Semaphore decoys in production bundles.
   * Omit or `false` to require issuer-provided identities (see src/lib/zk/buildAnonymityGroup.ts).
   */
  readonly VITE_SEMAPHORE_DEMO_GROUP?: string;
  /**
   * Production escape hatch for `VITE_SEMAPHORE_DEMO_GROUP`. Required *in addition to*
   * the demo flag for any `mode === 'production'` build that intentionally ships bundled
   * decoys (e.g. controlled internal demo). Default off; CI prod builds reject when set.
   */
  readonly VITE_ALLOW_DEMO_DECOYS_IN_PROD?: string;
  /** Research UI for zkTLS-style flows (default off). */
  readonly VITE_ZKTLS_LABS?: string;
  /** External waitlist URL (Typeform, Tally, etc.). */
  readonly VITE_WAITLIST_FORM_URL?: string;
  /** Public contact for footer (optional) */
  readonly VITE_CONTACT_EMAIL?: string;
  /** Sentry browser SDK (optional; omit in local dev if unused). */
  readonly VITE_SENTRY_DSN?: string;
  /** Overrides Sentry environment name (defaults to Vite `mode`). */
  readonly VITE_SENTRY_ENVIRONMENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
