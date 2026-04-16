/**
 * Shared types for the translation Web Worker (main thread + worker implementation).
 */

export type WorkerRequest =
  | { id: number; kind: 'translate'; text: string; targetLang: string }
  | { id: number; kind: 'ping' };

export type WorkerResponse =
  | { id: number; kind: 'result'; text: string }
  | { id: number; kind: 'error'; message: string };
