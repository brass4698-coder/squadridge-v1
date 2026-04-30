import { useSyncExternalStore } from 'react';
import {
  getPreferredLanguage,
  getTranslationEnabled,
  getTranslationPreferenceEpoch,
  subscribeUserPreferences,
} from '../store/userPreferences';

interface UserPreferences {
  preferredLanguage: string;
  translationEnabled: boolean;
  translationPreferenceEpoch: number;
}

/**
 * Cached snapshot for `useSyncExternalStore` — React requires the snapshot
 * function to return a referentially stable value between mutations, otherwise
 * components that consume it can render-loop (React #185). We rebuild the
 * snapshot only when one of the underlying primitives changes.
 */
let cachedSnapshot: UserPreferences | null = null;

function getSnapshot(): UserPreferences {
  const lang = getPreferredLanguage();
  const tEnabled = getTranslationEnabled();
  const epoch = getTranslationPreferenceEpoch();
  if (
    cachedSnapshot &&
    cachedSnapshot.preferredLanguage === lang &&
    cachedSnapshot.translationEnabled === tEnabled &&
    cachedSnapshot.translationPreferenceEpoch === epoch
  ) {
    return cachedSnapshot;
  }
  cachedSnapshot = {
    preferredLanguage: lang,
    translationEnabled: tEnabled,
    translationPreferenceEpoch: epoch,
  };
  return cachedSnapshot;
}

const SERVER_SNAPSHOT: UserPreferences = {
  preferredLanguage:
    typeof navigator !== 'undefined' ? navigator.language.slice(0, 2).toLowerCase() : 'en',
  translationEnabled: true,
  translationPreferenceEpoch: 1,
};

function getServerSnapshot(): UserPreferences {
  return SERVER_SNAPSHOT;
}

export function useUserPreferences(): UserPreferences {
  return useSyncExternalStore(subscribeUserPreferences, getSnapshot, getServerSnapshot);
}
