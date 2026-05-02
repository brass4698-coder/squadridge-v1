/**
 * Presenter mode — a session-scoped flag set from the demo command center
 * (see `src/pages/admin/AdminDemoHubPage.tsx`) that, together with `?demo=1`,
 * unlocks bypasses for screens that would otherwise deadlock a live walkthrough
 * (e.g. the pilot-invite gate on IntentPage).
 *
 * Strict gating: a screen MUST require BOTH `?demo=1` AND `isDemoBypassAllowed()`
 * before it skips a production guard. `isDemoBypassAllowed()` is true when:
 *   - `import.meta.env.DEV` is true (any local dev session), OR
 *   - `sessionStorage[PRESENTER_MODE_STORAGE_KEY] === '1'` (set by the hub).
 *
 * The flag is intentionally session-scoped: closing the tab clears it, so a
 * presenter who hands the demo back to a real user cannot accidentally leave
 * the bypass on.
 */
export const PRESENTER_MODE_STORAGE_KEY = 'squadridge_presenter_mode';

export function readPresenterMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(PRESENTER_MODE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setPresenterMode(active: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (active) {
      window.sessionStorage.setItem(PRESENTER_MODE_STORAGE_KEY, '1');
    } else {
      window.sessionStorage.removeItem(PRESENTER_MODE_STORAGE_KEY);
    }
  } catch {
    // sessionStorage unavailable (private mode, quota) — tolerate.
  }
}

/**
 * Returns true when a demo bypass guard is environmentally allowed.
 * Callers MUST still confirm the URL is in demo mode (`?demo=1`) before applying.
 */
export function isDemoBypassAllowed(): boolean {
  if (import.meta.env.DEV) return true;
  return readPresenterMode();
}
