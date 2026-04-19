import { useEffect, useRef, useState } from 'react';
import { decodeMessagePayloadAdaptive, type Database } from '../lib';

type MessageRow = Database['public']['Tables']['messages']['Row'];

/**
 * Decrypts message payloads incrementally (new ids only) instead of re-decrypting the full list on every update.
 */
export function useMessagePlaintexts(messages: MessageRow[], cryptoKey: CryptoKey | null) {
  const cacheRef = useRef<Record<string, string>>({});
  const [byId, setById] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!cryptoKey) {
      cacheRef.current = {};
      setById({});
      return;
    }

    let cancelled = false;
    const ids = new Set(messages.map((m) => m.id));

    for (const k of Object.keys(cacheRef.current)) {
      if (!ids.has(k)) delete cacheRef.current[k];
    }

    const missing = messages.filter((m) => cacheRef.current[m.id] === undefined);

    if (missing.length === 0) {
      setById((prev) => {
        const next = { ...cacheRef.current };
        const pk = Object.keys(prev);
        const nk = Object.keys(next);
        if (pk.length !== nk.length) return next;
        for (const k of nk) {
          if (prev[k] !== next[k]) return next;
        }
        return prev;
      });
      return;
    }

    void (async () => {
      await Promise.all(
        missing.map(async (m) => {
          const text = await decodeMessagePayloadAdaptive(m.payload_ciphertext, cryptoKey);
          if (!cancelled) {
            cacheRef.current[m.id] = text;
          }
        }),
      );
      if (!cancelled) {
        setById({ ...cacheRef.current });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [messages, cryptoKey]);

  return byId;
}
