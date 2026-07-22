import { DEMO_PERSONA } from './demoPersona';

/** `sessionStorage` key — tour active when set to `"1"` (with optional `?demo=1` in URL). */
export const DEMO_WALKTHROUGH_STORAGE_KEY = 'demoWalkthrough';

/**
 * Seeded live demo session from `scripts/seedDemo.mjs`
 * (landlord-tenant dispute). Used by facilitator tour steps.
 */
export const DEMO_FACILITATOR_SESSION_ID = '11111111-1111-4111-8111-111111111111';

export type EnvMode = 'local' | 'staging' | 'prod';

/**
 * Single scripted interaction. Run **in order**; no parallelism.
 * - `focus` / `click` / `select`: wait `delayMs` (default 250 ms) before running.
 * - `type`: optional `delayMs` before focus+typing; `charDelayMs` between each character (default ~100 ms).
 * - `wait`: pause for `ms`.
 */
export type DemoAction =
  | { kind: 'focus'; selector: string; delayMs?: number }
  | { kind: 'type'; selector: string; text: string; charDelayMs?: number; delayMs?: number }
  | { kind: 'click'; selector: string; delayMs?: number }
  | { kind: 'select'; selector: string; value: string; delayMs?: number }
  | { kind: 'wait'; ms: number };

export type DemoOverlayStep = {
  id: string;
  content: string;
  selector?: string;
};

export type DemoStep = {
  id: string;
  path: string;
  title: string;
  description?: string;
  envModes: Partial<Record<EnvMode, 'live' | 'mock'>>;
  actions?: DemoAction[];
  overlaySteps?: DemoOverlayStep[];
  inMainScript?: boolean;
};

const mockAll: Partial<Record<EnvMode, 'live' | 'mock'>> = {
  local: 'mock',
  staging: 'mock',
  prod: 'mock',
};

/** Slower per-keystroke typing; omit `charDelayMs` on actions to use `demoAutoActions` default. */
export const HUMAN_CHAR_MS = 125;

/**
 * Canonical NGO / facilitator tour for App.v2.
 * Order matches Back / Next / Skip chrome.
 */
