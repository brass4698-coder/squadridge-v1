import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from './database.types';

const PENDING_INVITE_CODE_KEY = 'squadridge_pending_invite_code';

export type InviteClaim = {
  claim_id: string;
  invite_id: string;
  cohort_key: string;
  cohort_label: string;
  allow_matchmaking: boolean;
  claimed_at: string;
  invite_expires_at: string | null;
  code_hint: string | null;
  metadata: Json;
};

function isSafePath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}

export function normalizeInviteCode(code: string): string {
  return code.trim().toLowerCase().replace(/\s+/g, '');
}

export function getPendingInviteCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = sessionStorage.getItem(PENDING_INVITE_CODE_KEY);
    return value ? normalizeInviteCode(value) : null;
  } catch {
    return null;
  }
}

export function setPendingInviteCode(code: string): void {
  if (typeof window === 'undefined') return;
  const normalized = normalizeInviteCode(code);
  try {
    if (normalized) sessionStorage.setItem(PENDING_INVITE_CODE_KEY, normalized);
    else sessionStorage.removeItem(PENDING_INVITE_CODE_KEY);
  } catch {
    /* ignore */
  }
}

export function clearPendingInviteCode(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(PENDING_INVITE_CODE_KEY);
  } catch {
    /* ignore */
  }
}

export function buildInviteContinuationPath(code: string, continuePath = '/find-squad'): string {
  const normalized = normalizeInviteCode(code);
  const params = new URLSearchParams();
  if (normalized) params.set('code', normalized);
  if (continuePath !== '/find-squad' && isSafePath(continuePath)) {
    params.set('continue', continuePath);
  }
  const query = params.toString();
  return query ? `/invite?${query}` : '/invite';
}

export function withPendingInvitePath(targetPath: string): string {
  if (!isSafePath(targetPath)) return '/';
  const pendingCode = getPendingInviteCode();
  return pendingCode ? buildInviteContinuationPath(pendingCode, targetPath) : targetPath;
}

export function attachInviteCohortToPoolKey(poolKey: string, cohortKey: string): string {
  const normalizedCohort = cohortKey.trim().toLowerCase();
  return `cohort:${normalizedCohort}|${poolKey}`;
}

function parseInviteClaim(data: unknown): InviteClaim | null {
  if (!data || typeof data !== 'object') return null;
  const row = data as Record<string, unknown>;
  if (
    typeof row.claim_id !== 'string' ||
    typeof row.invite_id !== 'string' ||
    typeof row.cohort_key !== 'string' ||
    typeof row.cohort_label !== 'string' ||
    typeof row.claimed_at !== 'string'
  ) {
    return null;
  }

  return {
    claim_id: row.claim_id,
    invite_id: row.invite_id,
    cohort_key: row.cohort_key,
    cohort_label: row.cohort_label,
    allow_matchmaking: row.allow_matchmaking !== false,
    claimed_at: row.claimed_at,
    invite_expires_at: typeof row.invite_expires_at === 'string' ? row.invite_expires_at : null,
    code_hint: typeof row.code_hint === 'string' ? row.code_hint : null,
    metadata: (row.metadata ?? {}) as Json,
  };
}

export async function getMyActiveInviteClaim(
  supabase: SupabaseClient<Database> | null,
): Promise<InviteClaim | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('get_my_active_invite_claim');
  if (error) throw new Error(error.message);
  return parseInviteClaim(data);
}

export async function claimInviteCode(
  supabase: SupabaseClient<Database> | null,
  code: string,
): Promise<InviteClaim> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const normalized = normalizeInviteCode(code);
  if (!normalized) throw new Error('Enter an invite code.');
  const { data, error } = await supabase.rpc('claim_invite_code', { p_code: normalized });
  if (error) throw new Error(error.message);
  const claim = parseInviteClaim(data);
  if (!claim) throw new Error('Invite validation returned no claim.');
  return claim;
}
