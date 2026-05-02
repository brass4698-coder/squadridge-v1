/**
 * Scripted demo scenarios — single source of truth for persona, intent text,
 * seed messages, and ledger landing for each presenter scene.
 *
 * The default scenario (`cross-border-corridor`) is the historical persona that
 * lived in `demoPersona.ts`. The two additional scenarios mirror the deployment
 * templates surfaced on `/partners` so a presenter can match the live audience
 * (peacebuilding org vs. workplace mediation vs. veterans dialogue) without
 * editing code or copy.
 *
 * Scenarios are scenario-data only — paths, step ordering, and overlays remain
 * scenario-invariant (see `demoScript.ts`). Auto-action text is resolved via
 * `getStepActions(stepId, scenario)` so a scenario switch flows through the
 * entire scripted journey (onboarding identity, intent input, profile fields,
 * offline session voice, ledger proposal id) without mutating the step list.
 */

import { DEMO_PROPOSAL_ID } from '../lib/demoSession';

export type DemoScenarioId = 'cross-border-corridor' | 'workplace-mediation' | 'veterans-dialogue';

/** Onboarding role radio + profile `<select>` value. Must match `IdentityStep` ROLES. */
export type DemoScenarioRole = 'analyst' | 'strategist' | 'coordinator';

/** Onboarding era `<Select>` value. Must match `IdentityStep` ERAS. */
export type DemoScenarioEra = 'pre_modern' | 'modern' | 'contemporary' | 'near_future';

export interface DemoScenarioPersona {
  callsign: string;
  role: DemoScenarioRole;
  eraAffiliation: DemoScenarioEra;
  /** Free-text era lens shown on the profile page. */
  eraLens: string;
  language: string;
  region: string;
  timezoneWindow: string;
  /** Comma-separated tags (profile field). */
  tags: string;
  verificationEmail: string;
}

export interface DemoScenarioSeedMessage {
  id: string;
  senderLabel: string;
  body: string;
  sentAt: string;
}

export interface DemoScenarioScriptedIncoming {
  /** Delay since the previous scripted message in the scene. */
  delayMs: number;
  senderLabel: string;
  body: string;
}

export interface DemoScenario {
  id: DemoScenarioId;
  /** Display label in the presenter hub. */
  label: string;
  /** Compact label for chips and the bottom chrome. */
  shortLabel: string;
  /** One-line description of the audience and tone. */
  audience: string;
  /** Two-three sentence framing for the scenario card. */
  description: string;

  persona: DemoScenarioPersona;

  /** Intent narrative typed into `/find-squad`. */
  intentText: string;
  /** Voice for the offline session composer auto-type. */
  sessionLine: string;
  /** Dry-run reply line (used by onboarding dry-run pages). */
  dryRunReply: string;

  /** Initial seed messages for the offline DemoSessionPage. */
  seedMessages: DemoScenarioSeedMessage[];
  /** Scripted live messages for the autoplay scene (Phase 2). */
  scriptedIncoming: DemoScenarioScriptedIncoming[];
  /** Scripted intervention banner copy fired mid-scene. */
  interventionLine: string;
  /** Translation reveal pair displayed alongside the intervention. */
  translationReveal: { source: string; translated: string };

  /** Ledger proposal id this scenario lands on. */
  proposalId: string;
  /** Ledger publish dramatization beats. */
  ledgerBeats: ReadonlyArray<{ label: string; detail: string }>;
}

/* ----------------------------------------------------------------------------
 * Scenario catalogue
 * --------------------------------------------------------------------------*/

