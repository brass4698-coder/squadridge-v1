import type { RecordCardProps } from '../components/shared/RecordCard';

export type RelatedLedgerRecord = {
  id: string;
  title: string;
  relation: string;
};

export interface LedgerRecordDetail extends RecordCardProps {
  region: string;
  sessionDate: string;
  releasedDate: string;
  outcomeType: string;
  processType: string;
  visibilityClass: 'Public release' | 'Internal-only (illustrative public format)';
  verificationAnchor: string;
  generatedAt: string;
  /** Scanable 3–5 bullets above the full approved text */
  outcomeSummary: string[];
  body: string;
  processNote: string;
  scopeConfirms: string[];
  scopeDoesNot: string[];
  relatedRecords: RelatedLedgerRecord[];
}

export const sampleRecords: RecordCardProps[] = [
  {
    id: 'SQR-2024-0147',
    title: 'Community Land Use — Joint Statement of Principles',
    summary:
      'Agreement reached on three core principles governing future land-use consultations in the northern watershed region.',
    org: 'Regional Mediation Centre',
    date: 'March 14, 2024',
    participantCount: 12,
    variant: 'sample',
    anchorStatus: 'verified',
  },
  {
    id: 'SQR-2026-0312',
    title: 'Community Safety Coordination — Q1 Action Commitments',
    summary:
      'Three prioritized interventions agreed across participating organizations: expanded youth programming, a shared referral protocol, and neighborhood listening sessions with documented follow-up themes.',
    org: 'Municipal Community Safety Office',
    date: 'March 12, 2026',
    participantCount: 5,
    variant: 'sample',
    anchorStatus: 'verified',
  },
  {
    id: 'SQR-2024-0203',
    title: 'Urban Housing Policy — Consensus Principles',
    summary: 'Consensus principles for stakeholder consultation on urban housing policy revisions.',
    org: 'City Planning Consortium',
    date: 'February 3, 2024',
    participantCount: 9,
    variant: 'sample',
    anchorStatus: 'verified',
  },
  {
    id: 'SQR-2024-0118',
    title: 'Coastal Zone Dialogue — Working Principles',
    summary: 'Working principles for coastal zone management agreed through facilitated dialogue.',
    org: 'Coastal Authority',
    date: 'January 18, 2024',
    participantCount: 7,
    variant: 'sample',
    anchorStatus: 'verified',
  },
  {
    id: 'SQR-2023-1209',
    title: 'Regional Trade Framework — Recommendation',
    summary:
      'Formal recommendation on trade facilitation measures following structured party consultation.',
    org: 'Trade Facilitation Office',
    date: 'December 9, 2023',
    participantCount: 15,
    variant: 'sample',
    anchorStatus: 'verified',
  },
];

/** Legacy specimen IDs → current catalog IDs (deep links / bookmarks). */
const SAMPLE_ID_ALIASES: Record<string, string> = {
  'rec-002': 'SQR-2024-0203',
  'rec-003': 'SQR-2024-0118',
  'rec-004': 'SQR-2023-1209',
};

