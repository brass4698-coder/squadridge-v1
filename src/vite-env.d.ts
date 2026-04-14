/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  /** Legacy JWT; use publishable key for new projects. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Preferred public key (sb_publishable_...). */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_ENABLE_AI?: string;
  readonly VITE_ZK_STUB?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