const CROSS_BORDER_CORRIDOR: DemoScenario = {
  id: 'cross-border-corridor',
  label: 'Cross-border corridor',
  shortLabel: 'Corridor',
  audience: 'Peacebuilding NGOs, Track II / 1.5 facilitators, conflict-resolution labs.',
  description:
    'Strategist persona. Two delegations agree on civilian-safety framing for a contested corridor before discussing logistics. Anchors the threat model to identity-protected access and operator-readable safety review.',
  persona: {
    callsign: 'Northstar-7',
    role: 'strategist',
    eraAffiliation: 'contemporary',
    eraLens: 'Contemporary',
    language: 'English',
    region: 'Western Europe',
    timezoneWindow: 'Weekday evenings UTC',
    tags: 'dialogue, cross_border, corridor_demo',
    verificationEmail: 'presenter.demo@example.com',
  },
  intentText:
    'Strategist framing for a cross-border corridor — walkthrough only; matching the Northstar-7 demo persona.',
  sessionLine: '[Northstar-7] Acknowledged — proceeding to ledger review per demo script.',
  dryRunReply:
    'We should align on de-escalation and civilian safety framing before discussing any detailed logistics.',
  seedMessages: [
    {
      id: 'm1',
      senderLabel: 'Participant B',
      body: 'Proposons trois étapes pour sécuriser le corridor — accès, signalisation, et points neutres.',
      sentAt: '14:02',
    },
    {
      id: 'm2',
      senderLabel: 'Participant C',
      body: '한국어로 핵심만: 먼저 민간인 우선 대피 경로를 합의해야 합니다.',
      sentAt: '14:04',
    },
    {
      id: 'm3',
      senderLabel: 'Participant D',
      body: 'Agree on a single coordination frequency before we draft protocols — avoids crossed signals.',
      sentAt: '14:05',
    },
  ],
  scriptedIncoming: [
    {
      delayMs: 2400,
      senderLabel: 'Participant B',
      body: 'D\u2019accord sur priorité civils — peut-on confirmer fenêtre 06h-10h ?',
    },
    {
      delayMs: 3200,
      senderLabel: 'Participant D',
      body: 'Window works. Need a fallback if signalling fails.',
    },
    {
      delayMs: 3600,
      senderLabel: 'Participant C',
      body: '예비 채널을 두 개 지정하면 문제 없을 것 같습니다.',
    },
  ],
  interventionLine:
    'Slow down — multiple proposals stacked in 30 seconds. Take one, name it, then move to the next.',
  translationReveal: {
    source: '예비 채널을 두 개 지정하면 문제 없을 것 같습니다.',
    translated: 'Designating two backup channels should resolve it.',
  },
  proposalId: DEMO_PROPOSAL_ID,
  ledgerBeats: [
    {
      label: 'Drafting',
      detail: 'Facilitator drafts the consensus statement from the room transcript.',
    },
    {
      label: 'Consent collected',
      detail: '4 of 4 participants signed the anonymous publish ballot.',
    },
    { label: 'Quorum reached', detail: 'Threshold met: ≥2/3 participation, majority approve.' },
    {
      label: 'Published',
      detail: 'Anonymous timestamped record now visible on the public ledger.',
    },
  ],
};

