import { DEMO_PERSONA } from './demoPersona';

/** `sessionStorage` key — tour active when set to `"1"` (with optional `?demo=1` in URL). */
export const DEMO_WALKTHROUGH_STORAGE_KEY = 'demoWalkthrough';

/** `sessionStorage` key — JSON `{ stepId, tipIndex }` for resumable within-step progress. */
export const DEMO_WALKTHROUGH_TIP_KEY = 'demoWalkthroughTip';

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

/**
 * Surface for a single tip within a scripted step.
 * - `sheet` — side panel explanation (default for route context)
 * - `callout` — short hint anchored to a control (requires `target`)
 * - `inline` — non-anchored panel copy (no spotlight)
 * - `modal` — blocking only (consent / exit / destructive); rare in the tour script
 */
export type DemoSurfaceType = 'sheet' | 'callout' | 'modal' | 'inline';

export type DemoTipPlacement = 'auto' | 'above' | 'below';

/** One progressive tip inside a route step. Next/Back walk these before changing routes. */
export type DemoTip = {
  id: string;
  type: DemoSurfaceType;
  title: string;
  body: string;
  /** CSS selector for spotlight / anchored callout */
  target?: string;
  placement?: DemoTipPlacement;
  /** When true, dim page interaction outside the tour chrome (explanatory tips stay false). */
  blockInteraction?: boolean;
};

/** @deprecated Prefer `DemoTip`. Kept for import compatibility. */
export type DemoOverlayStep = {
  id: string;
  content: string;
  selector?: string;
  title?: string;
  type?: DemoSurfaceType;
};

