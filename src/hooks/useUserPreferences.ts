import { useSyncExternalStore } from 'react';
import {
  getPreferredLanguage,
  getTranslationEnabled,
  getTranslationPreferenceEpoch,
  subscribeUserPreferences,
} from '../store/userPreferences';

export function useUserPreferences(): {
  preferredLanguage: string;
  translationEnabled: boolean;
  translationPreferenceEpoch: number;
} {
  return useSyncExternalStore(
    subscribeUserPreferences,
    () => ({
      preferredLanguage: getPreferredLanguage(),
      translationEnabled: getTranslationEnabled(),
      translationPreferenceEpoch: getTranslationPreferenceEpoch(),
    }),
    () => ({
      preferredLanguage: typeof navigator !== 'undefined' ? navigator.language.slice(0, 2).toLowerCase() : 'en',
      translationEnabled: true,
      translationPreferenceEpoch: 1,
    }),
  );
}
