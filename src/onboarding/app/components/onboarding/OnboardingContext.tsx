import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { upsertProfilePatch } from '../../../lib/supabase/profile';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';

/** Empty string = user has not chosen a role yet (Identity step). */
export type RoleArchetype =
  | ''
  | 'strategist'
  | 'analyst'
  | 'policy'
  | 'mediator'
  | 'field'
  | 'other';

/** Empty string = no era chosen yet (Identity step; field is optional). */
export type EraAffiliation =
  | ''
  | 'contemporary'
  | 'post_911'
  | 'cold_war_legacy'
  | 'multi_theater'
  | 'undisclosed';

export interface OnboardingDraft {
  callsign: string;
  roleArchetype: RoleArchetype;
  /** Required when roleArchetype is `other` (trimmed length 8–80; see `PROFILE_ROLE_OTHER_*_LEN` in `src/lib/profile.ts`). */
  roleOtherDetail: string;
  eraAffiliation: EraAffiliation;
  language: string;
  regionHint: string;
  timezoneWindow: string;
  rulesAccepted: boolean;
  /** Local-only until Supabase session exists */
  verificationAcknowledged: boolean;
}

const defaultDraft: OnboardingDraft = {
  callsign: '',
  roleArchetype: '',
  roleOtherDetail: '',
  eraAffiliation: '',
  language: '',
  regionHint: '',
  timezoneWindow: '',
  rulesAccepted: false,
  verificationAcknowledged: false,
};

interface OnboardingContextValue {
  draft: OnboardingDraft;
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  /** Present for any Supabase session (magic link, anonymous, etc.). */
  authUserId: string | null;
  userEmail: string | null;
  sessionPending: boolean;
  refreshSession: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  /** In-memory only: refresh or re-entering `/onboarding` always starts with empty selections. */
  const [draft, setDraftState] = useState<OnboardingDraft>(defaultDraft);
  /** Set when any Supabase session exists (email, phone, or anonymous). */
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sessionPending, setSessionPending] = useState(true);

  const refreshSession = useCallback(async () => {
    const sb = getSupabaseBrowserClient();
    if (!sb) {
      setAuthUserId(null);
      setUserEmail(null);
      setSessionPending(false);
      return;
    }
    const { data } = await sb.auth.getSession();
    const u = data.session?.user ?? null;
    setAuthUserId(u?.id ?? null);
    setUserEmail(u?.email ?? u?.phone ?? null);
    setSessionPending(false);
  }, []);

  useEffect(() => {
    void refreshSession();
    const sb = getSupabaseBrowserClient();
    if (!sb) return undefined;
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setAuthUserId(u?.id ?? null);
      setUserEmail(u?.email ?? u?.phone ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshSession]);

  const setDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraftState((prev) => {
      const next = { ...prev, ...patch };
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      draft,
      setDraft,
      authUserId,
      userEmail,
      sessionPending,
      refreshSession,
    }),
    [draft, setDraft, authUserId, userEmail, sessionPending, refreshSession],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}

/** Debounced callsign sync when authenticated */
export function useCallsignSync(callsign: string) {
  useEffect(() => {
    const t = window.setTimeout(() => {
      const trimmed = callsign.trim();
      if (trimmed.length < 2) return;
      void upsertProfilePatch({ callsign: trimmed });
    }, 600);
    return () => window.clearTimeout(t);
  }, [callsign]);
}
