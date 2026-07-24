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
        id: 'welcome-why',
        content:
          'Scroll for the institutional framing — who it serves, and why chat or email is the wrong vessel for high-stakes conflict.',
        selector: '[data-demo="landing-why"]',
      },
      {
        id: 'welcome-ledger',
        content:
          'Further down: a specimen of the public integrity record. Dialogue never appears here — only approved release text.',
        selector: '[data-demo="landing-ledger"]',
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
      {
        id: 'hiw-guarantees',
        content:
          'Scroll the spine: Room guarantees stay fixed — no auto-publish, verification before entry, facilitator-controlled release.',
        selector: '[data-demo="how-it-works-guarantees"]',
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
      {
        id: 'security-not',
        content:
          'Scroll to “What we do not do” — the distinctive trust move for technical and executive reviewers alike.',
        selector: '[data-demo="security-limits"]',
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
    path: '/app/facilitator?demo=1',
    title: 'Facilitator dashboard',
    description: 'Teal-coded room operations command center.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'dash-header',
        content:
          'Facilitator view (teal): manage rooms, verification, pacing, and release. Seeded sessions let you practice Configure → Verify → Facilitate → Release.',
        selector: '[data-demo="facilitator-dashboard"]',
      },
      {
        id: 'dash-new',
        content:
          'Use the role switcher in the header to preview Participant and Moderator dashboards — each has its own color language.',
        selector: '[data-demo="nav-sessions"]',
      },
    ],
  },
  {
    id: 'participant_dashboard',
    path: '/app/participant?demo=1',
    title: 'Participant dashboard',
    description: 'Blue-coded invitee workspace.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'participant-home',
        content:
          'Participant view (blue): your rooms, required actions, and approved outcomes only — never the full transcript of other parties.',
        selector: '[data-demo="participant-dashboard"]',
      },
    ],
  },
  {
    id: 'moderator_dashboard',
    path: '/app/moderator?demo=1',
    title: 'Moderator dashboard',
    description: 'Clay-coded safety oversight.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'moderator-home',
        content:
          'Moderator view (clay): calm safety and process integrity signals. Release still belongs to the facilitator — this lane does not auto-publish.',
        selector: '[data-demo="moderator-dashboard"]',
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
          'Back in the facilitator spine: each row is a deliberation room with a lifecycle status. Next we walk Configure → Invite → Verify before the live room.',
        selector: '[data-demo="sessions-list"]',
      },
    ],
  },
  {
    id: 'session_configure',
    path: '/app/sessions/new/setup?demo=1',
    title: 'Configure',
    description: 'Template and eligibility for a new room.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'configure-setup',
        content:
          'Pilot default is NGO internal deliberation with a private anchored memo. Public ledger publish stays optional.',
        selector: '[data-demo="session-new"]',
      },
    ],
  },
  {
    id: 'session_invite',
    path: `/app/sessions/${DEMO_FACILITATOR_SESSION_ID}/invite?demo=1`,
    title: 'Invite',
    description: 'Issue participant invite links.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'invite-panel',
        content:
          'Each participant gets a unique /p/invite token. Treat links as bearer secrets — do not post them in open channels.',
        selector: '[data-demo="session-invite"]',
      },
    ],
  },
  {
    id: 'session_verify',
    path: `/app/sessions/${DEMO_FACILITATOR_SESSION_ID}/participants?demo=1`,
    title: 'Verify',
    description: 'Approve participants before opening the room.',
    inMainScript: true,
    envModes: mockAll,
    overlaySteps: [
      {
        id: 'verify-review',
        content:
          'Facilitator review is the gate. You cannot open the live room until required participants are verified.',
        selector: '[data-demo="session-participants"]',
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
    path: '/app/facilitator?demo=1&tour=done',
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
