import { DEMO_PROPOSAL_ID } from '../lib/demoSession';

/** `sessionStorage` key — tour active when set to `"1"` alongside optional `?demo=1`. */
export const DEMO_WALKTHROUGH_STORAGE_KEY = 'squadridge_demo_walkthrough';

export type DemoEnvKind = 'local' | 'staging' | 'prod';

export type DemoStep = {
  id: string;
  /** Full client path including query (e.g. `/match?demo=1`). */
  path: string;
  title: string;
  inMainScript: boolean;
  /** Optional: how “live” this step is per environment (for future copy / analytics). */
  envModes?: Partial<Record<DemoEnvKind, 'live' | 'mock'>>;
};

const mockAll: Partial<Record<DemoEnvKind, 'live' | 'mock'>> = {
  local: 'mock',
  staging: 'mock',
  prod: 'mock',
};

/**
 * Linear main tour. Order matches Back/Next. Paths use `?demo=1` so `Match` and other
 * screens can key off the same contract. Onboarding summary (`/onboarding/demo`) can be
 * inserted later without changing existing routes.
 */
export const DEMO_MAIN_STEPS: DemoStep[] = [
  { id: 'landing', path: '/?demo=1', title: 'Welcome', inMainScript: true, envModes: mockAll },
  { id: 'intent', path: '/intent?demo=1', title: 'Intent', inMainScript: true, envModes: mockAll },
  { id: 'match', path: '/match?demo=1', title: 'Matchmaking', inMainScript: true, envModes: mockAll },
  {
    id: 'session_offline',
    path: '/session/demo-session-001?demo=1',
    title: 'Squad session (demo)',
    inMainScript: true,
    envModes: mockAll,
  },
  {
    id: 'ledger',
    path: `/ledger/${DEMO_PROPOSAL_ID}?demo=1`,
    title: 'Ledger',
    inMainScript: true,
    envModes: mockAll,
  },
  { id: 'security', path: '/security?demo=1', title: 'Security & privacy', inMainScript: true, envModes: mockAll },
];

/** Appendix only — not driven by the main Back/Next strip. */
export const DEMO_APPENDIX = {
  moderator: { path: '/mod', inMainScript: false as const },
} as const;

/** Compare pathname + query (order of query keys ignored). */
export function pathsEqual(a: string, b: string): boolean {
  const base = 'https://squadridge.local';
  const ua = new URL(a.startsWith('http') ? a : `${base}${a.startsWith('/') ? a : `/${a}`}`);
  const ub = new URL(b.startsWith('http') ? b : `${base}${b.startsWith('/') ? b : `/${b}`}`);
  if (ua.pathname !== ub.pathname) return false;
  const keys = new Set([...ua.searchParams.keys(), ...ub.searchParams.keys()]);
  for (const k of keys) {
    if ((ua.searchParams.get(k) ?? '') !== (ub.searchParams.get(k) ?? '')) return false;
  }
  return true;
}

export function locationMatchesStep(pathname: string, search: string, stepPath: string): boolean {
  return pathsEqual(stepPath, `${pathname}${search}`);
}
