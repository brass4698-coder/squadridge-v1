import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getSupabasePublicKey, getSupabaseUrl } from './env';

/**
 * Calls the `rate-limit` Edge Function (Upstash). Skips when disabled or when Redis is not configured server-side (503 in prod is an error).
 */
export async function assertEdgeRateLimit(
  supabase: SupabaseClient<Database>,
  action: string,
): Promise<void> {
  if (import.meta.env.VITE_ENABLE_EDGE_RATE_LIMIT === 'false') return;

  const baseUrl = getSupabaseUrl()?.replace(/\/$/, '');
  const key = getSupabasePublicKey();
  if (!baseUrl || !key) return;

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return;

  const res = await fetch(`${baseUrl}/functions/v1/rate-limit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action }),
  });

  if (res.status === 429) {
    const ra = res.headers.get('retry-after');
    const hint =
      ra && /^\d+$/.test(ra.trim())
        ? ` Try again in about ${ra.trim()} seconds.`
        : ' Try again shortly.';
    throw new Error(`You’re sending requests too quickly.${hint}`);
  }
  // Upstash not configured in Edge env — fail open so messaging/matchmaking still work; deploy Redis for enforcement.
  if (res.status === 503) {
    return;
  }
  if (!res.ok) {
    throw new Error('Rate limit check failed');
  }
}
