export const INTENT_SESSION_KEY = 'squadridge_session_intent';

const SESSION_INTENT_MAX_AGE_MS = 30 * 60 * 1000;

export type StoredSessionIntent = {
  /** Free text; max length enforced in UI */
  text: string;
  /** Optional topic tags */
  tags: readonly string[];
  /** ISO 8601 timestamp when the intent was stored */
  recordedAt: string;
};

export function readSessionIntent(): StoredSessionIntent | null {
  try {
    const raw = sessionStorage.getItem(INTENT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const o = parsed as Record<string, unknown>;
    if (typeof o.recordedAt !== 'string') return null;
    const recordedMs = Date.parse(o.recordedAt);
    if (!Number.isFinite(recordedMs)) return null;
    if (Date.now() - recordedMs > SESSION_INTENT_MAX_AGE_MS) {
      clearSessionIntent();
      return null;
    }
    const text = typeof o.text === 'string' ? o.text : '';
    const tags = Array.isArray(o.tags)
      ? o.tags.filter((t): t is string => typeof t === 'string')
      : [];
    return { text, tags, recordedAt: o.recordedAt };
  } catch {
    return null;
  }
}

export function writeSessionIntent(intent: Omit<StoredSessionIntent, 'recordedAt'>): void {
  try {
    const payload: StoredSessionIntent = {
      ...intent,
      recordedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(INTENT_SESSION_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearSessionIntent(): void {
  try {
    sessionStorage.removeItem(INTENT_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
