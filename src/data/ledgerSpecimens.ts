/**
 * Canonical illustrative ledger specimens — shared by homepage, ledger index, and detail pages.
 * Live published entries use API data; specimens normalize fallback/illustrative paths only.
 */

export type LedgerSpecimenType = 'illustrative' | 'demo' | 'live';
export type LedgerSpecimenStatus = 'anchor-verified' | 'pending' | 'superseded';
export type LedgerSpecimenVisibility = 'public';

export interface LedgerSpecimenMetadata {
  processType?: string;
  recordType?: string;
  releaseMode?: string;
  verifiedPartyCount?: number;
}

export interface LedgerSpecimen {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  organisation: string;
  /** ISO date YYYY-MM-DD */
  releasedAt: string;
  /** Formatted Month DD, YYYY */
  displayDate: string;
  participantCount: number;
  verificationAnchor: string;
  anchorShort: string;
  visibility: LedgerSpecimenVisibility;
  specimenType: LedgerSpecimenType;
  status: LedgerSpecimenStatus;
  category: string;
  region?: string;
  summary: string;
  approvedText: string[];
  neverPublic: string[];
  metadata: LedgerSpecimenMetadata;
}

export type StatusChipKind =
  | 'illustrative'
  | 'published'
  | 'anchor-verified'
  | 'record-id'
  | 'pending'
  | 'superseded';

export interface StatusChip {
  kind: StatusChipKind;
  label: string;
}

