import { DEFAULT_DEMO_SCENARIO_ID, getDemoScenarioById, type DemoScenario } from './demoScenarios';

/** `sessionStorage` key — tour active when set to `"1"` (with optional `?demo=1` in URL). */
export const DEMO_WALKTHROUGH_STORAGE_KEY = 'demoWalkthrough';

/** `sessionStorage` key — index of the last visible step (used by the presenter hub for resume). */
export const DEMO_LAST_STEP_INDEX_STORAGE_KEY = 'squadridge_demo_last_step_index';

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
  /**
   * Per-step automation. Resolved at execution time so scenario switches
   * change the typed text without forcing a new step list.
   */
  buildActions?: (scenario: DemoScenario) => DemoAction[];
  overlaySteps?: DemoOverlayStep[];
  /** Talk-track shown by the presenter notes overlay (`?notes=1`). */
  presenterNotes?: string;
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
    presenterNotes:
      'Frame the wedge: structured, facilitator-led cohorts where verification + safety + record-keeping matter more than mass-market growth. Press Next to begin onboarding.',
    inMainScript: true,
    envModes: mockAll,
  },
  {
    id: 'onboarding_mission',
    path: '/onboarding/mission?demo=1&owt=0',
    title: 'Mission brief',
    description: 'Onboarding — read the brief, then use Next in the card to continue.',
    presenterNotes:
      'Onboarding is a wizard. The mission step sets the operating posture: this is a private room, not a public square.',
    inMainScript: true,
    envModes: mockAll,
  },
  {
    id: 'onboarding_identity',
    path: '/onboarding/identity?demo=1&owt=1',
    title: 'Identity',
    description: 'Callsign, lane, and operational context.',
    presenterNotes:
      'Identity here is a participant pseudonym, not an identity attestation. Verification (later step) is what proves eligibility.',
    inMainScript: true,
    envModes: mockAll,
    buildActions: (scenario) => [
      { kind: 'focus', selector: '[data-demo="onboarding-callsign"]', delayMs: 400 },
      {
        kind: 'type',
        selector: '[data-demo="onboarding-callsign"]',
        text: scenario.persona.callsign,
        charDelayMs: HUMAN_CHAR_MS,
      },
      { kind: 'wait', ms: 2000 },
      {
        kind: 'click',
        selector: `[data-demo="onboarding-role-${scenario.persona.role}"]`,
        delayMs: 200,
      },
      { kind: 'wait', ms: 1000 },
      {
        kind: 'select',
        selector: '[data-demo="onboarding-era-trigger"]',
        value: scenario.persona.eraAffiliation,
        delayMs: 200,
      },
    ],
  },
  {
    id: 'onboarding_placement',
    path: '/onboarding/placement?demo=1&owt=2',
    title: 'Placement',
    description: 'Language, region, and time window.',
    presenterNotes:
      'Placement narrows matchmaking pools. Region is coarse-grained on purpose — see the threat model for what is and is not stored.',
    inMainScript: true,
    envModes: mockAll,
    buildActions: (scenario) => [
      { kind: 'focus', selector: '[data-demo="onboarding-language"]', delayMs: 400 },
      {
        kind: 'type',
        selector: '[data-demo="onboarding-language"]',
        text: scenario.persona.language,
        charDelayMs: HUMAN_CHAR_MS,
      },
      { kind: 'wait', ms: 1000 },
      { kind: 'focus', selector: '[data-demo="onboarding-region"]', delayMs: 200 },
      {
        kind: 'type',
        selector: '[data-demo="onboarding-region"]',
        text: scenario.persona.region,
        charDelayMs: HUMAN_CHAR_MS,
      },
      { kind: 'wait', ms: 1000 },
      { kind: 'focus', selector: '[data-demo="onboarding-timezone"]', delayMs: 200 },
      {
        kind: 'type',
        selector: '[data-demo="onboarding-timezone"]',
        text: scenario.persona.timezoneWindow,
        charDelayMs: HUMAN_CHAR_MS,
      },
    ],
  },
  {
    id: 'onboarding_rules',
    path: '/onboarding/rules?demo=1&owt=3',
    title: 'Rules & safety',
    description: 'Accept the rules to continue.',
    presenterNotes:
      'Explicit consent on the rules — no silent opt-in. Pilot partners can replace this copy without a release.',
    inMainScript: true,
    envModes: mockAll,
    buildActions: () => [
      { kind: 'wait', ms: 2000 },
      { kind: 'click', selector: '[data-demo="onboarding-rules-accept"]', delayMs: 200 },
    ],
  },
  {
    id: 'onboarding_verification',
    path: '/onboarding/verification?demo=1&owt=4',
    title: 'Verification',
    description: 'Verification step in onboarding.',
    presenterNotes:
      'Eligibility is proved with a Semaphore-style proof. The full proof generation animation is on the next standalone verify step.',
    inMainScript: true,
    envModes: mockAll,
  },
  {
    id: 'onboarding_dryrun',
    path: '/onboarding/dryrun?demo=1&owt=5',
    title: 'Dry run',
    description: 'Finish onboarding to enter the guided flow.',
    presenterNotes:
      'A safe rehearsal before the participant ever joins a live cohort. This is where the de-escalation UX pattern shows up first.',
    inMainScript: true,
    envModes: mockAll,
  },
  {
    id: 'verify_standalone',
    path: '/verify?demo=1',
    title: 'ZK verification',
    description: 'Semaphore proof in-browser; server verifies via Edge Function.',
    presenterNotes:
      'Walk through the proof timeline: identity is local-only; the server only sees a proof + nullifier. Zero-knowledge in practice, not in slides.',
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
    presenterNotes:
      'Intent text is what powers matchmaking pools. Slow typing is intentional — investors should see the effort the participant is asked to put in.',
    inMainScript: true,
    envModes: mockAll,
    buildActions: (scenario) => [
      { kind: 'focus', selector: '[data-demo="intent-input"]', delayMs: 1200 },
      {
        kind: 'type',
        selector: '[data-demo="intent-input"]',
        text: scenario.intentText,
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
    presenterNotes:
      'The narrative beat reads as a real match — the production path uses the same screen with live queue snapshots.',
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
    presenterNotes:
      'Press Play scene to stream scripted messages, fire the Slow down intervention, and reveal translation. Nothing leaves the tab.',
    inMainScript: true,
    envModes: mockAll,
    buildActions: (scenario) => [
      { kind: 'focus', selector: '[data-demo="session-composer"]', delayMs: 1200 },
      {
        kind: 'type',
        selector: '[data-demo="session-composer"]',
        text: scenario.sessionLine,
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
    path: `/ledger/${getDemoScenarioById(DEFAULT_DEMO_SCENARIO_ID).proposalId}?demo=1`,
    title: 'Ledger',
    description: 'Seeded proposal drill-down.',
    presenterNotes:
      'The ledger is the only artifact of a session that leaves the room — anonymous, timestamped, citable. Press Play publish to dramatize the consensus → publish flow.',
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
    title: 'Security Disclosure',
    description: 'Zero-knowledge posture and verification.',
    presenterNotes:
      'Tie the live demo back to the threat model: what holds today vs. what is roadmap. Investors and partners both read this page before signing.',
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
    description: 'Same persona as the guided tour — scenario-driven.',
    presenterNotes:
      'Profile fields are scenario-driven so the persona stays consistent across onboarding, intent, and the post-session settings page.',
    inMainScript: true,
    envModes: mockAll,
    buildActions: (scenario) => [
      { kind: 'focus', selector: '[data-demo="profile-callsign"]', delayMs: 1200 },
      {
        kind: 'type',
        selector: '[data-demo="profile-callsign"]',
        text: scenario.persona.callsign,
        charDelayMs: HUMAN_CHAR_MS,
        delayMs: 1200,
      },
      {
        kind: 'select',
        selector: '[data-demo="profile-role"]',
        value: scenario.persona.role,
        delayMs: 1200,
      },
      { kind: 'focus', selector: '[data-demo="profile-tags"]', delayMs: 1000 },
      {
        kind: 'type',
        selector: '[data-demo="profile-tags"]',
        text: scenario.persona.tags,
        charDelayMs: HUMAN_CHAR_MS,
        delayMs: 1200,
      },
      { kind: 'focus', selector: '[data-demo="profile-era"]', delayMs: 1000 },
      {
        kind: 'type',
        selector: '[data-demo="profile-era"]',
        text: scenario.persona.eraLens,
        charDelayMs: HUMAN_CHAR_MS,
        delayMs: 1000,
      },
      { kind: 'focus', selector: '[data-demo="profile-lang"]', delayMs: 1000 },
      {
        kind: 'type',
        selector: '[data-demo="profile-lang"]',
        text: scenario.persona.language,
        charDelayMs: HUMAN_CHAR_MS,
        delayMs: 1000,
      },
      { kind: 'focus', selector: '[data-demo="profile-region"]', delayMs: 1000 },
      {
        kind: 'type',
        selector: '[data-demo="profile-region"]',
        text: scenario.persona.region,
        charDelayMs: HUMAN_CHAR_MS,
        delayMs: 1000,
      },
      { kind: 'focus', selector: '[data-demo="profile-timewindow"]', delayMs: 1000 },
      {
        kind: 'type',
        selector: '[data-demo="profile-timewindow"]',
        text: scenario.persona.timezoneWindow,
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

/**
 * Resolve the current step's actions for a scenario. Falls back to an empty
 * list if the step is purely navigational.
 */
export function resolveStepActions(step: DemoStep, scenario: DemoScenario): DemoAction[] {
  return step.buildActions ? step.buildActions(scenario) : [];
}

/* ----------------------------------------------------------------------------
 * Re-exports for callers that historically imported from `demoScript`
 * --------------------------------------------------------------------------*/

export {
  DEMO_SCENARIOS,
  DEFAULT_DEMO_SCENARIO_ID,
  DEMO_SCENARIO_STORAGE_KEY,
  getDemoScenarioById,
  persistDemoScenarioId,
  readStoredDemoScenarioId,
  type DemoScenario,
  type DemoScenarioId,
} from './demoScenarios';