const WORKPLACE_MEDIATION: DemoScenario = {
  id: 'workplace-mediation',
  label: 'Workplace mediation',
  shortLabel: 'Workplace',
  audience: 'HR-led harm review, ethics offices, ombuds programs running structured mediation.',
  description:
    'Coordinator persona. Two teams resolve a recurring scheduling and recognition dispute with witness protection defaults and an HR-readable resolution statement.',
  persona: {
    callsign: 'Beacon-12',
    role: 'coordinator',
    eraAffiliation: 'contemporary',
    eraLens: 'Contemporary',
    language: 'English',
    region: 'North America',
    timezoneWindow: 'Weekdays 13:00-17:00 ET',
    tags: 'workplace, mediation, recognition',
    verificationEmail: 'mediator.demo@example.com',
  },
  intentText:
    'Coordinator framing for a recurring workplace mediation — recognition + scheduling concerns; bounded session, no transcript.',
  sessionLine: '[Beacon-12] Logging proposed shift swap policy for HR-readable resolution record.',
  dryRunReply:
    'Let us name the recognition issue first; we can reach a workable shift policy once both sides feel heard.',
  seedMessages: [
    {
      id: 'm1',
      senderLabel: 'Participant B',
      body: 'My team feels back-shifts are unevenly distributed — can we walk through the last six weeks?',
      sentAt: '10:14',
    },
    {
      id: 'm2',
      senderLabel: 'Participant C',
      body: 'Agree on the data review. Recognition for off-hours coverage is the real ask, not just the rota.',
      sentAt: '10:15',
    },
    {
      id: 'm3',
      senderLabel: 'Participant D',
      body: 'I can pull the schedule audit; suggest we keep names off it for this round.',
      sentAt: '10:17',
    },
  ],
  scriptedIncoming: [
    {
      delayMs: 2400,
      senderLabel: 'Participant B',
      body: 'Anonymized rota fine — but please include weekend frequency.',
    },
    {
      delayMs: 3000,
      senderLabel: 'Participant C',
      body: 'Plus a column for who declined a swap so it is not just a count.',
    },
    {
      delayMs: 3400,
      senderLabel: 'Participant D',
      body: 'That is fair. I will draft the column set and share back here.',
    },
  ],
  interventionLine:
    'Slow down — three asks in a row. Confirm the data scope before adding more dimensions.',
  translationReveal: {
    source: 'Plus a column for who declined a swap so it is not just a count.',
    translated: 'Plus a column for who declined a swap so it is not just a count.',
  },
  proposalId: DEMO_PROPOSAL_ID,
  ledgerBeats: [
    {
      label: 'Drafting',
      detail: 'Mediator drafts the resolution statement with HR-readable scope.',
    },
    { label: 'Consent collected', detail: '3 of 4 participants signed the publish ballot.' },
    { label: 'Quorum reached', detail: 'Threshold met: ≥2/3 participation, majority approve.' },
    { label: 'Published', detail: 'Resolution statement now archived as the shareable record.' },
  ],
};

const VETERANS_DIALOGUE: DemoScenario = {
  id: 'veterans-dialogue',
  label: 'Veterans dialogue',
  shortLabel: 'Veterans',
  audience: 'Veteran service organizations, peer-support cohorts, transition programs.',
  description:
    'Analyst persona. Career-risk-aware identity defaults, unit-level pseudonyms, and facilitator-only attribution. Repeating weekly cohort.',
  persona: {
    callsign: 'Lighthouse-3',
    role: 'analyst',
    eraAffiliation: 'contemporary',
    eraLens: 'Contemporary',
    language: 'English',
    region: 'North America',
    timezoneWindow: 'Tuesday evenings ET',
    tags: 'veterans, peer_support, transition',
    verificationEmail: 'peer.support.demo@example.com',
  },
  intentText:
    'Analyst framing for a peer-support cohort — career-risk-aware, unit-level pseudonyms; repeating weekly room.',
  sessionLine: '[Lighthouse-3] Holding the room for next week — same cohort, same boundaries.',
  dryRunReply: 'Take the time you need; the room is bounded and there is no recording.',
  seedMessages: [
    {
      id: 'm1',
      senderLabel: 'Squad-mate B',
      body: 'Last week\u2019s framing helped — naming the transition as work, not failure.',
      sentAt: '19:31',
    },
    {
      id: 'm2',
      senderLabel: 'Squad-mate C',
      body: 'Same. Want to bring up VA appointment loops if there\u2019s room.',
      sentAt: '19:33',
    },
    {
      id: 'm3',
      senderLabel: 'Squad-mate D',
      body: 'Open to that. Can we hold ten minutes for it after the check-in round?',
      sentAt: '19:34',
    },
  ],
  scriptedIncoming: [
    {
      delayMs: 2600,
      senderLabel: 'Squad-mate B',
      body: 'Yes — and a quick check on sleep this week. Mine\u2019s been off.',
    },
    {
      delayMs: 3000,
      senderLabel: 'Squad-mate C',
      body: 'Same on sleep. Caffeine cutoff actually helped.',
    },
    {
      delayMs: 3200,
      senderLabel: 'Squad-mate D',
      body: 'Noted. Saving the appointment loop topic for after sleep.',
    },
  ],
  interventionLine:
    'Power of pause — three threads opening fast. Park sleep and appointment loops; pick one for this round.',
  translationReveal: {
    source: 'Same on sleep. Caffeine cutoff actually helped.',
    translated: 'Same on sleep. Caffeine cutoff actually helped.',
  },
  proposalId: DEMO_PROPOSAL_ID,
  ledgerBeats: [
    {
      label: 'Drafting',
      detail: 'Facilitator drafts the cohort learning summary with no participant attribution.',
    },
    { label: 'Consent collected', detail: '4 of 4 squad-mates signed the publish ballot.' },
    { label: 'Quorum reached', detail: 'Threshold met: ≥2/3 participation, majority approve.' },
    { label: 'Published', detail: 'Cohort learning summary archived for facilitator review.' },
  ],
};

