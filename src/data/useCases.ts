import type { UseCaseCardProps, SecondaryUseCaseProps } from '../components/shared/UseCaseCard';

/** Shared process spine — shown once at page level, echoed lightly in each lane. */
export const USE_CASE_ARCHITECTURE_LINE = 'Private room → facilitator gate → approved record';

export const USE_CASE_PROCESS_TIE_IN =
  'Private session rooms · facilitator-governed release · approved outcomes only.';

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

/** Three equal primary buyer tracks — same visual weight on /use-cases. */
export const primaryUseCases: UseCaseCardProps[] = [
  {
    id: 'philanthropy',
    track: 'foundations',
    sector: 'Philanthropy & Foundations',
    title: 'Board and grantee deliberation under scrutiny.',
    context:
      'Contested funding or governance questions draw public and political scrutiny — informal notes and forwarded threads become the story.',
    ordinaryToolsFail: [
      'Email threads sprawl and get forwarded beyond the intended circle',
      'Chat channels create discoverable trails with no release authority',
      'Video calls leave informal notes that cannot be cited with integrity',
    ],
    processChange: [
      'Verified participants deliberate in a facilitator-led written room',
      'Positions and dissent stay inside; the facilitator holds the release gate',
      'Only an approved decision memo can leave the room',
    ],
    processTieIn: USE_CASE_PROCESS_TIE_IN,
    releasedRecord:
      'An approved decision memo or principles statement — privately anchored or optionally public — with a short verification anchor. Dialogue and attribution stay off the record. Full integrity detail lives on Ledger and Security.',
    whySquadridge:
      'Funders and boards get process evidence without publishing the deliberation that produced it.',
    ctaLabel: 'Request a foundations pilot',
    ctaHref: '/request-access?track=foundations',
  },
  {
    id: 'peacebuilding',
    track: 'peacebuilding',
    sector: 'Peacebuilding & Mediation',
    title: 'High-stakes mediation with a releasable agreement.',
    context:
      'Attribution-sensitive parties need structured written dialogue without collapsing a fragile process — institutions still need a credible outcome they can cite.',
    ordinaryToolsFail: [
      'Open chat and shared docs collapse privacy and process control',
      'Transcripts become weapons between parties',
      'Verbal sessions leave no verifiable instrument institutions can cite',
    ],
    processChange: [
      'Structured written rounds under facilitator control',
      'Each party responds at its own pace — no faces, voices, or auto-exported transcripts',
      'Designated parties approve what may leave; the facilitator signs off release',
    ],
    processTieIn: USE_CASE_PROCESS_TIE_IN,
    releasedRecord:
      'A joint statement or agreement text — released only on facilitator sign-off — with a short integrity anchor, not room dialogue. Crypto and verification detail live on Ledger and Security.',
    whySquadridge:
      'A protected room for parties and a verifiable record for institutions — without exposing who said what.',
    recordSampleId: 'SQR-2024-0147',
    ctaLabel: 'Request a peacebuilding pilot',
    ctaHref: '/request-access?track=peacebuilding',
  },
  {
    id: 'hr-compliance',
    track: 'hr',
    sector: 'HR, Compliance & Ombuds',
    title: 'Sensitive workplace or institutional inquiry.',
    context:
      'Ombuds, HR, or compliance leads need structured fact-finding without exposing contributors or creating a discoverable transcript that invites retaliation.',
    ordinaryToolsFail: [
      'Ticket systems and email produce sprawling, discoverable trails',
      'Anonymous forms lack facilitator process control',
      'Open docs invite oversharing and discovery risk',
    ],
    processChange: [
      'Verified contributors submit written accounts in structured rounds',
      'The investigator facilitates; contributors are verified by role, not named on the record',
      'Only approved conclusions can leave the room',
    ],
    processTieIn: USE_CASE_PROCESS_TIE_IN,
    releasedRecord:
      'An approved findings or ombuds summary — conclusions only — optionally anchored for integrity. Individual accounts stay inside the room. Verification detail lives on Ledger and Security.',
    whySquadridge:
      'Contributors speak without creating a weaponizable transcript; investigators release only approved conclusions.',
    ctaLabel: 'Request an HR pilot',
    ctaHref: '/request-access?track=hr',
  },
];

/** Secondary contexts — calm treatment below the three primary tracks. */
export const secondaryUseCases: SecondaryUseCaseProps[] = [
  {
    id: 'ngos',
    sector: 'NGOs & civil society',
    title: 'Sensitive internal deliberation',
    scenario:
      'An NGO works through a contested advocacy or partner decision without putting staff or community members at risk if notes leak.',
    sameProcessAs: 'Foundations',
    sameProcessContext: 'civil-society internal deliberation and decision memos',
    ctaLabel: 'Request pilot access',
    ctaHref: '/request-access?track=foundations',
  },
  {
    id: 'corporations',
    sector: 'Corporations & executive teams',
    title: 'Board and C-suite conflict under confidentiality',
    scenario:
      'A board or executive team resolves a high-stakes internal dispute where email CC chains create liability and confusion about what was decided.',
    sameProcessAs: 'HR',
    sameProcessContext: 'institutional inquiry and executive confidentiality',
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
    ordinaryToolsFail: [] as string[],
    processChange: [] as string[],
    releasedRecord: `Uses the same process as ${s.sameProcessAs} for ${s.sameProcessContext}.`,
    ctaLabel: s.ctaLabel,
    ctaHref: s.ctaHref,
  })),
];
