export interface DemoSession {
  anonymousId: string;
  createdAt: string;
  onboardingComplete: boolean;
  verificationComplete: boolean;
  verifiedCredential: string | null;
  squadId: string | null;
  isDemo: true;
}

const KEY = 'mendguild_demo_session';

export const DEMO_SESSION_ID = 'demo-session-001';
export const DEMO_PROPOSAL_ID = 'demo-proposal-001';

export function getDemoSession(): DemoSession {
  const raw = localStorage.getItem(KEY);
  if (raw) return JSON.parse(raw) as DemoSession;
  const fresh: DemoSession = {
    anonymousId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    onboardingComplete: false,
    verificationComplete: false,
    verifiedCredential: null,
    squadId: null,
    isDemo: true,
  };
  localStorage.setItem(KEY, JSON.stringify(fresh));
  return fresh;
}

export function updateDemoSession(updates: Partial<Omit<DemoSession, 'isDemo'>>): DemoSession {
  const updated = { ...getDemoSession(), ...updates };
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function clearDemoSession(): void {
  localStorage.removeItem(KEY);
}
