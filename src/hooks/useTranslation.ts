import { useCallback, useEffect, useRef, useState } from 'react';

type WorkerReq = { id: number; kind: 'translate'; text: string; targetLang: string };

type WorkerRes =
  | { id: number; kind: 'result'; text: string }
  | { id: number; kind: 'error'; message: string };

/**
 * Client-side translation via a dedicated Web Worker (Transformers.js never runs on the main thread).
 */
export function useTranslation() {
  const workerRef = useRef<Worker | null>(null);
  const nextId = useRef(0);
  const pending = useRef(
    new Map<number, { resolve: (v: string) => void; reject: (e: Error) => void }>(),
  );
  const [modelLoading, setModelLoading] = useState(false);
  const inFlight = useRef(0);

  useEffect(() => {
    const w = new Worker(new URL('../workers/translation.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = w;

    w.onmessage = (ev: MessageEvent<WorkerRes>) => {
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

    return () => {
      w.terminate();
      workerRef.current = null;
    };
  }, []);

  const translate = useCallback((text: string, targetLang: string): Promise<string> => {
    const w = workerRef.current;
    if (!w) {
      return Promise.resolve(text);
    }

    return new Promise((resolve, reject) => {
      const id = ++nextId.current;
      pending.current.set(id, { resolve, reject });
      inFlight.current += 1;
      setModelLoading(true);
      const req: WorkerReq = { id, kind: 'translate', text, targetLang };
      w.postMessage(req);
    });
  }, []);

  return { translate, modelLoading };
}
