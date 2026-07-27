/**
 * Public ledger artifact types for a future Cloudflare Worker path (ADR 006 phase 1).
 * Not wired into the Vite/Supabase app. Dialogue bytes must never appear here.
 */

/** Canonical released instrument payload stored as a public artifact. */
export type PublicLedgerArtifact = {
  /** Stable record id (opaque; not a session dialogue id). */
  recordId: string;
  /** ISO-8601 publish time from the release process (operational, not TSA). */
  publishedAt: string;
  /** Approved outcome text used as the hash input. */
  canonicalText: string;
  /** Lowercase hex SHA-256 of canonicalText (UTF-8). */
  contentSha256: string;
  /**
   * Optional hash-chain link: SHA-256 of (prevChainSha256 || "" + "\n" + contentSha256).
   * Absent in stub mode; required once chain publish lands.
   */
  chainSha256?: string;
  prevChainSha256?: string | null;
};

export type HashVerifyResult =
  | { ok: true; contentSha256: string; chainOk: boolean | null }
  | { ok: false; reason: 'content_mismatch' | 'chain_mismatch' | 'missing_fields' };

export type PublicLedgerEnv = {
  LEDGER_BUCKET?: R2Bucket;
  SQUADRIDGE_LEDGER_MODE?: string;
};

/** Minimal R2 binding shape so this file typechecks without @cloudflare/workers-types. */
export type R2Bucket = {
  get(key: string): Promise<R2ObjectBody | null>;
};

export type R2ObjectBody = {
  text(): Promise<string>;
};
