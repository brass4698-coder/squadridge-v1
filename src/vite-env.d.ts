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
   * When `true`, allows bundled MENDguild demo Semaphore decoys in production bundles.
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
  /**
   * Issuer-managed anonymity group `group_id` (RFC: rfc-issuer-managed-anonymity-group).
   * Optional: when set together with the manifest URL and signing key, the client proof
   * path builds the Semaphore group from the issuer's published Merkle root and forwards
   * `issuer_group_id` to the Edge verifier so it can cross-check against `issuer_groups.current_root`.
   * Leave unset for the decoy / demo path.
   */
  readonly VITE_ISSUER_GROUP_ID?: string;
  /** HTTPS URL serving the signed issuer manifest JSON. Required with `VITE_ISSUER_GROUP_ID`. */
  readonly VITE_ISSUER_MANIFEST_URL?: string;
  /** Pinned Ed25519 public key (base64url, 32 bytes raw). Required with `VITE_ISSUER_GROUP_ID`. */
  readonly VITE_ISSUER_SIGNING_KEY_BASE64URL?: string;
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
