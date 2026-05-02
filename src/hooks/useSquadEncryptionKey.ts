import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { captureAppError, ensureSquadMessageKey, type Database } from '../lib';

type SquadRow = Database['public']['Tables']['squads']['Row'];

export interface SquadEncryptionKeyState {
  messageKey: CryptoKey | null;
  /** Base64url-encoded raw key material — required for the decrypt worker handoff. */
  messageKeyMaterial: string | null;
}

/**
 * Bootstraps the per-squad message encryption key for a session. Wraps the
 * idempotent {@link ensureSquadMessageKey} call: when the squad row carries no
 * stored key the helper provisions one server-side, so we ask the parent to
 * `refetchSquad` afterwards to pick up the freshly-stored ciphertext key.
 *
 * Failures are reported via `captureAppError(feature: 'session_message_key')`
 * so operators see them in Sentry; the returned state stays `null` and the
 * caller MUST treat that as "encryption unavailable" rather than rendering
 * unencrypted plaintext.
 */
export function useSquadEncryptionKey(
  supabase: SupabaseClient<Database> | null,
  squadId: string | undefined,
  squad: SquadRow | null | undefined,
  refetchSquad: () => Promise<unknown>,
): SquadEncryptionKeyState {
  const [messageKey, setMessageKey] = useState<CryptoKey | null>(null);
  const [messageKeyMaterial, setMessageKeyMaterial] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !squadId || !squad) {
      setMessageKey(null);
      setMessageKeyMaterial(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const { key, keyBase64 } = await ensureSquadMessageKey(supabase, squadId, squad);
        if (!cancelled) {
          setMessageKey(key);
          setMessageKeyMaterial(keyBase64);
        }
        if (!squad.message_encryption_key) {
          await refetchSquad();
        }
      } catch (e) {
        captureAppError(e, { feature: 'session_message_key', extra: { squadId } });
        if (!cancelled) {
          setMessageKey(null);
          setMessageKeyMaterial(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, squadId, squad, refetchSquad]);

  return { messageKey, messageKeyMaterial };
}
