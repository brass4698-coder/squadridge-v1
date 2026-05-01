import { useEffect, useId, useRef, useState } from 'react';

/**
 * LanguageSwitcher — UI-only locale selector for the global header.
 *
 * Persists the selection to localStorage under `sr.locale` so the rest of
 * the app can read it via `useLocale()`. Phase 1 ships the control without
 * translation strings; phase 3 wires real i18n.
 */

const LOCALES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'ar', label: 'العربية', short: 'AR' },
  { code: 'uk', label: 'Українська', short: 'UK' },
] as const;

type LocaleCode = (typeof LOCALES)[number]['code'];

const STORAGE_KEY = 'sr.locale';

function readStoredLocale(): LocaleCode {
  if (typeof window === 'undefined') return 'en';
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return (LOCALES.find((l) => l.code === v)?.code ?? 'en') as LocaleCode;
  } catch {
    return 'en';
  }
}

export function useLocale(): [LocaleCode, (next: LocaleCode) => void] {
  const [locale, setLocaleState] = useState<LocaleCode>(() => readStoredLocale());
  const setLocale = (next: LocaleCode) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* localStorage may be blocked in private mode; selection survives in memory. */
    }
  };
  return [locale, setLocale];
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const [locale, setLocale] = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="inline-flex min-h-[44px] min-w-0 items-center justify-center gap-1.5 rounded-[6px] border border-line bg-surface-elevated px-2.5 py-1.5 text-center font-mono text-[0.72rem] font-semibold uppercase leading-snug tracking-[0.08em] text-ink-secondary transition-colors hover:border-line-strong hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Language: ${current.label}. Change language.`}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden className="text-ink-faint">
          {compact ? current.short : 'Lang'}
        </span>
        <span className="text-ink">{current.short}</span>
      </button>
      {open ? (
        <ul
          id={menuId}
          role="listbox"
          aria-label="Language"
          className="absolute right-0 top-full z-[150] mt-1 min-w-[10rem] overflow-hidden rounded-[6px] border border-line bg-surface-elevated shadow-[var(--sr-shadow-md)]"
        >
          {LOCALES.map((l) => {
            const active = l.code === locale;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`flex min-h-[44px] w-full items-center justify-between gap-3 px-3 py-2 text-left font-sans text-[0.85rem] leading-snug transition-colors ${
                    active
                      ? 'bg-brand-soft text-ink'
                      : 'text-ink-secondary hover:bg-surface-secondary hover:text-ink'
                  }`}
                  onClick={() => {
                    setLocale(l.code);
                    setOpen(false);
                  }}
                >
                  <span className="min-w-0">{l.label}</span>
                  <span className="font-mono text-[0.7rem] text-ink-faint">{l.short}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
