/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  /** Legacy JWT; use publishable key for new projects. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Preferred public key (sb_publishable_...). */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_ENABLE_AI?: string;
  readonly VITE_ZK_STUB?: string;
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
