import { ONBOARDING_DRAFT_STORAGE_KEY } from '../onboarding/app/components/onboarding/onboardingStorageKeys';
import { clearSessionIntent } from './intentStorage';
import { clearMatchmakingSession, clearPendingMatchReveal } from './matchmakingSession';

/**
 * Runs once per full document load (before React). Clears tab session flows and any legacy
 * onboarding draft key so refresh / new entry does not reuse stale wizard or matching state.
 */
export function clearEphemeralStateOnBootstrap(): void {
  clearSessionIntent();
  clearMatchmakingSession();
  clearPendingMatchReveal();
  try {
    localStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