export type DemoStep = {
  id: string;
  path: string;
  title: string;
  /** Short control-panel summary for the side sheet header. */
  description?: string;
  envModes: Partial<Record<EnvMode, 'live' | 'mock'>>;
  actions?: DemoAction[];
  /** Linear tips for this route. Prefer over legacy `overlaySteps`. */
  tips?: DemoTip[];
  /** @deprecated Use `tips`. Mapped at runtime when `tips` is absent. */
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

function tip(
  id: string,
  title: string,
  body: string,
  opts?: Partial<Pick<DemoTip, 'type' | 'target' | 'placement' | 'blockInteraction'>>,
): DemoTip {
  const hasTarget = Boolean(opts?.target);
  return {
    id,
    title,
    body,
    type: opts?.type ?? (hasTarget ? 'callout' : 'sheet'),
    target: opts?.target,
    placement: opts?.placement ?? 'auto',
    blockInteraction: opts?.blockInteraction ?? false,
  };
}

/**
 * Canonical NGO / facilitator tour for App.v2.
 * Order matches Back / Next / Exit chrome. Tips advance linearly before the next route.
 */
export const demoSteps: DemoStep[] = [
  {
    id: 'welcome',
    path: '/?demo=1',
    title: 'Welcome',
    description: 'Private room → release gate → public ledger.',
    inMainScript: true,
    envModes: mockAll,
    tips: [
      tip(
        'welcome-brand',
        'Product spine',
        'Facilitator-led rooms stay private. Only an approved outcome can leave the room.',
        { target: '[data-demo="landing-hero"]' },
      ),
      tip(
        'welcome-why',
        'Why this vessel',
        'Scroll: who it serves, and why chat or email is the wrong place for high-stakes conflict.',
        { target: '[data-demo="landing-why"]' },
      ),
      tip(
        'welcome-ledger',
        'Public record specimen',
        'Further down: illustrative ledger entries. Dialogue never appears — only approved release text.',
        { target: '[data-demo="landing-ledger"]' },
      ),
      tip(
        'welcome-nav',
        'Controls',
        'Next advances. Back returns. Exit tour leaves anytime — you can resume from where you stopped.',
        { type: 'sheet' },
      ),
    ],
  },
  {
    id: 'how_it_works',
    path: '/how-it-works?demo=1',
    title: 'How it works',
    description: 'Configure → Verify → Facilitate → Release.',
    inMainScript: true,
    envModes: mockAll,
    tips: [
      tip(
        'hiw-spine',
        'Lifecycle',
        'Mediators control the lifecycle. The platform tracks verification, session controls, and publish — not the dialogue.',
        { target: '[data-demo="how-it-works-spine"]' },
      ),
      tip(
        'hiw-guarantees',
        'Room guarantees',
        'Scroll: no auto-publish, verification before entry, facilitator-controlled release.',
        { target: '[data-demo="how-it-works-guarantees"]' },
      ),
    ],
  },
  {
    id: 'security',
    path: '/security?demo=1',
    title: 'Security boundary',
    description: 'Room vs record — what can leave.',
    inMainScript: true,
    envModes: mockAll,
    tips: [
      tip(
        'security-frame',
        'Honest boundary',
        'The room and the record are separate by design. Read this before piloting.',
        { target: '[data-demo="security-hero"]' },
      ),
      tip(
        'security-not',
        'Limits',
        'Scroll to “What we do not do” — operator-readable rooms; not Signal-grade E2E.',
        { target: '[data-demo="security-limits"]' },
      ),
    ],
  },
  {
    id: 'ledger',
    path: '/ledger?demo=1',
    title: 'Public ledger',
    description: 'Released records only — not transcripts.',
    inMainScript: true,
    envModes: mockAll,
    tips: [
      tip(
        'ledger-index',
        'Ledger scope',
        'Approved public records only. Session dialogue never appears here.',
        { target: '[data-demo="ledger-index"]' },
      ),
    ],
  },
  {
    id: 'facilitator_dashboard',
    path: '/app/facilitator?demo=1',
    title: 'Facilitator dashboard',
    description: 'Room operations (facilitator).',
    inMainScript: true,
    envModes: mockAll,
    tips: [
      tip(
        'dash-header',
        'Facilitator view',
        'Manage rooms, verification, pacing, and release. Seeded sessions are illustrative.',
        { target: '[data-demo="facilitator-dashboard"]' },
      ),
      tip(
        'dash-new',
        'Role switcher',
        'Header role switcher previews Participant and Moderator views.',
        { target: '[data-demo="nav-sessions"]' },
      ),
    ],
  },
  {
    id: 'participant_dashboard',
    path: '/app/participant?demo=1',
    title: 'Participant dashboard',
    description: 'Invitee workspace.',
    inMainScript: true,
    envModes: mockAll,
    tips: [
      tip(
        'participant-home',
        'Participant view',
        'Your rooms, required actions, and approved outcomes — not other parties’ full transcripts.',
        { target: '[data-demo="participant-dashboard"]' },
      ),
    ],
  },
  {
    id: 'moderator_dashboard',
    path: '/app/moderator?demo=1',
    title: 'Moderator dashboard',
    description: 'Safety oversight.',
    inMainScript: true,
    envModes: mockAll,
    tips: [
      tip(
        'moderator-home',
        'Moderator view',
        'Process integrity signals. Release still belongs to the facilitator — no auto-publish.',
        { target: '[data-demo="moderator-dashboard"]' },
      ),
    ],
  },
  {
    id: 'sessions_list',
    path: '/app/sessions?demo=1',
    title: 'Sessions',
    description: 'Rooms you facilitate.',
    inMainScript: true,
    envModes: mockAll,
    tips: [
      tip(
        'sessions-table',
        'Session list',
        'Each row is a deliberation room with a lifecycle status. Next: Configure → Invite → Verify.',
        { target: '[data-demo="sessions-list"]' },
      ),
    ],
  },
  {
    id: 'session_configure',
    path: '/app/sessions/new/setup?demo=1',
    title: 'Configure',
    description: 'Template and eligibility.',
    inMainScript: true,
    envModes: mockAll,
    tips: [
      tip(
        'configure-setup',
        'Pilot default',
        'NGO internal deliberation with a private anchored memo. Public ledger publish stays optional.',
        { target: '[data-demo="session-new"]' },
      ),
    ],
  },
  {
    id: 'session_invite',
    path: `/app/sessions/${DEMO_FACILITATOR_SESSION_ID}/invite?demo=1`,
    title: 'Invite',
    description: 'Participant invite links.',
    inMainScript: true,
    envModes: mockAll,
    tips: [
      tip(
        'invite-panel',
        'Invite tokens',
        'Each participant gets a unique /p/invite token. Treat links as bearer secrets.',
        { target: '[data-demo="session-invite"]' },
      ),
    ],
  },
  {
    id: 'session_verify',
    path: `/app/sessions/${DEMO_FACILITATOR_SESSION_ID}/participants?demo=1`,
    title: 'Verify',
    description: 'Approve before opening the room.',
    inMainScript: true,
    envModes: mockAll,
    tips: [
      tip(
        'verify-review',
        'Verification gate',
        'Facilitator review is the gate. The live room stays closed until required participants are verified.',
        { target: '[data-demo="session-participants"]' },
      ),
    ],
  },
  {
    id: 'session_control',
    path: `/app/sessions/${DEMO_FACILITATOR_SESSION_ID}/control?demo=1`,
    title: 'Session control',
    description: 'Private room controls.',
    inMainScript: true,
    envModes: mockAll,
    tips: [
      tip(
        'control-room',
        'Private room',
        'Participants are pseudonymous. Dialogue stays here until you draft an outcome.',
        { target: '[data-demo="session-control"]' },
      ),
    ],
  },
  {
    id: 'session_outcome',
    path: `/app/sessions/${DEMO_FACILITATOR_SESSION_ID}/outcome?demo=1`,
    title: 'Outcome draft',
    description: 'What may leave the room.',
    inMainScript: true,
    envModes: mockAll,
    tips: [
      tip(
        'outcome-draft',
        'Outcome draft',
        'Facilitator-authored. Nothing becomes public until you pass the release gate.',
        { target: '[data-demo="session-outcome"]' },
      ),
    ],
  },
  {
    id: 'session_release',
    path: `/app/sessions/${DEMO_FACILITATOR_SESSION_ID}/release?demo=1`,
    title: 'Release gate',
    description: 'Approve ledger publish.',
    inMainScript: true,
    envModes: mockAll,
    tips: [
      tip(
        'release-gate',
        'Release gate',
        'Release is explicit. The platform does not auto-publish chat.',
        { target: '[data-demo="session-release"]' },
      ),
    ],
  },
  {
    id: 'tour_complete',
    path: '/app/facilitator?demo=1&tour=done',
    title: 'Tour complete',
    description: 'Explore freely, or exit the tour.',
    inMainScript: true,
    envModes: mockAll,
    tips: [
      tip(
        'done',
        'Complete',
        'Spine walked. Explore seeded sessions, or Exit tour to leave the guide.',
        { target: '[data-demo="facilitator-dashboard"]', type: 'sheet' },
      ),
    ],
  },
];

/** Normalize legacy overlaySteps into tips. */
export function resolveStepTips(step: DemoStep | null | undefined): DemoTip[] {
  if (!step) return [];
  if (step.tips?.length) return step.tips;
  if (!step.overlaySteps?.length) return [];
  return step.overlaySteps.map((o) =>
    tip(o.id, o.title ?? 'Hint', o.content, {
      type: o.type ?? (o.selector ? 'callout' : 'sheet'),
      target: o.selector,
    }),
  );
}

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

export type PersistedTipState = { stepId: string; tipIndex: number };

export function readPersistedTipState(): PersistedTipState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DEMO_WALKTHROUGH_TIP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedTipState;
    if (typeof parsed?.stepId !== 'string' || typeof parsed?.tipIndex !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePersistedTipState(stepId: string, tipIndex: number): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(DEMO_WALKTHROUGH_TIP_KEY, JSON.stringify({ stepId, tipIndex }));
  } catch {
    /* ignore quota */
  }
}

export function clearPersistedTipState(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(DEMO_WALKTHROUGH_TIP_KEY);
  } catch {
    /* ignore */
  }
}
