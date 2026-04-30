import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { describeCrisisAlertResultIn } from './crisisAlertMessages';

/**
 * Out-of-band crisis alert client.
 *
 * Posts to the `crisis-alert` Edge Function (Phase 2.4 of the audit
 * remediation plan). Deliberately does **not** route through the message
 * stream so an alert reaches on-call ops even if chat is paused / archived
 * / rate-limited. The reason code enum is closed (no free-form text) so
 * stress-typed details never end up in operator logs.
 */
export type CrisisAlertReason = 'immediate_danger' | 'request_pause' | 'request_facilitator';

export type CrisisAlertResult =
  | { ok: true; id: string }
  | {
      ok: false;
      error_code: 'unauthorized' | 'forbidden' | 'rate_limited' | 'invalid' | 'server_error';
    };

export async function postCrisisAlert(
  supabase: SupabaseClient<Database>,
  squadId: string,
  reasonCode: CrisisAlertReason,
): Promise<CrisisAlertResult> {
  try {
    const { data, error } = await supabase.functions.invoke<{ ok?: boolean; id?: string }>(
      'crisis-alert',
      { body: { squad_id: squadId, reason_code: reasonCode } },
    );
    if (error) {
      const ctx = error.context as { status?: number } | undefined;
      const status = ctx?.status ?? 0;
      if (status === 401) return { ok: false, error_code: 'unauthorized' };
      if (status === 403) return { ok: false, error_code: 'forbidden' };
      if (status === 429) return { ok: false, error_code: 'rate_limited' };
      if (status >= 400 && status < 500) return { ok: false, error_code: 'invalid' };
      return { ok: false, error_code: 'server_error' };
    }
    if (data?.ok && typeof data.id === 'string') {
      return { ok: true, id: data.id };
    }
    return { ok: false, error_code: 'server_error' };
  } catch {
    return { ok: false, error_code: 'server_error' };
  }
}

/**
 * Plain-language copy for the alert button + result toasts. Default locale is
 * English; pass {@link locale} (typically `useUserPreferences().preferredLanguage`)
 * to get a localized string. Catalog lives in `crisisAlertMessages.ts`; missing
 * locales fall back to `en` automatically.
 */
export function describeCrisisAlertResult(r: CrisisAlertResult, locale?: string): string {
  return describeCrisisAlertResultIn(r, locale);
}
