/**
 * Browser-side wrapper around the `mint-deck-share` Edge Function.
 *
 * Returns either:
 *   - an absolute URL the caller can `window.open` / `navigator.clipboard.writeText`
 *   - or a typed error explaining why minting was refused.
 *
 * The function URL is composed from `VITE_SUPABASE_URL` so the same code
 * works locally (`http://127.0.0.1:54321`) and in production. Callers are
 * expected to be moderators; the Edge Function rejects everyone else.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseUrl } from '../env';
import type { Database } from '../database.types';

export type DeckShareAudience = 'self' | 'share';

export interface MintDeckShareInput {
  deckId: string;
  audience: DeckShareAudience;
  /** Optional editorial label echoed back to the gate; required for `share` to succeed. */
  status?: 'draft' | 'internal' | 'external_ready' | 'needs_review';
  /** Override the per-audience default TTL. Server clamps to its max. */
  ttlSeconds?: number;
}

export interface MintDeckShareSuccess {
  ok: true;
  absoluteUrl: string;
  jti: string;
  expiresAt: string;
  audience: DeckShareAudience;
  ttlSeconds: number;
}

export interface MintDeckShareFailure {
  ok: false;
  errorCode: string;
  message: string;
}

export type MintDeckShareResult = MintDeckShareSuccess | MintDeckShareFailure;

interface EdgeMintResponse {
  ok?: boolean;
  errorCode?: string;
  error?: string;
  relativePath?: string;
  jti?: string;
  expiresAt?: string;
  audience?: DeckShareAudience;
  ttlSeconds?: number;
}

export async function mintDeckShare(
  supabase: SupabaseClient<Database>,
  input: MintDeckShareInput,
): Promise<MintDeckShareResult> {
  const supabaseUrl = getSupabaseUrl()?.replace(/\/$/, '');
  if (!supabaseUrl) {
    return {
      ok: false,
      errorCode: 'NO_SUPABASE_URL',
      message: 'Supabase URL is not configured.',
    };
  }

  const { data, error } = await supabase.functions.invoke<EdgeMintResponse>('mint-deck-share', {
    body: {
      deckId: input.deckId,
      audience: input.audience,
      status: input.status,
      ttlSeconds: input.ttlSeconds,
    },
  });

  if (error) {
    return {
      ok: false,
      errorCode: 'INVOKE_FAILED',
      message: error.message ?? 'Could not reach mint-deck-share.',
    };
  }
  if (!data?.ok || !data.relativePath || !data.jti || !data.expiresAt || !data.audience) {
    return {
      ok: false,
      errorCode: data?.errorCode ?? 'UNKNOWN',
      message: data?.error ?? 'Unexpected response from mint-deck-share.',
    };
  }

  const absoluteUrl = `${supabaseUrl}${data.relativePath}`;
  return {
    ok: true,
    absoluteUrl,
    jti: data.jti,
    expiresAt: data.expiresAt,
    audience: data.audience,
    ttlSeconds: data.ttlSeconds ?? 0,
  };
}
