import { Identity } from '@semaphore-protocol/identity';

const STORAGE_KEY = 'squadridge_semaphore_identity_v1';

let inMemoryIdentity: Identity | null = null;

declare global {
  interface Window {
    /** Optional dev escape hatch: assign an exported `Identity` string for in-memory-only flows. */
    squadridgeSemaphoreIdentityExport?: string | null;
  }
}

export type SessionIdentityOptions = {
  /** When true, skip localStorage and keep the identity only in memory for this page lifetime. */
  inMemoryOnly?: boolean;
};

/**
 * Persists a Semaphore identity in localStorage so nullifiers are stable per browser
 * (double-spend prevention via on-chain / server nullifier uniqueness).
 */
export function getOrCreateSessionIdentity(options?: SessionIdentityOptions): Identity {
  if (options?.inMemoryOnly) {
    if (typeof window !== 'undefined' && window.squadridgeSemaphoreIdentityExport) {
      try {
        return Identity.import(window.squadridgeSemaphoreIdentityExport);
      } catch {
        window.squadridgeSemaphoreIdentityExport = null;
      }
    }
    if (!inMemoryIdentity) {
      inMemoryIdentity = new Identity();
    }
    return inMemoryIdentity;
  }

  if (typeof localStorage === 'undefined') {
    return new Identity();
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return Identity.import(raw);
    } catch {
      // corrupted — replace
    }
  }
  const id = new Identity();
  localStorage.setItem(STORAGE_KEY, id.export());
  return id;
}
