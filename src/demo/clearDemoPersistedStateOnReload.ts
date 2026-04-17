import {
  clearDemoSession,
  clearMatchmakingSession,
  clearPendingMatchReveal,
  clearSessionIntent,
  DEMO_SESSION_ID,
} from '../lib';
import { ONBOARDING_DRAFT_STORAGE_KEY } from '../onboarding/app/components/onboarding/OnboardingContext';
import { DEMO_WALKTHROUGH_STORAGE_KEY } from './demoScript';

const DEMO_COMPOSER_DRAFT_KEY = `squadridge-composer-draft:${DEMO_SESSION_ID}`;

function isReloadNavigation(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav?.type === 'reload') return true;
  } catch {
    /* ignore */
  }
  const legacy = (performance as unknown as { navigation?: { type: number } }).navigation;
  return legacy?.type === 1;
}

function urlHasDemoQuery(): boolean {
  return new URLSearchParams(window.location.search).get('demo') === '1';
}

/**
 * Runs synchronously before React mounts. Full reload clears demo session + tour flag;
 * when the URL is demo-tagged, also clears intent, matchmaking, onboarding draft, and demo composer draft
 * so the next guided run starts from a blank slate.
 */
export function clearDemoPersistedStateOnReload(): void {
  if (!isReloadNavigation()) return;

  clearDemoSession();
  try {
    sessionStorage.removeItem(DEMO_WALKTHROUGH_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem(DEMO_COMPOSER_DRAFT_KEY);
  } catch {
    /* ignore */
  }

  if (!urlHasDemoQuery()) return;

  clearSessionIntent();
  clearMatchmakingSession();
  clearPendingMatchReveal();
  try {
    localStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