/** Format a catalog ID as SQR-YYYY-NNNN when already canonical; otherwise pass through. */
export function formatRecordId(id: string): string {
  const trimmed = id.trim();
  if (/^SQR-\d{4}-\d{4}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return trimmed;
}

/** Format an ISO date (or Date) as Month DD, YYYY. */
export function formatDisplayDate(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? new Date(`${isoOrDate}T12:00:00Z`) : isoOrDate;
  if (Number.isNaN(d.getTime())) return String(isoOrDate);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Chip order: ILLUSTRATIVE|PUBLISHED → anchor status → RECORD ID
 * (then pending/superseded variants). ID appears once — top chip only.
 * Specimens must not reuse the live “Anchor verified” label — that reads as a
 * real integrity check; use an honest non-verifiable specimen chip instead.
 */
export function getStatusChips(
  specimen: Pick<LedgerSpecimen, 'id' | 'specimenType' | 'status'>,
): StatusChip[] {
  const chips: StatusChip[] = [];
  const isSpecimen = specimen.specimenType === 'illustrative' || specimen.specimenType === 'demo';

  if (isSpecimen) {
    chips.push({ kind: 'illustrative', label: 'Illustrative' });
  } else if (specimen.specimenType === 'live') {
    chips.push({ kind: 'published', label: 'Published' });
  }

  if (specimen.status === 'anchor-verified') {
    chips.push(
      isSpecimen
        ? { kind: 'illustrative', label: 'Specimen (not verifiable)' }
        : { kind: 'anchor-verified', label: 'Anchor verified' },
    );
  } else if (specimen.status === 'pending') {
    chips.push({ kind: 'pending', label: 'Pending' });
  } else if (specimen.status === 'superseded') {
    chips.push({ kind: 'superseded', label: 'Superseded' });
  }

  chips.push({ kind: 'record-id', label: formatRecordId(specimen.id) });
  return chips;
}

/** Shorten a hex anchor to `abcd…wxyz` (4 + ellipsis + 4). */
export function truncateAnchor(anchor: string, head = 4, tail = 4): string {
  const clean = anchor.replace(/^sha256:/i, '').trim();
  if (clean.length <= head + tail + 1) return clean;
  return `${clean.slice(0, head)}…${clean.slice(-tail)}`;
}

/** Metadata field order for short cards: ORGANISATION → RELEASED → PARTICIPANTS → ANCHOR */
export const SPECIMEN_CARD_META_ORDER = [
  'organisation',
  'released',
  'participants',
  'anchor',
] as const;

/** Legacy specimen IDs → current catalog IDs (deep links / bookmarks). */
const SPECIMEN_ID_ALIASES: Record<string, string> = {
  'rec-002': 'SQR-2024-0203',
  'rec-003': 'SQR-2024-0118',
  'rec-004': 'SQR-2023-1209',
  'SQR-2024-0147': 'SQR-2024-0147',
};

/**
 * Canonical illustrative catalog — coherent SQR-YYYY-NNNN series.
 * Homepage primary: SQR-2026-0312.
 */
export const ledgerSpecimens: LedgerSpecimen[] = [
  {
    id: 'SQR-2026-0312',
    slug: 'community-safety-coordination-q1-action-commitments',
    title: 'Community Safety Coordination — Q1 Action Commitments',
    organisation: 'Regional Mediation Centre',
    releasedAt: '2026-03-12',
    displayDate: 'March 12, 2026',
    participantCount: 12,
    verificationAnchor: '7c3a91d7b4e6f8aa2d91e91f',
    anchorShort: '7c3a…e91f',
    visibility: 'public',
    specimenType: 'illustrative',
    status: 'anchor-verified',
    category: 'community coordination',
    region: 'Pacific Northwest (illustrative)',
    summary:
      'Three prioritized interventions agreed across participating organizations: expanded youth programming, a shared referral protocol, and neighborhood listening sessions with documented follow-up themes.',
    approvedText: [
      'Expanded youth evening programming within 90 days.',
      'Shared cross-agency referral protocol within 60 days.',
      'Neighborhood listening sessions with documented follow-up themes within 45 days.',
      'Support counts informed prioritization; individual attribution does not appear here.',
      'Room dialogue remains private to authorized participants and facilitators.',
    ],
    neverPublic: [
      'Session transcript or chat history',
      'Participant identities or private contact details',
      'Unapproved drafts or internal facilitator notes',
      'Anonymity guarantees or Signal-grade E2E claims',
    ],
    metadata: {
      processType: 'City community safety coordination',
      recordType: 'Action Commitments Record',
      releaseMode: 'Facilitator-governed · no auto-publish',
      verifiedPartyCount: 12,
    },
  },
  {
    id: 'SQR-2024-0147',
    slug: 'community-land-use-joint-statement-of-principles',
    title: 'Community Land Use — Joint Statement of Principles',
    organisation: 'Regional Mediation Centre',
    releasedAt: '2024-03-14',
    displayDate: 'March 14, 2024',
    participantCount: 12,
    verificationAnchor: 'a3f9c1e8b2d47f0e56ac12309de1f783c8ab4521d7e63f901234bcde5678ef90',
    anchorShort: 'a3f9…ef90',
    visibility: 'public',
    specimenType: 'illustrative',
    status: 'anchor-verified',
    category: 'land use',
    region: 'Northern watershed (illustrative)',
    summary:
      'Agreement reached on three core principles governing future land-use consultations in the northern watershed region.',
    approvedText: [
      'Future land-use decisions in the consultation area require structured stakeholder consultation first.',
      'An independent environmental monitoring body will be established within 120 days.',
      'A formal six-month implementation review will be facilitated by a mutually agreed mediator.',
      'This statement records agreed principles; it is not itself a binding contract.',
      'The dialogue that produced this text remains confidential to participating parties.',
    ],
    neverPublic: [
      'Room transcript or intermediate drafts',
      'Who said what inside the session',
      'Legal privilege or whistleblower-grade protection claims',
      'Full platform zero-knowledge or Signal-grade E2E',
    ],
    metadata: {
      processType: 'Mediation & dispute resolution',
      recordType: 'Joint Statement of Principles',
      releaseMode: 'Facilitator-governed · no auto-publish',
      verifiedPartyCount: 12,
    },
  },
  {
    id: 'SQR-2024-0203',
    slug: 'urban-housing-policy-consensus-principles',
    title: 'Urban Housing Policy — Consensus Principles',
    organisation: 'City Planning Consortium',
    releasedAt: '2024-02-03',
    displayDate: 'February 3, 2024',
    participantCount: 9,
    verificationAnchor: 'b7e2d4f1a9c38e5d60f71234ab89cde0f1a2b3c4d5e6f7890abcdef12345678',
    anchorShort: 'b7e2…5678',
    visibility: 'public',
    specimenType: 'illustrative',
    status: 'anchor-verified',
    category: 'housing policy',
    region: 'Western Europe',
    summary: 'Consensus principles for stakeholder consultation on urban housing policy revisions.',
    approvedText: [
      'Mandatory written consultation before tenant-protection policy revisions.',
      'Consultation periods no shorter than 45 days for verified stakeholder groups.',
      'Neutral facilitator required when more than two stakeholder categories are involved.',
      'Only approved outcome text is public; session dialogue stays private.',
    ],
    neverPublic: [
      'Transcripts, identities, or unapproved drafts',
      'Automated or timed publication',
    ],
    metadata: {
      processType: 'Institutional inquiry / policy consultation',
      recordType: 'Consensus Summary',
      releaseMode: 'Facilitator-governed · no auto-publish',
      verifiedPartyCount: 9,
    },
  },
  {
    id: 'SQR-2024-0118',
    slug: 'coastal-zone-dialogue-working-principles',
    title: 'Coastal Zone Dialogue — Working Principles',
    organisation: 'Coastal Authority',
    releasedAt: '2024-01-18',
    displayDate: 'January 18, 2024',
    participantCount: 7,
    verificationAnchor: 'c8f3e5a2b0d49f6e71a82345bc90def1a2b3c4d5e6f7890abcdef1234567890',
    anchorShort: 'c8f3…7890',
    visibility: 'public',
    specimenType: 'illustrative',
    status: 'anchor-verified',
    category: 'coastal management',
    region: 'East Asia',
    summary: 'Working principles for coastal zone management agreed through facilitated dialogue.',
    approvedText: [
      'Cross-party review required for coastal environmental impact assessments.',
      'Fishing community representatives have standing to submit written concerns.',
      'Twelve-month facilitated written checkpoint for implementation review.',
      'The session that produced this record is not public.',
    ],
    neverPublic: ['Transcript', 'Participant list', 'Internal drafts'],
    metadata: {
      processType: 'Restorative / multi-party dialogue',
      recordType: 'Working Principles',
      releaseMode: 'Facilitator-governed · no auto-publish',
      verifiedPartyCount: 7,
    },
  },
  {
    id: 'SQR-2023-1209',
    slug: 'regional-trade-framework-recommendation',
    title: 'Regional Trade Framework — Recommendation',
    organisation: 'Trade Facilitation Office',
    releasedAt: '2023-12-09',
    displayDate: 'December 9, 2023',
    participantCount: 15,
    verificationAnchor: 'd9a4f6b3c1e50a7f82b93456cd01ef2a3b4c5d6e7f8901abcdef2345678901ab',
    anchorShort: 'd9a4…01ab',
    visibility: 'public',
    specimenType: 'illustrative',
    status: 'anchor-verified',
    category: 'trade facilitation',
    region: 'South-East Asia',
    summary:
      'Formal recommendation on trade facilitation measures following structured party consultation.',
    approvedText: [
      'Single-window clearance pilot at two border crossings within 180 days.',
      'Structured written dispute process for customs delays before arbitration.',
      'Verified implementation checkpoints at six-month intervals.',
      'Deliberation content is not published.',
    ],
    neverPublic: [
      'Room dialogue',
      'Identity disclosure',
      'Claims of full platform zero-knowledge or Signal-grade E2E',
    ],
    metadata: {
      processType: 'Regional consultation',
      recordType: 'Formal Recommendation',
      releaseMode: 'Facilitator-governed · no auto-publish',
      verifiedPartyCount: 15,
    },
  },
];

export const homepageSpecimen = ledgerSpecimens[0];

export function getSpecimenById(id: string): LedgerSpecimen | undefined {
  const resolved = SPECIMEN_ID_ALIASES[id] ?? id;
  return ledgerSpecimens.find((s) => s.id === resolved || s.slug === resolved);
}

export function getSpecimenBySlug(slug: string): LedgerSpecimen | undefined {
  return ledgerSpecimens.find((s) => s.slug === slug);
}
