import { Identity } from '@semaphore-protocol/identity';

const STORAGE_KEY = 'squadridge_semaphore_identity_v1';

/**
 * Persists a Semaphore identity in localStorage so nullifiers are stable per browser
 * (double-spend prevention via on-chain / server nullifier uniqueness).
 */
export function getOrCreateSessionIdentity(): Identity {
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
