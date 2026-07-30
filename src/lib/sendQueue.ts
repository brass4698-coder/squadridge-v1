/**
 * Persists outbound message ciphertext + preview text so a failed send can be retried
 * after refresh or crash (best-effort). Falls back to in-memory storage when IndexedDB
 * is unavailable (tests, SSR).
 */
export type PendingSendRecord = {
  localId: string;
  squadId: string;
  senderId: string;
  payload_ciphertext: string;
  plainBody: string;
  createdAt: string;
};

/** Cross-tab BroadcastChannel — peers notify each other when pending sends arrive or flush may be needed (see SessionPage). */
export const SEND_QUEUE_BROADCAST_CHANNEL = 'mendguild:sendQueue';

const DB_NAME = 'mendguild-send-queue';
const STORE = 'pending';
const MEM = new Map<string, PendingSendRecord>();

let dbPromise: Promise<IDBDatabase | null> | null = null;

/** Max automatic HTTP retries per message during a flush (exponential backoff between attempts). */
export const SEND_RETRY_ATTEMPTS = 5;

/** Base delay for send flush backoff (ms). */
export const SEND_RETRY_BASE_MS = 1_000;

/** Cap for send flush backoff (ms). */
export const SEND_RETRY_MAX_MS = 30_000;

/** Delay before attempt `attemptIndex` (0-based), capped. */
export function sendRetryDelayMs(attemptIndex: number): number {
  return Math.min(SEND_RETRY_BASE_MS * 2 ** attemptIndex, SEND_RETRY_MAX_MS);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Clears in-memory fallback and DB handle — for unit tests only. */
export function resetMessageSendQueueForTests(): void {
  MEM.clear();
  dbPromise = null;
}

function canUseIdb(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openDb(): Promise<IDBDatabase | null> {
  if (!canUseIdb()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => resolve(null);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'localId' });
      }
    };
  });
  return dbPromise;
}

function runWrite(db: IDBDatabase, fn: (store: IDBObjectStore) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    const store = tx.objectStore(STORE);
    fn(store);
  });
}

export async function enqueuePendingSend(record: PendingSendRecord): Promise<void> {
  const db = await openDb();
  if (!db) {
    MEM.set(record.localId, record);
    return;
  }
  await runWrite(db, (store) => {
    store.put(record);
  });
}

export async function removePendingSend(localId: string): Promise<void> {
  MEM.delete(localId);
  const db = await openDb();
  if (!db) return;
  await runWrite(db, (store) => {
    store.delete(localId);
  });
}

export async function listPendingSendsForSquad(squadId: string): Promise<PendingSendRecord[]> {
  const db = await openDb();
  if (!db) {
    return Array.from(MEM.values())
      .filter((r) => r.squadId === squadId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  const rows = await new Promise<PendingSendRecord[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    tx.onerror = () => reject(tx.error);
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as PendingSendRecord[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  return rows
    .filter((r) => r.squadId === squadId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
