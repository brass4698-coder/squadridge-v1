/// <reference lib="webworker" />

/**
 * Dedicated worker: imports the squad AES key once, then decrypts message payloads off the main thread.
 * Bundler output must include deps from `@/lib` (Vite resolves `import.meta.url`).
 */
import { importAes256GcmKeyFromBase64Url } from '../lib/messageCrypto';
import { decodeMessagePayloadAdaptive } from '../lib/messagePayload';

export type WorkerInMsg =
  | { type: 'init'; keyBase64: string }
  | {
      type: 'decrypt';
      requestId: number;
      items: Array<{ mid: string; ciphertext: string }>;
    };

export type WorkerOutMsg =
  | { type: 'ready' }
  | { type: 'decrypt-result'; requestId: number; results: Record<string, string> }
  | { type: 'error'; message: string; requestId?: number };

let keyPromise: Promise<CryptoKey | null> | null = null;

(globalThis as unknown as DedicatedWorkerGlobalScope).onmessage = async (
  ev: MessageEvent<WorkerInMsg>,
) => {
  const data = ev.data;
  try {
    if (!data || typeof data !== 'object') return;
    if (data.type === 'init') {
      keyPromise = importAes256GcmKeyFromBase64Url(data.keyBase64).then((k) => k);
      await keyPromise;
      (globalThis as unknown as DedicatedWorkerGlobalScope).postMessage({
        type: 'ready',
      } satisfies WorkerOutMsg);
      return;
    }

    if (data.type !== 'decrypt') return;

    const key = keyPromise ? await keyPromise : null;
    const results: Record<string, string> = {};
    await Promise.all(
      data.items.map(async ({ mid, ciphertext }) => {
        results[mid] = await decodeMessagePayloadAdaptive(ciphertext, key);
      }),
    );

    (globalThis as unknown as DedicatedWorkerGlobalScope).postMessage({
      type: 'decrypt-result',
      requestId: data.requestId,
      results,
    } satisfies WorkerOutMsg);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const requestId =
      ev.data?.type === 'decrypt' ? (ev.data as { requestId?: number }).requestId : undefined;
    (globalThis as unknown as DedicatedWorkerGlobalScope).postMessage({
      type: 'error',
      message: msg,
      requestId,
    } satisfies WorkerOutMsg);
  }
};
