import { useEffect, useState } from 'react';
import type { Database } from '../lib/database.types';
import { decodeMessagePayloadAdaptive } from '../lib/messagePayload';

type MessageRow = Database['public']['Tables']['messages']['Row'];

export function useMessagePlaintexts(messages: MessageRow[], cryptoKey: CryptoKey | null) {
  const [byId, setById] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next: Record<string, string> = {};
      await Promise.all(
        messages.map(async (m) => {
          next[m.id] = await decodeMessagePayloadAdaptive(m.payload_ciphertext, cryptoKey);
        }),
      );
      if (!cancelled) {
        setById(next);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [messages, cryptoKey]);

  return byId;
}
