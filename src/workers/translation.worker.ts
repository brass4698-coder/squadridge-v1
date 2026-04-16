/**
 * Web Worker entry — intentionally minimal so the main bundle does not pull @xenova/transformers.
 * `translationWorkerImpl.ts` (Transformers.js + pipelines) loads in a separate async chunk on first message.
 */
/// <reference lib="webworker" />

import type { WorkerRequest } from './translationWorkerTypes';

let implPromise: Promise<typeof import('./translationWorkerImpl')> | null = null;

function loadImpl(): Promise<typeof import('./translationWorkerImpl')> {
  if (!implPromise) {
    implPromise = import('./translationWorkerImpl');
  }
  return implPromise;
}

self.onmessage = async (ev: MessageEvent<WorkerRequest>) => {
  const { handleMessage } = await loadImpl();
  await handleMessage(ev);
};
