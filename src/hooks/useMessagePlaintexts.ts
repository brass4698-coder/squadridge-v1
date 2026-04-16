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
  /** Cache: message id → { ciphertext fingerprint, decrypted text } */
  const cacheRef = useRef(new Map<string, { fp: string; text: string }>());
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
