import type { RecordCardProps } from '../components/shared/RecordCard';

export interface LedgerRecordDetail extends RecordCardProps {
  region: string;
  sessionDate: string;
  releasedDate: string;
  outcomeType: string;
  verificationAnchor: string;
  body: string;
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
    id: 'rec-002',
    title: 'Urban Housing Policy — Consensus Principles',
    summary: 'Consensus principles for stakeholder consultation on urban housing policy revisions.',
    org: 'City Planning Consortium',
    date: 'February 3, 2024',
    participantCount: 9,
    variant: 'sample',
    anchorStatus: 'verified',
  },
  {
    id: 'rec-003',
    title: 'Coastal Zone Dialogue — Working Principles',
    summary: 'Working principles for coastal zone management agreed through facilitated dialogue.',
    org: 'Coastal Authority',
    date: 'January 18, 2024',
    participantCount: 7,
    variant: 'sample',
    anchorStatus: 'verified',
  },
  {
    id: 'rec-004',
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

const DETAIL_EXTENSIONS: Record<string, Omit<LedgerRecordDetail, keyof RecordCardProps>> = {
  'SQR-2026-0312': {
    region: 'Pacific Northwest (illustrative)',
    sessionDate: 'March 10, 2026',
    releasedDate: 'March 12, 2026',
    outcomeType: 'Action Commitments Record',
    verificationAnchor: '8f3a91c2e4b56d0f71ac23409de1f783c8ab4521d7e63f901234bcde5678ef90',
    body: `ACTION COMMITMENTS RECORD — COMMUNITY SAFETY COORDINATION
Municipal Community Safety Office — March 12, 2026

The following commitments were agreed by verified organizational representatives participating in a facilitator-led coordination session. Support counts informed prioritization; individual attribution does not appear on this record.

1. Expanded youth evening programming — Youth services partner (90 days)

2. Shared cross-agency referral protocol — Multi-party (60 days)

3. Neighborhood listening sessions with documented follow-up themes — Community coalition (45 days)

This record documents approved commitments and limited metadata only. Session room dialogue is not published. SquadRidge is not a surveillance or monitoring product.`,
  },
  'SQR-2024-0147': {
    region: 'Sub-Saharan Africa',
    sessionDate: 'March 14, 2024',
    releasedDate: 'March 18, 2024',
    outcomeType: 'Joint Statement',
    verificationAnchor: 'a3f9c1e8b2d47f0e56ac12309de1f783c8ab4521d7e63f901234bcde5678ef90',
    body: `JOINT STATEMENT OF PRINCIPLES
Community Land Use Consultation — March 14, 2024

The following principles were agreed by representatives participating in a facilitated dialogue convened under the SquadRidge platform and certified by Regional Mediation Centre.

1. All future land-use decisions affecting the designated consultation area will require structured stakeholder consultation prior to any planning authority submission.

2. An independent environmental monitoring body will be established within 120 days, with representation drawn from participating community organisations.

3. The parties commit to a formal review of implementation progress at six months, to be facilitated by a mutually agreed mediator.

4. This statement constitutes a record of agreed principles and does not carry the force of a legally binding contract unless formalised separately by the relevant parties.

This record was produced through a structured, facilitated process. The dialogue that produced this text remains permanently confidential to the participating parties.`,
  },
  'rec-002': {
    region: 'Western Europe',
    sessionDate: 'February 3, 2024',
    releasedDate: 'February 7, 2024',
    outcomeType: 'Consensus Summary',
    verificationAnchor: 'b7e2d4f1a9c38e5d60f71234ab89cde0f1a2b3c4d5e6f7890abcdef12345678',
    body: `CONSENSUS PRINCIPLES — URBAN HOUSING POLICY
City Planning Consortium — February 3, 2024

The parties agree to the following principles governing future stakeholder consultation on urban housing policy revisions:

1. All policy revisions affecting tenant protections will include a mandatory written consultation phase before submission to the planning authority.

2. Consultation periods will be no shorter than 45 days, with structured written submissions accepted from verified stakeholder groups.

3. A neutral facilitator will be appointed for any consultation involving more than two stakeholder categories.

This record reflects approved outcome text only. Session dialogue remains private to participants.`,
  },
  'rec-003': {
    region: 'East Asia',
    sessionDate: 'January 18, 2024',
    releasedDate: 'January 22, 2024',
    outcomeType: 'Working Principles',
    verificationAnchor: 'c8f3e5a2b0d49f6e71a82345bc90def1a2b3c4d5e6f7890abcdef1234567890',
    body: `WORKING PRINCIPLES — COASTAL ZONE MANAGEMENT
Coastal Authority — January 18, 2024

Representatives from participating organisations agree to the following working principles for coastal zone management:

1. Environmental impact assessments for coastal development will require cross-party review before approval.

2. Fishing community representatives will have standing to submit written concerns during any consultation period.

3. Implementation will be reviewed at twelve months through a facilitated written checkpoint.

The session that produced this record is not public. Only this approved outcome text has been released.`,
  },
  'rec-004': {
    region: 'South-East Asia',
    sessionDate: 'December 9, 2023',
    releasedDate: 'December 14, 2023',
    outcomeType: 'Formal Recommendation',
    verificationAnchor: 'd9a4f6b3c1e50a7f82b93456cd01ef2a3b4c5d6e7f8901abcdef2345678901ab',
    body: `FORMAL RECOMMENDATION — REGIONAL TRADE FRAMEWORK
Trade Facilitation Office — December 9, 2023

The parties recommend the following measures for regional trade facilitation:

1. A single-window clearance pilot will be established at two designated border crossings within 180 days.

2. Dispute resolution for customs delays will follow a structured written process before escalation to arbitration.

3. Progress will be reported through verified implementation checkpoints at six-month intervals.

This recommendation was approved by all designated parties before release. Deliberation content is not published.`,
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
  return sampleRecordDetails.find((r) => r.id === id);
}

/** Primary sample shown on the homepage preview. */
export const homepageSampleRecord = sampleRecords[0];
