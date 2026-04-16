import { useEffect, useRef, useState } from 'react';
import type { Database } from '../lib/database.types';
import { decodeMessagePayloadAdaptive } from '../lib/messagePayload';

type MessageRow = Database['public']['Tables']['messages']['Row'];

/**
 * Decrypts message payloads and returns a map of id → plaintext.
 *
 * Incremental: only decrypts messages whose ciphertext has changed since the last render, avoiding
 * an O(n) Web Crypto pass when the `messages` array reference changes but content is the same
 * (e.g. on every Realtime event). All cached values are invalidated when `cryptoKey` changes.
 */
export function useMessagePlaintexts(messages: MessageRow[], cryptoKey: CryptoKey | null) {
  const [byId, setById] = useState<Record<string, string>>({});
  /**
   * Cache: message id → { fp: payload_ciphertext string used as fingerprint, text: decrypted plaintext }.
   * Using payload_ciphertext as the fingerprint is safe because the ciphertext column is append-only in
   * the current schema (messages are retracted by changing status, not by overwriting ciphertext). If that
   * assumption changes in future, update the fingerprint to include `status` or a version counter.
   */
  const cacheRef = useRef(new Map<string, { fp: string; text: string }>());
  /**
   * Track the CryptoKey instance by reference. A new key object is produced by `importAes256GcmKeyFromBase64Url`
   * only when `ensureSquadMessageKey` runs (squad data load / first send), so reference equality is a reliable
   * signal that the key material changed. If the same raw bytes were imported a second time, the references
   * would differ and a full re-decrypt would occur — this is the correct and safe behaviour.
   */
  const prevKeyRef = useRef<CryptoKey | null>(null);

  useEffect(() => {
    // When the key changes all cached plaintexts are invalid — clear and re-decrypt everything.
    if (prevKeyRef.current !== cryptoKey) {
      prevKeyRef.current = cryptoKey;
      cacheRef.current.clear();
    }

    // Determine which messages need (re-)decryption.
    const toDecrypt = messages.filter((m) => {
      const cached = cacheRef.current.get(m.id);
      return !cached || cached.fp !== m.payload_ciphertext;
    });

    if (toDecrypt.length === 0) {
      // Rebuild result map from cache (handles row removals and no-op reference changes).
      const next: Record<string, string> = {};
      for (const m of messages) {
        const c = cacheRef.current.get(m.id);
        if (c) next[m.id] = c.text;
      }
      setById(next);
      return;
    }

    let cancelled = false;
    void (async () => {
      await Promise.all(
        toDecrypt.map(async (m) => {
          const text = await decodeMessagePayloadAdaptive(m.payload_ciphertext, cryptoKey);
          if (!cancelled) {
            cacheRef.current.set(m.id, { fp: m.payload_ciphertext, text });
          }
        }),
      );
      if (!cancelled) {
        const next: Record<string, string> = {};
        for (const m of messages) {
          const c = cacheRef.current.get(m.id);
          if (c) next[m.id] = c.text;
        }
        setById(next);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [messages, cryptoKey]);

  return byId;
}