export const demoSteps: DemoStep[] = [
  {
    id: 'welcome',
    path: '/?demo=1',
    title: 'Welcome',
    description: 'Private room → release gate → public ledger.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'welcome-brand',
        content:
          'SquadRidge is facilitator-led dialogue infrastructure: the room stays private; only an approved outcome can become public.',
        selector: '[data-demo="landing-hero"]',
      },
      {
        id: 'welcome-nav',
        content:
          'Use Next to walk the product spine. Back returns to the previous step. Skip exits anytime.',
      },
    ],
  },
  {
    id: 'how_it_works',
    path: '/how-it-works?demo=1',
    title: 'How it works',
    description: 'Configure → Verify → Facilitate → Release.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'hiw-spine',
        content:
          'Mediators control the lifecycle. The platform automates verification status, session controls, and ledger publish — not the dialogue itself.',
        selector: '[data-demo="how-it-works-spine"]',
      },
    ],
  },
  {
    id: 'security',
    path: '/security?demo=1',
    title: 'Security boundary',
    description: 'What stays in the room vs what can be released.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'security-frame',
        content:
          'Trust claims stay honest: the room and the record are separate by design. Read this surface before you pilot.',
        selector: '[data-demo="security-hero"]',
      },
    ],
  },
  {
    id: 'ledger',
    path: '/ledger?demo=1',
    title: 'Public ledger',
    description: 'Released outcome records — not chat transcripts.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'ledger-index',
        content:
          'The ledger holds approved public records only. Session dialogue never appears here.',
        selector: '[data-demo="ledger-index"]',
      },
    ],
  },
  {
    id: 'facilitator_dashboard',
    path: '/app?demo=1',
    title: 'Facilitator workspace',
    description: 'Your operating home after sign-in.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'dash-header',
        content:
          'You are signed in as the demo facilitator. Seeded sessions appear here so you can practice Configure → Verify → Facilitate → Release.',
        selector: '[data-demo="facilitator-dashboard"]',
      },
      {
        id: 'dash-new',
        content:
          'New session starts a fresh room. For this tour we open a seeded live session next.',
        selector: '[data-demo="nav-sessions"]',
      },
    ],
  },
  {
    id: 'sessions_list',
    path: '/app/sessions?demo=1',
    title: 'Sessions',
    description: 'All rooms you facilitate.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'sessions-table',
        content:
          'Each row is a deliberation room with a lifecycle status. Open a live session to enter the control surface.',
        selector: '[data-demo="sessions-list"]',
      },
    ],
  },
  {
    id: 'session_control',
    path: `/app/sessions/${DEMO_FACILITATOR_SESSION_ID}/control?demo=1`,
    title: 'Session control',
    description: 'Facilitate inside the private room.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'control-room',
        content:
          'This is the private room control surface. Participants are pseudonymous; dialogue stays here until you choose to draft an outcome.',
        selector: '[data-demo="session-control"]',
      },
    ],
  },
  {
    id: 'session_outcome',
    path: `/app/sessions/${DEMO_FACILITATOR_SESSION_ID}/outcome?demo=1`,
    title: 'Outcome draft',
    description: 'Write what may leave the room.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'outcome-draft',
        content:
          'Outcomes are facilitator-authored. Nothing becomes public until you pass the release gate.',
        selector: '[data-demo="session-outcome"]',
      },
    ],
  },
  {
    id: 'session_release',
    path: `/app/sessions/${DEMO_FACILITATOR_SESSION_ID}/release?demo=1`,
    title: 'Release gate',
    description: 'Approve what the ledger may publish.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'release-gate',
        content:
          'Release is explicit. You decide whether a record is published — the platform does not auto-publish chat.',
        selector: '[data-demo="session-release"]',
      },
    ],
  },
  {
    id: 'tour_complete',
    path: '/app?demo=1&tour=done',
    title: 'Tour complete',
    description: 'Explore freely, or exit to the public site.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'done',
        content:
          'You have walked the institutional spine. Keep exploring seeded sessions, or use Skip to leave the guided tour.',
        selector: '[data-demo="facilitator-dashboard"]',
      },
    ],
  },
];

/** Main linear script (excludes appendix routes). */
export const DEMO_MAIN_STEPS: DemoStep[] = demoSteps.filter((s) => s.inMainScript !== false);

/** First scripted route — used by the lightweight demo shell before the full walkthrough chunk loads. */
export const DEMO_FIRST_WALKTHROUGH_PATH = DEMO_MAIN_STEPS[0]?.path ?? '/?demo=1';

export const DEMO_APPENDIX = {
  moderator: {
    path: '/mod?demo=1',
    id: 'mod',
    title: 'Moderator console',
    inMainScript: false as const,
  },
  /** @deprecated Legacy citizen persona — kept for tests that import DEMO_PERSONA. */
  persona: DEMO_PERSONA,
} as const;

/** Query keys ignored when matching tour steps (order and extra flags). */
const PATH_MATCH_IGNORE_KEYS = new Set(['demo']);

/** Compare pathname + query (order of query keys ignored; `demo` ignored). */
export function pathsEqual(a: string, b: string): boolean {
  const base = 'https://squadridge.local';
  const ua = new URL(a.startsWith('http') ? a : `${base}${a.startsWith('/') ? a : `/${a}`}`);
  const ub = new URL(b.startsWith('http') ? b : `${base}${b.startsWith('/') ? b : `/${b}`}`);
  if (ua.pathname !== ub.pathname) return false;
  const keys = new Set([...ua.searchParams.keys(), ...ub.searchParams.keys()]);
  for (const k of keys) {
    if (PATH_MATCH_IGNORE_KEYS.has(k)) continue;
    if ((ua.searchParams.get(k) ?? '') !== (ub.searchParams.get(k) ?? '')) return false;
  }
  return true;
}

export function locationMatchesStep(pathname: string, search: string, stepPath: string): boolean {
  return pathsEqual(stepPath, `${pathname}${search}`);
}
