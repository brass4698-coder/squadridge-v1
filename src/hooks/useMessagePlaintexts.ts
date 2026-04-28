import { useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { decodeMessagePayloadAdaptive, type Database } from '../lib';

type MessageRow = Database['public']['Tables']['messages']['Row'];

let requestSeq = 0;

function canUseDecryptWorker(): boolean {
  try {
    return typeof Worker !== 'undefined' && typeof import.meta !== 'undefined' && !!import.meta.url;
  } catch {
    return false;
  }
}

async function decryptBatchInline(
  items: MessageRow[],
  cryptoKey: CryptoKey | null,
  cacheRef: MutableRefObject<Record<string, string>>,
) {
  await Promise.all(
    items.map(async (m) => {
      const text = await decodeMessagePayloadAdaptive(m.payload_ciphertext, cryptoKey);
      cacheRef.current[m.id] = text;
    }),
  );
}

async function initDecryptWorker(keyBase64: string): Promise<Worker> {
  let worker: Worker;
  try {
    worker = new Worker(new URL('../workers/messageDecryption.worker.ts', import.meta.url), {
      type: 'module',
    });
  } catch (e) {
    throw e instanceof Error ? e : new Error('Worker unavailable');
  }

  try {
    await Promise.race([
      new Promise<void>((resolve, reject) => {
        const onMessage = (ev: MessageEvent) => {
          const d = ev.data as { type?: string; message?: string; requestId?: number };
          if (d?.type === 'ready') {
            worker.removeEventListener('message', onMessage);
            resolve();
            return;
          }
          if (d?.type === 'error' && d.requestId === undefined) {
            worker.removeEventListener('message', onMessage);
            reject(new Error(d.message ?? 'worker init failed'));
          }
        };
        worker.addEventListener('message', onMessage);
        worker.postMessage({ type: 'init', keyBase64 });
      }),
      new Promise<void>((_, reject) => {
        window.setTimeout(() => reject(new Error('Decrypt worker init timeout')), 10_000);
      }),
    ]);
    return worker;
  } catch (e) {
    worker.terminate();
    throw e;
  }
}

async function decryptBatchInWorker(
  worker: Worker,
  items: MessageRow[],
): Promise<Record<string, string>> {
  const requestId = ++requestSeq;
  return new Promise((resolve, reject) => {
    const handle = (ev: MessageEvent) => {
      const d = ev.data as {
        type?: string;
        requestId?: number;
        results?: Record<string, string>;
        message?: string;
      };
      if (d?.type === 'decrypt-result' && d.requestId === requestId) {
        worker.removeEventListener('message', handle);
        resolve(d.results ?? {});
        return;
      }
      if (d?.type === 'error' && (d.requestId === undefined || d.requestId === requestId)) {
        worker.removeEventListener('message', handle);
        reject(new Error(d.message ?? 'decrypt worker error'));
      }
    };
    worker.addEventListener('message', handle);
    worker.postMessage({
      type: 'decrypt',
      requestId,
      items: items.map((m) => ({ mid: m.id, ciphertext: m.payload_ciphertext })),
    });
  });
}

/**
 * Decrypts message payloads incrementally (new ids only). When `keyMaterialBase64` is set and Web Workers are
 * available, AES work runs in a short-lived worker;otherwise decrypts on the main thread.
 */
export function useMessagePlaintexts(
  messages: MessageRow[],
  cryptoKey: CryptoKey | null,
  keyMaterialBase64: string | null = null,
) {
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

    const shouldTryWorker =
      Boolean(keyMaterialBase64?.length) && keyMaterialBase64 !== null && canUseDecryptWorker();

    void (async () => {
      try {
        if (shouldTryWorker && keyMaterialBase64) {
          const worker = await initDecryptWorker(keyMaterialBase64);
          try {
            const results = await decryptBatchInWorker(worker, missing);
            if (!cancelled) Object.assign(cacheRef.current, results);
          } finally {
            worker.terminate();
          }
        } else {
          await decryptBatchInline(missing, cryptoKey, cacheRef);
        }
      } catch {
        await decryptBatchInline(missing, cryptoKey, cacheRef);
      }
      if (!cancelled) setById({ ...cacheRef.current });
    })();

    return () => {
      cancelled = true;
    };
  }, [messages, cryptoKey, keyMaterialBase64]);

  return byId;
}
