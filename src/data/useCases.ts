import type { UseCaseCardProps, SecondaryUseCaseProps } from '../components/shared/UseCaseCard';

/** Shared process spine — shown once at page level via the backbone illustration. */
export const USE_CASE_ARCHITECTURE_LINE = 'Private room → facilitator gate → approved record';

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
    bullets: [
      'Open chat and shared docs collapse privacy and process control',
      'Transcripts become weapons between parties',
      'Verbal sessions leave no verifiable instrument institutions can cite',
    ],
    releasedRecord:
      'Joint statement or agreement text with an integrity anchor — not room dialogue.',
    whySquadridge: 'Parties stay protected; institutions get a citable approved record.',
    recordSampleId: 'SQR-2024-0147',
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
    sameProcessAs: 'Foundations',
    ctaLabel: 'Request pilot access',
    ctaHref: '/request-access?track=foundations',
  },
  {
    id: 'corporations',
    sector: 'Corporations & executive teams',
    title: 'Board and C-suite conflict under confidentiality',
    scenario:
      'High-stakes internal disputes where email CC chains create liability about what was decided.',
    sameProcessAs: 'HR',
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
    releasedRecord: `Same spine as ${s.sameProcessAs}.`,
    ctaLabel: s.ctaLabel,
    ctaHref: s.ctaHref,
  })),
];
