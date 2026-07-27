import type { UseCaseCardProps, SecondaryUseCaseProps } from '../components/shared/UseCaseCard';
import { PILOT_FIT_STRONG, PILOT_FIT_WEAK } from './siteMessaging';

/** Shared process spine — shown once at page level via the backbone illustration. */
export const USE_CASE_ARCHITECTURE_LINE = 'Private room → facilitator gate → approved record';

/** Re-export fit criteria so Use Cases stay coherent with Request Access. */
export { PILOT_FIT_STRONG, PILOT_FIT_WEAK };

export type UseCaseVignette = {
  id: string;
  sector: string;
  /** Composite / anonymized outcome — not a live pilot claim. */
  vignetteTitle: string;
  participants: string;
  timeline: string;
  outcome: string;
  /** Matching “Not a fit” lines for self-selection. */
  notFitHints: readonly string[];
};

/**
 * Anonymized composite vignettes — mirrors Strong fit / Not a fit on Request Access.
 * Not traction metrics; not live pilots.
 */
export const USE_CASE_VIGNETTES: UseCaseVignette[] = [
  {
    id: 'philanthropy',
    sector: 'Philanthropy & foundations',
    vignetteTitle: 'Composite: contested grant principles memo',
    participants: '6 verified participants (program officers + board liaison)',
    timeline: '11 days Configure → Release · private anchored memo',
    outcome:
      'Approved principles statement with SHA-256 integrity anchor. Dialogue and attribution stayed inside the room.',
    notFitHints: [PILOT_FIT_WEAK[0], PILOT_FIT_WEAK[3]],
  },
  {
    id: 'peacebuilding',
    sector: 'Peacebuilding & mediation',
    vignetteTitle: 'Composite: cross-party process agreement',
    participants: '8 codenamed participants · facilitator-led',
    timeline: '3 weeks · high sensitivity · public ledger optional (not used)',
    outcome:
      'Joint process agreement text only. No transcript; parties retained anonymity on the record.',
    notFitHints: [PILOT_FIT_WEAK[1], PILOT_FIT_WEAK[2]],
  },
  {
    id: 'hr-compliance',
    sector: 'HR, compliance & ombuds',
    vignetteTitle: 'Composite: workplace inquiry findings summary',
    participants: '5 participants (contributors + ombuds facilitator)',
    timeline: '9 days · internal-only release',
    outcome:
      'Findings summary released internally. Individual accounts never left the written room.',
    notFitHints: [PILOT_FIT_WEAK[0], PILOT_FIT_WEAK[3]],
  },
  {
    id: 'ngos',
    sector: 'NGOs & civil society',
    vignetteTitle: 'Composite: partner advocacy decision memo',
    participants: '7 staff + community liaison (pseudonymous in room)',
    timeline: '2 weeks · NGO deliberation template',
    outcome: 'Private decision memo for leadership. No public ledger publish — pilot default.',
    notFitHints: [PILOT_FIT_WEAK[0], PILOT_FIT_WEAK[2]],
  },
  {
    id: 'corporations',
    sector: 'Corporations & executive teams',
    vignetteTitle: 'Composite: JV wind-down executive committee',
    participants: '9 executives · elevated sensitivity',
    timeline: '16 days · approvals bound to final wording',
    outcome:
      'Internal board-facing outcome text. Email CC chains replaced by governed room + release gate.',
    notFitHints: [PILOT_FIT_WEAK[1], PILOT_FIT_WEAK[3]],
  },
];

/** Intake track query values for `/request-access?track=`. */
export type BuyerTrackParam = 'foundations' | 'peacebuilding' | 'hr';

export const BUYER_TRACK_INTAKE: Record<
  BuyerTrackParam,
  { orgType: string; matterType: string; label: string }
> = {
  foundations: {
    label: 'Philanthropy & foundations',
    orgType: 'Foundation / philanthropy',
    matterType: 'Internal deliberation / decision memo',
  },
  peacebuilding: {
    label: 'Peacebuilding & mediation',
    orgType: 'Peacebuilding / Track II',
    matterType: 'Peacebuilding / cross-party dialogue',
  },
  hr: {
    label: 'HR, compliance & ombuds',
    orgType: 'HR / compliance / ombuds',
    matterType: 'HR / ombuds inquiry',
  },
};

