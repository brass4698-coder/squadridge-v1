import { useCallback, useEffect, useRef, useState } from 'react';
import type { WorkerRequest, WorkerResponse } from '../workers/translationWorkerTypes';

/** If the WASM/model bundle never finishes loading, fall back to original text so the session stays usable. */
const MODEL_LOAD_FALLBACK_MS = 90_000;

/**
 * Client-side translation via a dedicated Web Worker (Transformers.js never runs on the main thread).
 * The worker is created on first `translate()` so users who never translate do not download the worker chunk.
 */
export function useTranslation() {
  const workerRef = useRef<Worker | null>(null);
  const nextId = useRef(0);
  const pending = useRef(
    new Map<
      number,
      { resolve: (v: string) => void; reject: (e: Error) => void; fallback: string }
    >(),
  );
  const [modelLoading, setModelLoading] = useState(false);
  const inFlight = useRef(0);

  /** Resolve with original text so unmount does not surface as an unhandled rejection. */
  const settleAllPendingWithFallback = useCallback(() => {
    for (const [, p] of pending.current) {
      p.resolve(p.fallback);
    }
    pending.current.clear();
    inFlight.current = 0;
    setModelLoading(false);
  }, []);

  const attachWorkerHandlers = useCallback(
    (w: Worker) => {
      w.onmessage = (ev: MessageEvent<WorkerResponse>) => {
        const data = ev.data;
        const wait = pending.current.get(data.id);
        if (!wait) return;
        pending.current.delete(data.id);
        inFlight.current -= 1;
        if (inFlight.current <= 0) {
          inFlight.current = 0;
          setModelLoading(false);
        }

        if (data.kind === 'result') {
          wait.resolve(data.text);
        } else {
          wait.reject(new Error(data.message));
        }
      };

      w.onerror = (err) => {
        for (const [, p] of pending.current) {
          p.reject(new Error(err.message));
        }
        pending.current.clear();
        inFlight.current = 0;
        setModelLoading(false);
      };
    },
    [],
  );

  const ensureWorker = useCallback((): Worker | null => {
    if (workerRef.current) return workerRef.current;
    try {
      const w = new Worker(new URL('../workers/translation.worker.ts', import.meta.url), {
        type: 'module',
      });
      attachWorkerHandlers(w);
      workerRef.current = w;
      return w;
    } catch {
      return null;
    }
  }, [attachWorkerHandlers]);

  useEffect(() => {
    return () => {
      settleAllPendingWithFallback();
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [settleAllPendingWithFallback]);

  useEffect(() => {
    if (!modelLoading) return;
    const t = window.setTimeout(() => {
      settleAllPendingWithFallback();
    }, MODEL_LOAD_FALLBACK_MS);
    return () => clearTimeout(t);
  }, [modelLoading, settleAllPendingWithFallback]);

  const translate = useCallback((text: string, targetLang: string): Promise<string> => {
    const w = ensureWorker();
    if (!w) {
      return Promise.resolve(text);
    }

    return new Promise((resolve, reject) => {
      const id = ++nextId.current;
      pending.current.set(id, { resolve, reject, fallback: text });
      inFlight.current += 1;
      setModelLoading(true);
      const req: WorkerRequest = { id, kind: 'translate', text, targetLang };
      w.postMessage(req);
    });
  }, [ensureWorker]);

  return { translate, modelLoading };
}
