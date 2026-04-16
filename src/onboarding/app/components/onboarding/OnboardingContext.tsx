import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchProfile, upsertProfilePatch } from '../../../lib/supabase/profile';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '../../../lib/supabase/client';

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
  /** Required when roleArchetype is `other` (trimmed length 8–100). */
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

/** v2: era defaults to unset (no implicit Contemporary). */
const STORAGE_KEY = 'sr_onboarding_draft_v2';

function loadDraft(): OnboardingDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDraft;
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    return { ...defaultDraft, ...parsed };
  } catch {
    return defaultDraft;
  }
}

function saveDraftLocal(d: OnboardingDraft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {
    /* ignore */
  }
}

interface OnboardingContextValue {
  draft: OnboardingDraft;
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  userEmail: string | null;
  sessionPending: boolean;
  refreshSession: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<OnboardingDraft>(() => loadDraft());
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sessionPending, setSessionPending] = useState(true);

  const refreshSession = useCallback(async () => {
    const sb = getSupabaseBrowserClient();
    if (!sb) {
      setUserEmail(null);
      setSessionPending(false);
      return;
    }
    const { data } = await sb.auth.getSession();
    setUserEmail(data.session?.user?.email ?? data.session?.user?.phone ?? null);
    setSessionPending(false);
  }, []);

  useEffect(() => {
    void refreshSession();
    const sb = getSupabaseBrowserClient();
    if (!sb) return undefined;
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? session?.user?.phone ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshSession]);

  useEffect(() => {
    saveDraftLocal(draft);
  }, [draft]);

  /** Hydrate from Supabase profile when logged in */
  useEffect(() => {
    if (!isSupabaseConfigured() || !userEmail) return undefined;
    let cancelled = false;
    void (async () => {
      const row = await fetchProfile();
      if (cancelled || !row) return;
      setDraftState((prev) => ({
        ...prev,
        callsign: row.callsign ?? prev.callsign,
        roleArchetype: (row.role_archetype ?? '') as RoleArchetype,
        roleOtherDetail:
          (row.role_archetype ?? '') === 'other' ? (row.role_other_detail ?? '') : '',
        eraAffiliation: (row.era_affiliation ?? '') as EraAffiliation,
        language: row.language ?? prev.language,
        regionHint: row.region_hint ?? prev.regionHint,
        timezoneWindow: row.timezone_window ?? prev.timezoneWindow,
      }));
    })();
    return () => {
      cancelled = true;
    };
  }, [userEmail]);

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
      userEmail,
      sessionPending,
      refreshSession,
    }),
    [draft, setDraft, userEmail, sessionPending, refreshSession],
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