const DETAIL_EXTENSIONS: Record<string, Omit<LedgerRecordDetail, keyof RecordCardProps>> = {
  'SQR-2026-0312': {
    region: 'Pacific Northwest (illustrative)',
    sessionDate: 'March 10, 2026',
    releasedDate: 'March 12, 2026',
    outcomeType: 'Action Commitments Record',
    processType: 'City community safety coordination',
    visibilityClass: 'Public release',
    verificationAnchor: '8f3a91c2e4b56d0f71ac23409de1f783c8ab4521d7e63f901234bcde5678ef90',
    generatedAt: '2026-03-12T18:42:11Z',
    outcomeSummary: [
      'Expanded youth evening programming within 90 days.',
      'Shared cross-agency referral protocol within 60 days.',
      'Neighborhood listening sessions with documented follow-up themes within 45 days.',
      'Support counts informed prioritization; individual attribution does not appear here.',
      'Room dialogue remains private to authorized participants and facilitators.',
    ],
    body: `ACTION COMMITMENTS RECORD — COMMUNITY SAFETY COORDINATION
Municipal Community Safety Office — March 12, 2026

The following commitments were agreed by verified organizational representatives participating in a facilitator-led coordination session. Support counts informed prioritization; individual attribution does not appear on this record.

1. Expanded youth evening programming — Youth services partner (90 days)

2. Shared cross-agency referral protocol — Multi-party (60 days)

3. Neighborhood listening sessions with documented follow-up themes — Community coalition (45 days)

Certification
This text was approved for release by the designated facilitator after recorded party confirmations. It documents approved commitments and limited metadata only.

Boundaries
This record is not a transcript. It is not a public participant list. It is not automatically a legally binding instrument unless separately formalized by the relevant parties under applicable law.`,
    processNote:
      'Produced in a private written session under facilitator-governed pacing. Parties verified privately before joining. Release required deliberate approval; nothing auto-published. Only this approved outcome text and limited metadata left the room.',
    scopeConfirms: [
      'That an approved outcome text was released on the stated date',
      'That a verification anchor binds this released instrument',
      'That the releasing body and process type are as stated',
    ],
    scopeDoesNot: [
      'Session transcript or chat history',
      'Participant identities or private contact details',
      'Unapproved drafts or internal facilitator notes',
      'Anonymity guarantees or Signal-grade E2E claims',
    ],
    relatedRecords: [
      {
        id: 'SQR-2024-0147',
        title: 'Community Land Use — Joint Statement of Principles',
        relation: 'Related regional consultation context',
      },
    ],
  },
  'SQR-2024-0147': {
    region: 'Northern watershed (illustrative)',
    sessionDate: 'March 14, 2024',
    releasedDate: 'March 18, 2024',
    outcomeType: 'Joint Statement of Principles',
    processType: 'Mediation & dispute resolution',
    visibilityClass: 'Public release',
    verificationAnchor: 'a3f9c1e8b2d47f0e56ac12309de1f783c8ab4521d7e63f901234bcde5678ef90',
    generatedAt: '2024-03-18T14:05:00Z',
    outcomeSummary: [
      'Future land-use decisions in the consultation area require structured stakeholder consultation first.',
      'An independent environmental monitoring body will be established within 120 days.',
      'A formal six-month implementation review will be facilitated by a mutually agreed mediator.',
      'This statement records agreed principles; it is not itself a binding contract.',
      'The dialogue that produced this text remains confidential to participating parties.',
    ],
    body: `JOINT STATEMENT OF PRINCIPLES
Community Land Use Consultation — March 14, 2024

The following principles were agreed by representatives participating in a facilitated dialogue convened under the SquadRidge platform and certified by Regional Mediation Centre.

1. All future land-use decisions affecting the designated consultation area will require structured stakeholder consultation prior to any planning authority submission.

2. An independent environmental monitoring body will be established within 120 days, with representation drawn from participating community organisations.

3. The parties commit to a formal review of implementation progress at six months, to be facilitated by a mutually agreed mediator.

4. This statement constitutes a record of agreed principles and does not carry the force of a legally binding contract unless formalised separately by the relevant parties.

Certification
Facilitator certification and party approvals were recorded before release. Only approved outcome text appears here.

Boundaries
Session dialogue is permanently confidential to the participating parties. Participant identities are not disclosed on this public record.`,
    processNote:
      'This text came from a facilitated, text-based dialogue inside a private session room. Identity was verified privately. Release was a deliberate facilitator action after recorded approvals — not timed or automated.',
    scopeConfirms: [
      'Approved principles text and releasing organisation',
      'Integrity of the released payload via verification anchor',
      'Process type and release date as metadata',
    ],
    scopeDoesNot: [
      'Room transcript or intermediate drafts',
      'Who said what inside the session',
      'Legal privilege or whistleblower-grade protection claims',
      'Full platform zero-knowledge or Signal-grade E2E',
    ],
    relatedRecords: [
      {
        id: 'SQR-2026-0312',
        title: 'Community Safety Coordination — Q1 Action Commitments',
        relation: 'Adjacent public-trust coordination record',
      },
    ],
  },
  'SQR-2024-0203': {
    region: 'Western Europe',
    sessionDate: 'February 3, 2024',
    releasedDate: 'February 7, 2024',
    outcomeType: 'Consensus Summary',
    processType: 'Institutional inquiry / policy consultation',
    visibilityClass: 'Public release',
    verificationAnchor: 'b7e2d4f1a9c38e5d60f71234ab89cde0f1a2b3c4d5e6f7890abcdef12345678',
    generatedAt: '2024-02-07T11:20:00Z',
    outcomeSummary: [
      'Mandatory written consultation before tenant-protection policy revisions.',
      'Consultation periods no shorter than 45 days for verified stakeholder groups.',
      'Neutral facilitator required when more than two stakeholder categories are involved.',
      'Only approved outcome text is public; session dialogue stays private.',
    ],
    body: `CONSENSUS PRINCIPLES — URBAN HOUSING POLICY
City Planning Consortium — February 3, 2024

The parties agree to the following principles governing future stakeholder consultation on urban housing policy revisions:

1. All policy revisions affecting tenant protections will include a mandatory written consultation phase before submission to the planning authority.

2. Consultation periods will be no shorter than 45 days, with structured written submissions accepted from verified stakeholder groups.

3. A neutral facilitator will be appointed for any consultation involving more than two stakeholder categories.

Certification
This record reflects approved outcome text only, released after facilitator-governed approvals.

Boundaries
Session dialogue remains private to participants. This instrument does not disclose identities or room content.`,
    processNote:
      'Structured written rounds inside a private room; facilitator controlled pacing and release. Public trust comes from approved release plus verification — not from publishing the conversation.',
    scopeConfirms: [
      'Consensus principles as approved for release',
      'Verification anchor for integrity checking',
    ],
    scopeDoesNot: [
      'Transcripts, identities, or unapproved drafts',
      'Automated or timed publication',
    ],
    relatedRecords: [],
  },
  'SQR-2024-0118': {
    region: 'East Asia',
    sessionDate: 'January 18, 2024',
    releasedDate: 'January 22, 2024',
    outcomeType: 'Working Principles',
    processType: 'Restorative / multi-party dialogue',
    visibilityClass: 'Public release',
    verificationAnchor: 'c8f3e5a2b0d49f6e71a82345bc90def1a2b3c4d5e6f7890abcdef1234567890',
    generatedAt: '2024-01-22T09:15:00Z',
    outcomeSummary: [
      'Cross-party review required for coastal environmental impact assessments.',
      'Fishing community representatives have standing to submit written concerns.',
      'Twelve-month facilitated written checkpoint for implementation review.',
      'The session that produced this record is not public.',
    ],
    body: `WORKING PRINCIPLES — COASTAL ZONE MANAGEMENT
Coastal Authority — January 18, 2024

Representatives from participating organisations agree to the following working principles for coastal zone management:

1. Environmental impact assessments for coastal development will require cross-party review before approval.

2. Fishing community representatives will have standing to submit written concerns during any consultation period.

3. Implementation will be reviewed at twelve months through a facilitated written checkpoint.

Certification
Approved by designated parties before release.

Boundaries
Only this approved outcome text has been released. The session that produced it is not public.`,
    processNote:
      'Facilitator-governed written session with invite-only verified participants. Release gate prevented premature exposure; only approved text reached the ledger.',
    scopeConfirms: [
      'Working principles and releasing authority',
      'Integrity anchor for the released text',
    ],
    scopeDoesNot: ['Transcript', 'Participant list', 'Internal drafts'],
    relatedRecords: [],
  },
  'SQR-2023-1209': {
    region: 'South-East Asia',
    sessionDate: 'December 9, 2023',
    releasedDate: 'December 14, 2023',
    outcomeType: 'Formal Recommendation',
    processType: 'Regional consultation',
    visibilityClass: 'Public release',
    verificationAnchor: 'd9a4f6b3c1e50a7f82b93456cd01ef2a3b4c5d6e7f8901abcdef2345678901ab',
    generatedAt: '2023-12-14T16:40:00Z',
    outcomeSummary: [
      'Single-window clearance pilot at two border crossings within 180 days.',
      'Structured written dispute process for customs delays before arbitration.',
      'Verified implementation checkpoints at six-month intervals.',
      'Deliberation content is not published.',
    ],
    body: `FORMAL RECOMMENDATION — REGIONAL TRADE FRAMEWORK
Trade Facilitation Office — December 9, 2023

The parties recommend the following measures for regional trade facilitation:

1. A single-window clearance pilot will be established at two designated border crossings within 180 days.

2. Dispute resolution for customs delays will follow a structured written process before escalation to arbitration.

3. Progress will be reported through verified implementation checkpoints at six-month intervals.

Certification
This recommendation was approved by all designated parties before release.

Boundaries
Deliberation content is not published. This is approved outcome text and limited metadata only.`,
    processNote:
      'Private written mediation infrastructure: room stays private; gate requires approval; record carries a verification anchor for integrity without disclosing the session.',
    scopeConfirms: [
      'Formal recommendation text as released',
      'Verification anchor and releasing office',
    ],
    scopeDoesNot: [
      'Room dialogue',
      'Identity disclosure',
      'Claims of full platform zero-knowledge or Signal-grade E2E',
    ],
    relatedRecords: [],
  },
};

/** Merge list card props with detail fields for the record detail page. */
export const sampleRecordDetails: LedgerRecordDetail[] = sampleRecords.map((card) => {
  const extra = DETAIL_EXTENSIONS[card.id];
  if (!extra) {
    throw new Error(`Missing ledger detail for sample record ${card.id}`);
  }
  return { ...card, ...extra };
});

export function getSampleRecordById(id: string): LedgerRecordDetail | undefined {
  const resolved = SAMPLE_ID_ALIASES[id] ?? id;
  return sampleRecordDetails.find((r) => r.id === resolved);
}

/** Primary sample shown on the homepage preview. */
export const homepageSampleRecord = sampleRecords[0];
