/**
 * useTheme — manages light/dark theme with prefers-color-scheme fallback.
 *
 * Stores preference in memory (not localStorage — sandboxed iframes block it).
 * Applies [data-theme] attribute to <html> element.
 * Defaults to system preference via matchMedia.
 *
 * @example
 * const { theme, toggleTheme } = useTheme();
 * // theme: 'light' | 'dark'
 */
import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

let _memTheme: Theme | null = null; // module-level memory store

export function useTheme(): { theme: Theme; toggleTheme: () => void; setTheme: (t: Theme) => void } {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (_memTheme) return _memTheme;
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    _memTheme = theme;
  }, [theme]);

  // Sync with system preference changes (only when user hasn't manually toggled)
  useEffect(() => {
    if (_memTheme) return; // user has manually set — don't override
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!_memTheme) setThemeState(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    _memTheme = t;
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, toggleTheme, setTheme };
}
