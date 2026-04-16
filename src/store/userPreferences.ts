const KEY_LANG = 'squadridge:preferredLanguage';
const KEY_TRANSLATION_ON = 'squadridge:translationEnabled';
const KEY_EPOCH = 'squadridge:translationPreferenceEpoch';

function readLang(): string {
  try {
    const v = localStorage.getItem(KEY_LANG);
    if (v && /^[a-z]{2}$/i.test(v)) return v.toLowerCase();
  } catch {
    /* ignore */
  }
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language.slice(0, 2).toLowerCase();
  }
  return 'en';
}

function readTranslationEnabled(): boolean {
  try {
    const v = localStorage.getItem(KEY_TRANSLATION_ON);
    if (v === '0' || v === 'false') return false;
    if (v === '1' || v === 'true') return true;
  } catch {
    /* ignore */
  }
  return true;
}

function readEpoch(): number {
  try {
    const v = localStorage.getItem(KEY_EPOCH);
    const n = v ? parseInt(v, 10) : 1;
    return Number.isFinite(n) && n >= 1 ? n : 1;
  } catch {
    return 1;
  }
}

let preferredLanguage = readLang();
let translationEnabled = readTranslationEnabled();
/** Bumps when preferred language changes — session messages use this to avoid re-translating old rows. */
let translationPreferenceEpoch = readEpoch();

type Listener = () => void;
const listeners = new Set<Listener>();

function notify(): void {
  for (const fn of listeners) fn();
}

export function getPreferredLanguage(): string {
  return preferredLanguage;
}

export function setPreferredLanguage(lang: string): void {
  const next = lang.trim().toLowerCase().slice(0, 2);
  if (!/^[a-z]{2}$/.test(next)) return;
  if (next === preferredLanguage) return;
  preferredLanguage = next;
  try {
    localStorage.setItem(KEY_LANG, next);
  } catch {
    /* ignore */
  }
  translationPreferenceEpoch += 1;
  try {
    localStorage.setItem(KEY_EPOCH, String(translationPreferenceEpoch));
  } catch {
    /* ignore */
  }
  notify();
}

export function getTranslationEnabled(): boolean {
  return translationEnabled;
}

export function setTranslationEnabled(on: boolean): void {
  if (translationEnabled === on) return;
  translationEnabled = on;
  try {
    localStorage.setItem(KEY_TRANSLATION_ON, on ? '1' : '0');
  } catch {
    /* ignore */
  }
  notify();
}

export function getTranslationPreferenceEpoch(): number {
  return translationPreferenceEpoch;
}

export function subscribeUserPreferences(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
