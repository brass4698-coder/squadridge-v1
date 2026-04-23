import { isConnectionDebugLogEnabled } from './env';

export type ConnectionLogEntry = {
  id: string;
  at: string;
  squadId?: string;
  kind: 'realtime_retry_exhausted';
  message: string;
};

const DB_NAME = 'squadridge-connection-debug';
const STORE = 'logs';
const MAX_ENTRIES = 200;

let dbPromise: Promise<IDBDatabase | null> | null = null;

export function resetConnectionDebugLogForTests(): void {
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
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
  });
  return dbPromise;
}

export async function appendConnectionLog(
  entry: Omit<ConnectionLogEntry, 'id' | 'at'>,
): Promise<void> {
  if (!isConnectionDebugLogEnabled()) return;
  const db = await openDb();
  const row: ConnectionLogEntry = {
    ...entry,
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
  };
  if (!db) return;
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(row);
  });
  await trimOldEntries(db);
}

async function trimOldEntries(db: IDBDatabase): Promise<void> {
  const all = await new Promise<ConnectionLogEntry[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    tx.onerror = () => reject(tx.error);
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result as ConnectionLogEntry[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  if (all.length <= MAX_ENTRIES) return;
  all.sort((a, b) => a.at.localeCompare(b.at));
  const drop = all.slice(0, all.length - MAX_ENTRIES);
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    const store = tx.objectStore(STORE);
    for (const r of drop) {
      store.delete(r.id);
    }
  });
}
