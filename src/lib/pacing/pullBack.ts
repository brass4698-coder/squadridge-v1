import { isSupabaseConfigured } from '../env';
import { buildIdempotencyKey } from '../idempotency';
import { supabase } from '../../utils/supabase';
import { logWarn, safeErrorMessage } from '../log';

export type PullBackResult =
  | { ok: true; alreadyRetracted?: boolean }
  | { ok: false; error: string; code?: string };

/**
 * Authoritative pull-back via Edge Function when available.
 * Idempotent: repeating the same messageId (+ optional Idempotency-Key) is safe.
 * Falls back to direct status update for local/demo paths.
 */
export async function pullBackMessage(
  messageId: string,
  options?: { idempotencyKey?: string },
): Promise<PullBackResult> {
  if (!messageId.trim()) {
    return { ok: false, error: 'missing_message_id', code: 'invalid' };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { ok: true };
  }

  try {
    const idempotencyKey = options?.idempotencyKey ?? buildIdempotencyKey(['pull-back', messageId]);

    const { data, error } = await supabase.functions.invoke('pull-back', {
      body: {
        message_id: messageId,
        idempotency_key: idempotencyKey,
      },
    });

    if (error) {
      // Fallback: client update (RLS still applies)
      const { error: updateError } = await supabase
        .from('messages')
        .update({ status: 'retracted' })
        .eq('id', messageId)
        .neq('status', 'retracted');
      if (updateError) {
        logWarn('pull_back_fallback_failed', {
          feature: 'pacing',
          error_message: safeErrorMessage(updateError),
        });
        return { ok: false, error: updateError.message, code: 'update_failed' };
      }
      return { ok: true };
    }

    const already =
      data &&
      typeof data === 'object' &&
      'already_retracted' in data &&
      Boolean((data as { already_retracted?: boolean }).already_retracted);

    return { ok: true, alreadyRetracted: already };
  } catch (e) {
    logWarn('pull_back_invoke_failed', {
      feature: 'pacing',
      error_message: safeErrorMessage(e),
    });
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'pull_back_failed',
      code: 'invoke_failed',
    };
  }
}
