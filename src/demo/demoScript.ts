import { DEMO_PROPOSAL_ID } from '../lib';
import { DEMO_PERSONA } from './demoPersona';

/** `sessionStorage` key — tour active when set to `"1"` (with optional `?demo=1` in URL). */
export const DEMO_WALKTHROUGH_STORAGE_KEY = 'demoWalkthrough';

export type EnvMode = 'local' | 'staging' | 'prod';

/**
 * Single scripted interaction. Run **in order**; no parallelism.
 * - `focus` / `click` / `select`: wait `delayMs` (default 250 ms) before running.
 * - `type`: optional `delayMs` before focus+typing; `charDelayMs` between each character (default ~100 ms).
 * - `wait`: pause for `ms` (e.g. between scripted onboarding steps).
 * Ending a step with `click` on the real Next/Submit lets existing app handlers navigate — do not route from the runner.
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
  /** Per-step automation: each field is more entries in this array; often ends with `click` on the real Next control. */
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
 * Canonical presenter tour. Order matches Back/Next.
 * Text fields use `type` for human-paced typing; toggles use `click` / `select`.
 */
export const demoSteps: DemoStep[] = [
  {
    id: 'landing',
    path: '/?demo=1',
    title: 'Welcome',
    description: 'Product story — onboarding, verification, intent, match, session, ledger.',
    inMainScript: true,
    envModes: mockAll,
  },
  {
    id: 'onboarding_mission',
    path: '/onboarding?demo=1&owt=0',
    title: 'Mission brief',
    description: 'Onboarding — read the brief, then use Next in the card to continue.',
    inMainScript: true,
    envModes: mockAll,
  },
  {
    id: 'onboarding_identity',
    path: '/onboarding?demo=1&owt=1',
    title: 'Identity',
    description: 'Callsign, lane, and operational context.',
    inMainScript: true,
    envModes: mockAll,
    actions: [
      { kind: 'focus', selector: '[data-demo="onboarding-callsign"]', delayMs: 400 },
      {
        kind: 'type',
        selector: '[data-demo="onboarding-callsign"]',
        text: 'Falcon-23',
        charDelayMs: HUMAN_CHAR_MS,
      },
      { kind: 'wait', ms: 2000 },
      { kind: 'click', selector: '[data-demo="onboarding-role-analyst"]', delayMs: 200 },
      { kind: 'wait', ms: 1000 },
      {
        kind: 'select',
        selector: '[data-demo="onboarding-era-trigger"]',
        value: 'contemporary',
        delayMs: 200,
      },
    ],
  },
  {
    id: 'onboarding_placement',
    path: '/onboarding?demo=1&owt=2',
    title: 'Placement',
    description: 'Language, region, and time window.',
    inMainScript: true,
    envModes: mockAll,
    actions: [
      { kind: 'focus', selector: '[data-demo="onboarding-language"]', delayMs: 400 },
      {
        kind: 'type',
        selector: '[data-demo="onboarding-language"]',
        text: 'English',
        charDelayMs: HUMAN_CHAR_MS,
      },
      { kind: 'wait', ms: 1000 },
      { kind: 'focus', selector: '[data-demo="onboarding-region"]', delayMs: 200 },
      {
        kind: 'type',
        selector: '[data-demo="onboarding-region"]',
        text: 'Pacific North West',
        charDelayMs: HUMAN_CHAR_MS,
      },
      { kind: 'wait', ms: 1000 },
      { kind: 'focus', selector: '[data-demo="onboarding-timezone"]', delayMs: 200 },
      {
        kind: 'type',
        selector: '[data-demo="onboarding-timezone"]',
        text: 'Weekday Evenings PT',
        charDelayMs: HUMAN_CHAR_MS,
      },
    ],
  },
  {
    id: 'onboarding_rules',
    path: '/onboarding?demo=1&owt=3',
    title: 'Rules & safety',
    description: 'Accept the rules to continue.',
    inMainScript: true,
    envModes: mockAll,
    actions: [
      { kind: 'wait', ms: 2000 },
      { kind: 'click', selector: '[data-demo="onboarding-rules-accept"]', delayMs: 200 },
    ],
  },
  {
    id: 'onboarding_verification',
    path: '/onboarding?demo=1&owt=4',
    title: 'Verification',
    description: 'Verification step in onboarding.',
    inMainScript: true,
    envModes: mockAll,
  },
  {
    id: 'onboarding_dryrun',
    path: '/onboarding?demo=1&owt=5',
    title: 'Dry run',
    description: 'Finish onboarding to enter the guided flow.',
    inMainScript: true,
    envModes: mockAll,
  },
  {
    id: 'verify_standalone',
    path: '/verify?demo=1',
    title: 'ZK verification',
    description: 'Semaphore proof in-browser; server verifies via Edge Function.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'v1',
        content:
          'Same path as production: proof is verified server-side. Squad chat is a separate surface—messaging is not end-to-end against the operator until shipped.',
        selector: '[data-demo="verify-root"]',
      },
    ],
  },
  {
    id: 'intent',
    path: '/find-squad?demo=1',
    title: 'Intent',
    description: 'Slow intent text — choose perspective in the app.',
    inMainScript: true,
    envModes: mockAll,
    actions: [
      { kind: 'focus', selector: '[data-demo="intent-input"]', delayMs: 1200 },
      {
        kind: 'type',
        selector: '[data-demo="intent-input"]',
        text: DEMO_PERSONA.intent,
        charDelayMs: HUMAN_CHAR_MS,
        delayMs: 1200,
      },
    ],
    overlaySteps: [
      {
        id: 'in1',
        content: 'After typing: pick Perspective A or B in the app before Find my squad.',
        selector: '[data-demo="intent-input"]',
      },
    ],
  },
  {
    id: 'match',
    path: '/match?demo=1',
    title: 'Matchmaking',
    description: 'Guided beat — Next advances when you are ready.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'm1',
        content: 'Simulates finding your squad — pacing is controlled by the tour.',
        selector: '[data-demo="match-guided-root"]',
      },
    ],
  },
  {
    id: 'session_offline',
    path: '/session/demo-session-001?demo=1',
    title: 'Squad session (demo)',
    description: 'Offline mock messages (browser only).',
    inMainScript: true,
    envModes: mockAll,
    actions: [
      { kind: 'focus', selector: '[data-demo="session-composer"]', delayMs: 1200 },
      {
        kind: 'type',
        selector: '[data-demo="session-composer"]',
        text: DEMO_PERSONA.sessionLine,
        charDelayMs: HUMAN_CHAR_MS,
        delayMs: 1200,
      },
    ],
    overlaySteps: [
      {
        id: 's1',
        content: 'Offline demo — nothing leaves this browser tab.',
        selector: '[data-demo="session-composer"]',
      },
    ],
  },
  {
    id: 'ledger',
    path: `/ledger/${DEMO_PROPOSAL_ID}?demo=1`,
    title: 'Ledger',
    description: 'Seeded proposal drill-down.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'l1',
        content: 'Citable, timestamped output — demo row uses the seeded proposal id.',
      },
    ],
  },
  {
    id: 'security',
    path: '/security?demo=1',
    title: 'Security & privacy',
    description: 'Zero-knowledge posture and verification.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'sec1',
        content:
          'Verification proves membership without exposing identity to peers or the public ledger.',
      },
    ],
  },
  {
    id: 'profile',
    path: '/settings/profile?demo=1',
    title: 'Profile',
    description:
      'Same persona as the guided tour — Northstar-7, strategist, matching routing hints.',
    inMainScript: true,
    envModes: mockAll,
    actions: [
      { kind: 'focus', selector: '[data-demo="profile-callsign"]', delayMs: 1200 },
      {
        kind: 'type',
        selector: '[data-demo="profile-callsign"]',
        text: DEMO_PERSONA.callsign,
        charDelayMs: HUMAN_CHAR_MS,
        delayMs: 1200,
      },
      {
        kind: 'select',
        selector: '[data-demo="profile-role"]',
        value: DEMO_PERSONA.role,
        delayMs: 1200,
      },
      { kind: 'focus', selector: '[data-demo="profile-tags"]', delayMs: 1000 },
      {
        kind: 'type',
        selector: '[data-demo="profile-tags"]',
        text: DEMO_PERSONA.tags,
        charDelayMs: HUMAN_CHAR_MS,
        delayMs: 1200,
      },
      { kind: 'focus', selector: '[data-demo="profile-era"]', delayMs: 1000 },
      {
        kind: 'type',
        selector: '[data-demo="profile-era"]',
        text: DEMO_PERSONA.eraLens,
        charDelayMs: HUMAN_CHAR_MS,
        delayMs: 1000,
      },
      { kind: 'focus', selector: '[data-demo="profile-lang"]', delayMs: 1000 },
      {
        kind: 'type',
        selector: '[data-demo="profile-lang"]',
        text: DEMO_PERSONA.language,
        charDelayMs: HUMAN_CHAR_MS,
        delayMs: 1000,
      },
      { kind: 'focus', selector: '[data-demo="profile-region"]', delayMs: 1000 },
      {
        kind: 'type',
        selector: '[data-demo="profile-region"]',
        text: DEMO_PERSONA.region,
        charDelayMs: HUMAN_CHAR_MS,
        delayMs: 1000,
      },
      { kind: 'focus', selector: '[data-demo="profile-timewindow"]', delayMs: 1000 },
      {
        kind: 'type',
        selector: '[data-demo="profile-timewindow"]',
        text: DEMO_PERSONA.timezoneWindow,
        charDelayMs: HUMAN_CHAR_MS,
        delayMs: 1000,
      },
    ],
  },
];

/** Main linear script (excludes appendix routes like `/mod`). */
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
