/**
 * Persists outbound message ciphertext so a failed send can be retried after refresh
 * or crash (best-effort). Falls back to in-memory storage when IndexedDB is
 * unavailable (tests, SSR).
 *
 * Security invariant: plaintext message bodies are NEVER written to IndexedDB.
 * Browser extensions, devtools, and other origins with storage access can read
 * IDB. Only `payload_ciphertext` survives a page crash. Plaintext is mirrored in
 * a tab-local `MEM_PLAINTEXT` map so the live UI can preview / re-edit a pending
 * send within the same tab session, but that mirror is intentionally lost on
 * reload (see DB v1 -> v2 migration which strips legacy `plainBody` fields).
 */
export type PendingSendRecord = {
  localId: string;
  squadId: string;
  senderId: string;
  payload_ciphertext: string;
  createdAt: string;
};

/** Cross-tab BroadcastChannel — peers notify each other when pending sends arrive or flush may be needed (see SessionPage). */
export const SEND_QUEUE_BROADCAST_CHANNEL = 'squadridge:sendQueue';

const DB_NAME = 'squadridge-send-queue';
/**
 * Version history:
 *   v1: initial schema { localId, squadId, senderId, payload_ciphertext, plainBody, createdAt }.
 *   v2: security migration — strips legacy `plainBody` field (no plaintext on disk).
 *   v3: perf — adds `by_squad` index so {@link listPendingSendsForSquad} reads
 *       only the rows for the requested squad instead of scanning the store.
 */
const DB_VERSION = 3;
const STORE = 'pending';
const SQUAD_INDEX = 'by_squad';
const MEM = new Map<string, PendingSendRecord>();
/** Tab-local plaintext mirror — never persisted, never crosses tabs. */
const MEM_PLAINTEXT = new Map<string, string>();

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
  MEM_PLAINTEXT.clear();
  dbPromise = null;
}

/**
 * Mirror plaintext for `localId` in tab-local memory only. Used by SessionPage
 * to preview / re-edit a pending send within the active tab. Lost on reload
 * by design — restoring after a refresh would require re-reading plaintext
 * from disk, which is exactly what {@link PendingSendRecord} forbids.
 */
export function rememberPendingPlaintext(localId: string, plainBody: string): void {
  MEM_PLAINTEXT.set(localId, plainBody);
}

/** Returns the tab-local plaintext for `localId`, or `undefined` after a reload. */
export function readPendingPlaintext(localId: string): string | undefined {
  return MEM_PLAINTEXT.get(localId);
}

/** Drop the tab-local plaintext mirror for `localId` (call alongside {@link removePendingSend}). */
export function forgetPendingPlaintext(localId: string): void {
  MEM_PLAINTEXT.delete(localId);
}

function canUseIdb(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openDb(): Promise<IDBDatabase | null> {
  if (!canUseIdb()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => resolve(null);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (event) => {
      const db = req.result;
      const tx = req.transaction;
      let store: IDBObjectStore;
      if (!db.objectStoreNames.contains(STORE)) {
        store = db.createObjectStore(STORE, { keyPath: 'localId' });
      } else if (tx) {
        store = tx.objectStore(STORE);
      } else {
        return;
      }

      // Security migration v1 -> v2: strip `plainBody` from any legacy records
      // so upgrading clients do not leave plaintext on disk. Cursor-update is
      // safe inside `onupgradeneeded` because the version-change transaction
      // is open here.
      if (event.oldVersion < 2 && event.oldVersion > 0) {
        const cursorReq = store.openCursor();
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (!cursor) return;
          const rec = cursor.value as Record<string, unknown> & { localId?: string };
          if ('plainBody' in rec) {
            delete rec.plainBody;
            cursor.update(rec);
          }
          cursor.continue();
        };
      }

      // Perf migration v2 -> v3: add `by_squad` index so per-squad reads scale
      // with the number of matching records, not the total store size.
      if (event.oldVersion < 3 && !store.indexNames.contains(SQUAD_INDEX)) {
        store.createIndex(SQUAD_INDEX, 'squadId', { unique: false });
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
  MEM_PLAINTEXT.delete(localId);
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
    // Prefer the v3 `by_squad` index when present (per-squad fetch, not full
    // store scan). Older databases that haven't upgraded yet fall back to
    // `getAll() + filter` so a stale schema doesn't break the read path.
    if (store.indexNames.contains(SQUAD_INDEX)) {
      const idxReq = store.index(SQUAD_INDEX).getAll(IDBKeyRange.only(squadId));
      idxReq.onsuccess = () => resolve((idxReq.result as PendingSendRecord[]) ?? []);
      idxReq.onerror = () => reject(idxReq.error);
      return;
    }
    const req = store.getAll();
    req.onsuccess = () =>
      resolve(((req.result as PendingSendRecord[]) ?? []).filter((r) => r.squadId === squadId));
    req.onerror = () => reject(req.error);
  });
  return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
