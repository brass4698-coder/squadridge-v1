import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Anonymous → verified squad-membership hand-off.
 *
 * Three-step flow (see migration `20260428230000_demo_claim_consent_token.sql`):
 *
 *   1. While signed in as the anonymous demo user, call {@link createDemoSessionClaim}
 *      to obtain a stable claim code. Display it to the user and have them carry it
 *      to the verified-sign-in path.
 *   2. While signed in as the verified user, call {@link issueDemoClaimConsent} with
 *      the claim code. Returns a short-lived (5 min) consent token that the UI must
 *      attach to the finalize call. Render an explicit consent modal between this
 *      step and step 3 — that is the moment the verified user authorizes the merge.
 *   3. Call {@link finalizeDemoSessionClaim} with both the code and the token.
 *      Returns a structured `ClaimFinalizeResult` instead of throwing on user-visible
 *      conditions (expired token, conflict, etc.) so the UI can render specific copy.
 */

/** Error codes the consent + finalize RPCs can return. Keep in sync with migration SQL. */
export type DemoClaimErrorCode =
  | 'authentication_required'
  | 'invalid_claim'
  | 'claim_not_found'
  | 'self_consent_forbidden'
  | 'self_finalize_forbidden'
  | 'consent_token_required'
  | 'consent_token_mismatch'
  | 'consent_token_expired';

export type DemoClaimConsent =
  | { ok: true; consent_token: string; expires_at: string }
  | { ok: false; error_code: DemoClaimErrorCode };

export type DemoClaimFinalizeResult =
  | { ok: true; migrated_memberships: number }
  | { ok: false; error_code: DemoClaimErrorCode };

/**
 * Obtain a transfer code while signed in as the anonymous/demo user.
 * Verified sign-in completes the hand-off via {@link issueDemoClaimConsent} +
 * {@link finalizeDemoSessionClaim}.
 */
export async function createDemoSessionClaim(supabase: SupabaseClient<Database>): Promise<string> {
  const { data, error } = await supabase.rpc('create_demo_session_claim');
  if (error) throw error;
  return data;
}

/**
 * Verified user requests consent to migrate squad membership for the given claim code.
 * Returns a structured response; the `consent_token` (when present) is short-lived (5 min)
 * and must be passed to {@link finalizeDemoSessionClaim}.
 *
 * Network and auth errors still throw — `error_code` is reserved for *expected* user-facing
 * conditions (claim not found, self-consent attempt, etc.) so the UI can render copy that
 * matches the situation.
 */
export async function issueDemoClaimConsent(
  supabase: SupabaseClient<Database>,
  claimCode: string,
): Promise<DemoClaimConsent> {
  const { data, error } = await supabase.rpc('issue_demo_claim_consent', {
    p_claim_code: claimCode.trim(),
  });
  if (error) throw error;
  return parseConsent(data);
}

/**
 * Apply a claim code (after consent) — migrates squad_members rows where there is no conflict.
 * Returns a structured response; the UI should branch on `result.ok`.
 */
export async function finalizeDemoSessionClaim(
  supabase: SupabaseClient<Database>,
  claimCode: string,
  consentToken: string,
): Promise<DemoClaimFinalizeResult> {
  const { data, error } = await supabase.rpc('finalize_demo_session_claim', {
    p_claim_code: claimCode.trim(),
    p_consent_token: consentToken.trim(),
  });
  if (error) throw error;
  return parseFinalize(data);
}

/** Map any of the documented error codes to a user-friendly, non-technical message. */
export function describeDemoClaimError(code: DemoClaimErrorCode): string {
  switch (code) {
    case 'authentication_required':
      return 'You need to be signed in to continue. Please sign in and try again.';
    case 'invalid_claim':
      return 'That migration code does not look right. Double-check the code and try again.';
    case 'claim_not_found':
      return 'We could not find that migration code, or it has already been used.';
    case 'self_consent_forbidden':
    case 'self_finalize_forbidden':
      return 'You are signed in as the same anonymous user that created this code. Sign in with your verified account first.';
    case 'consent_token_required':
      return 'Please grant consent before completing the migration.';
    case 'consent_token_mismatch':
      return 'Your consent has changed since you started. Please request consent again and re-confirm.';
    case 'consent_token_expired':
      return 'Your consent expired. Please request consent again and confirm within 5 minutes.';
  }
}

function parseConsent(raw: unknown): DemoClaimConsent {
  const row = isJsonObject(raw) ? raw : {};
  if (
    row.ok === true &&
    typeof row.consent_token === 'string' &&
    typeof row.expires_at === 'string'
  ) {
    return { ok: true, consent_token: row.consent_token, expires_at: row.expires_at };
  }
  return { ok: false, error_code: coerceErrorCode(row.error_code) };
}

function parseFinalize(raw: unknown): DemoClaimFinalizeResult {
  const row = isJsonObject(raw) ? raw : {};
  if (row.ok === true) {
    const n = row.migrated_memberships;
    return {
      ok: true,
      migrated_memberships: typeof n === 'number' ? n : Number(n ?? 0),
    };
  }
  return { ok: false, error_code: coerceErrorCode(row.error_code) };
}

function isJsonObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function coerceErrorCode(v: unknown): DemoClaimErrorCode {
  const known: DemoClaimErrorCode[] = [
    'authentication_required',
    'invalid_claim',
    'claim_not_found',
    'self_consent_forbidden',
    'self_finalize_forbidden',
    'consent_token_required',
    'consent_token_mismatch',
    'consent_token_expired',
  ];
  if (typeof v === 'string' && (known as string[]).includes(v)) {
    return v as DemoClaimErrorCode;
  }
  return 'invalid_claim';
}