export const DEMO_SCENARIOS: ReadonlyArray<DemoScenario> = [
  CROSS_BORDER_CORRIDOR,
  WORKPLACE_MEDIATION,
  VETERANS_DIALOGUE,
];

export const DEFAULT_DEMO_SCENARIO_ID: DemoScenarioId = 'cross-border-corridor';

export const DEMO_SCENARIO_STORAGE_KEY = 'squadridge_demo_scenario';

export function getDemoScenarioById(id: string | null | undefined): DemoScenario {
  const found = DEMO_SCENARIOS.find((s) => s.id === id);
  return found ?? CROSS_BORDER_CORRIDOR;
}

export function readStoredDemoScenarioId(): DemoScenarioId {
  if (typeof window === 'undefined') return DEFAULT_DEMO_SCENARIO_ID;
  try {
    const raw = window.sessionStorage.getItem(DEMO_SCENARIO_STORAGE_KEY);
    if (!raw) return DEFAULT_DEMO_SCENARIO_ID;
    const found = DEMO_SCENARIOS.find((s) => s.id === raw);
    return found ? found.id : DEFAULT_DEMO_SCENARIO_ID;
  } catch {
    return DEFAULT_DEMO_SCENARIO_ID;
  }
}

export function persistDemoScenarioId(id: DemoScenarioId): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(DEMO_SCENARIO_STORAGE_KEY, id);
  } catch {
    /* ignore: storage may be unavailable in private mode */
  }
}

/* ----------------------------------------------------------------------------
 * Backwards-compat alias
 * --------------------------------------------------------------------------*/

/**
 * Historical default persona shape consumed by callers that pre-date the
 * scenario library. Equivalent to `getDemoScenarioById('cross-border-corridor').persona`
 * with the extra `intent`, `sessionLine`, `dryRunReply` fields the original
 * surface exposed.
 */
export const DEMO_PERSONA = {
  callsign: CROSS_BORDER_CORRIDOR.persona.callsign,
  role: CROSS_BORDER_CORRIDOR.persona.role,
  eraAffiliation: CROSS_BORDER_CORRIDOR.persona.eraAffiliation,
  eraLens: CROSS_BORDER_CORRIDOR.persona.eraLens,
  language: CROSS_BORDER_CORRIDOR.persona.language,
  region: CROSS_BORDER_CORRIDOR.persona.region,
  timezoneWindow: CROSS_BORDER_CORRIDOR.persona.timezoneWindow,
  tags: CROSS_BORDER_CORRIDOR.persona.tags,
  verificationEmail: CROSS_BORDER_CORRIDOR.persona.verificationEmail,
  intent: CROSS_BORDER_CORRIDOR.intentText,
  sessionLine: CROSS_BORDER_CORRIDOR.sessionLine,
  dryRunReply: CROSS_BORDER_CORRIDOR.dryRunReply,
} as const;