/**
 * Three primary tracks — identical anatomy:
 * sector · title · problem · three friction bullets · approved record · outcome · CTA
 */
export const primaryUseCases: UseCaseCardProps[] = [
  {
    id: 'philanthropy',
    track: 'foundations',
    sector: 'Philanthropy & foundations',
    title: 'Board and grantee deliberation under scrutiny',
    context:
      'Contested funding or governance questions draw scrutiny. Informal notes and forwarded threads become the story.',
    fitSignal: 'Typically 5–8 principals; hard ceiling 12',
    bullets: [
      'Email threads sprawl beyond the intended circle',
      'Chat leaves discoverable trails with no release authority',
      'Informal notes cannot be cited with integrity',
    ],
    releasedRecord:
      'Decision memo or principles statement. Privately anchored by default; dialogue and attribution stay inside.',
    whySquadridge: 'Boards and funders get process evidence without publishing the deliberation.',
    ctaLabel: 'Request a foundations pilot',
    ctaHref: '/request-access?track=foundations',
  },
  {
    id: 'peacebuilding',
    track: 'peacebuilding',
    sector: 'Peacebuilding & mediation',
    title: 'High-stakes mediation with a releasable agreement',
    context:
      'Attribution-sensitive parties need structured written dialogue. Institutions still need an outcome they can cite.',
    fitSignal: 'Recommended 4–8 parties; hard ceiling 12',
    bullets: [
      'Open chat and shared docs collapse privacy and process control',
      'Transcripts become weapons between parties',
      'Verbal sessions leave no verifiable instrument institutions can cite',
    ],
    releasedRecord:
      'Joint statement or agreement text with an integrity anchor — not room dialogue.',
    whySquadridge: 'Parties stay protected; institutions get a citable approved record.',
    ctaLabel: 'Request a peacebuilding pilot',
    ctaHref: '/request-access?track=peacebuilding',
  },
  {
    id: 'hr-compliance',
    track: 'hr',
    sector: 'HR, compliance & ombuds',
    title: 'Sensitive workplace or institutional inquiry',
    context:
      'Fact-finding without exposing contributors or creating a discoverable transcript that invites retaliation.',
    fitSignal: 'Typically 4–7 contributors + facilitator; hard ceiling 12',
    bullets: [
      'Tickets and email create sprawling trails',
      'Anonymous forms lack facilitator process control',
      'Open docs invite oversharing and discovery risk',
    ],
    releasedRecord:
      'Findings or ombuds summary — conclusions only. Individual accounts stay inside.',
    whySquadridge: 'Contributors can speak; only approved conclusions leave.',
    ctaLabel: 'Request an HR pilot',
    ctaHref: '/request-access?track=hr',
  },
];

/** Adjacent contexts — lighter extension, not a second track system. */
export const secondaryUseCases: SecondaryUseCaseProps[] = [
  {
    id: 'ngos',
    sector: 'NGOs & civil society',
    title: 'Sensitive internal deliberation',
    scenario:
      'Contested advocacy or partner decisions without putting staff or community members at risk if notes leak.',
    ctaLabel: 'Request pilot access',
    ctaHref: '/request-access?track=foundations',
  },
  {
    id: 'corporations',
    sector: 'Corporations & executive teams',
    title: 'Board and C-suite conflict under confidentiality',
    scenario:
      'High-stakes internal disputes where email CC chains create liability about what was decided.',
    ctaLabel: 'Request pilot access',
    ctaHref: '/request-access?track=hr',
  },
];

/** Flat list for landing teasers and deep links (primary first, then secondary). */
export const useCases: UseCaseCardProps[] = [
  ...primaryUseCases,
  ...secondaryUseCases.map((s) => ({
    id: s.id,
    sector: s.sector,
    title: s.title,
    context: s.scenario,
    bullets: [] as string[],
    releasedRecord: 'Approved outcome only — dialogue stays inside.',
    ctaLabel: s.ctaLabel,
    ctaHref: s.ctaHref,
  })),
];
