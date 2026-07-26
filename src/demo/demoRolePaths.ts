import type { DemoWalkthroughRole } from '../data/demoCredentials';
import { DEMO_MAIN_STEPS, demoSteps, type DemoStep } from './demoScript';

export const DEMO_ROLE_STORAGE_KEY = 'squadridge:demo-walkthrough-role';

export function readDemoWalkthroughRole(): DemoWalkthroughRole | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DEMO_ROLE_STORAGE_KEY);
    if (!raw) return null;
    const allowed: DemoWalkthroughRole[] = [
      'facilitator',
      'participant',
      'moderator',
      'institution_admin',
      'mediator',
      'executive',
    ];
    return allowed.includes(raw as DemoWalkthroughRole) ? (raw as DemoWalkthroughRole) : null;
  } catch {
    return null;
  }
}

export function writeDemoWalkthroughRole(role: DemoWalkthroughRole): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(DEMO_ROLE_STORAGE_KEY, role);
  } catch {
    /* ignore */
  }
}

export function clearDemoWalkthroughRole(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(DEMO_ROLE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Step ids included per walkthrough role (order preserved from demoSteps). */
const ROLE_STEP_IDS: Record<DemoWalkthroughRole, string[]> = {
  facilitator: [
    'role_select',
    'welcome',
    'how_it_works',
    'security',
    'ledger',
    'facilitator_dashboard',
    'sessions_list',
    'session_configure',
    'session_invite',
    'session_verify',
    'session_control',
    'session_outcome',
    'session_release',
    'tour_complete',
  ],
  participant: [
    'role_select',
    'welcome',
    'security',
    'participant_dashboard',
    'participant_invite',
    'participant_room',
    'participant_review',
    'tour_complete',
  ],
  moderator: [
    'role_select',
    'welcome',
    'security',
    'moderator_dashboard',
    'session_control',
    'tour_complete',
  ],
  institution_admin: [
    'role_select',
    'welcome',
    'security',
    'institution_dashboard',
    'executive_dashboard',
    'tour_complete',
  ],
  mediator: [
    'role_select',
    'welcome',
    'security',
    'mediator_dashboard',
    'session_outcome',
    'tour_complete',
  ],
  executive: [
    'role_select',
    'welcome',
    'security',
    'executive_dashboard',
    'ledger',
    'tour_complete',
  ],
};

export function stepsForRole(role: DemoWalkthroughRole): DemoStep[] {
  const ids = ROLE_STEP_IDS[role];
  const byId = new Map(demoSteps.map((s) => [s.id, s]));
  return ids.map((id) => byId.get(id)).filter((s): s is DemoStep => Boolean(s));
}

/** Active main script — role-specific when set, else full facilitator spine. */
export function resolveDemoMainSteps(): DemoStep[] {
  const role = readDemoWalkthroughRole();
  if (role) return stepsForRole(role);
  return DEMO_MAIN_STEPS;
}

export function firstStepPathForRole(role: DemoWalkthroughRole): string {
  const steps = stepsForRole(role);
  const first = steps.find((s) => s.id !== 'role_select') ?? steps[0];
  return first?.path ?? '/demo/start?demo=1';
}
