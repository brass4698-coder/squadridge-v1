/**
 * Ledger record detail layer — builds on canonical LedgerSpecimen data.
 * Prefer importing specimens from `ledgerSpecimens.ts` for card/list surfaces.
 */
import type { RecordCardProps } from '../components/shared/RecordCard';
import {
  getSpecimenById,
  homepageSpecimen,
  ledgerSpecimens,
  type LedgerSpecimen,
} from './ledgerSpecimens';

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

function specimenToCard(s: LedgerSpecimen): RecordCardProps {
  return {
    id: s.id,
    title: s.title,
    summary: s.summary,
    org: s.organisation,
    date: s.displayDate,
    participantCount: s.participantCount,
    variant: s.specimenType === 'live' ? 'live' : 'sample',
    anchorStatus: s.status === 'anchor-verified' ? 'verified' : 'withdrawn',
    verificationAnchor: s.verificationAnchor,
    anchorShort: s.anchorShort,
  };
}

/** Instrument body text for dossier pages (approved paragraphs joined). */
function buildInstrumentBody(s: LedgerSpecimen): string {
  const recordType = (s.metadata.recordType ?? 'Released outcome').toUpperCase();
  const lines = [
    `${recordType}`,
    `${s.organisation} — ${s.displayDate}`,
    '',
    'The following was approved for release by the designated facilitator after recorded party confirmations. It documents approved commitments and limited metadata only.',
    '',
    ...s.approvedText.map((t, i) => `${i + 1}. ${t}`),
    '',
    'Certification',
    'This text was approved for release by the designated facilitator after recorded party confirmations.',
    '',
    'Boundaries',
    'This record is not a transcript. It is not a public participant list. It is not automatically a legally binding instrument unless separately formalized by the relevant parties under applicable law.',
  ];
  return lines.join('\n');
}

const RELATED: Record<string, RelatedLedgerRecord[]> = {
  'SQR-2026-0312': [
    {
      id: 'SQR-2024-0147',
      title: 'Community Land Use — Joint Statement of Principles',
      relation: 'Related regional consultation context',
    },
  ],
  'SQR-2024-0147': [
    {
      id: 'SQR-2026-0312',
      title: 'Community Safety Coordination — Q1 Action Commitments',
      relation: 'Adjacent public-trust coordination record',
    },
  ],
};

const PROCESS_NOTES: Record<string, string> = {
  'SQR-2026-0312':
    'Produced in a private written session under facilitator-governed pacing. Parties verified privately before joining. Release required deliberate approval; nothing auto-published. Only this approved outcome text and limited metadata left the room.',
  'SQR-2024-0147':
    'This text came from a facilitated, text-based dialogue inside a private session room. Identity was verified privately. Release was a deliberate facilitator action after recorded approvals — not timed or automated.',
  'SQR-2024-0203':
    'Structured written rounds inside a private room; facilitator controlled pacing and release. Public trust comes from approved release plus verification — not from publishing the conversation.',
  'SQR-2024-0118':
    'Facilitator-governed written session with invite-only verified participants. Release gate prevented premature exposure; only approved text reached the ledger.',
  'SQR-2023-1209':
    'Private written mediation infrastructure: room stays private; gate requires approval; record carries a verification anchor for integrity without disclosing the session.',
};

const SCOPE_CONFIRMS: Record<string, string[]> = {
  'SQR-2026-0312': [
    'That an approved outcome text was released on the stated date',
    'That a verification anchor binds this released instrument',
    'That the releasing body and process type are as stated',
  ],
  'SQR-2024-0147': [
    'Approved principles text and releasing organisation',
    'Integrity of the released payload via verification anchor',
    'Process type and release date as metadata',
  ],
  'SQR-2024-0203': [
    'Consensus principles as approved for release',
    'Verification anchor for integrity checking',
  ],
  'SQR-2024-0118': [
    'Working principles and releasing authority',
    'Integrity anchor for the released text',
  ],
  'SQR-2023-1209': [
    'Formal recommendation text as released',
    'Verification anchor and releasing office',
  ],
};

function specimenToDetail(s: LedgerSpecimen): LedgerRecordDetail {
  const sessionIso = s.releasedAt;
  return {
    ...specimenToCard(s),
    region: s.region ?? 'As recorded',
    sessionDate: s.displayDate,
    releasedDate: s.displayDate,
    outcomeType: s.metadata.recordType ?? 'Released outcome record',
    processType: s.metadata.processType ?? 'Facilitated written session',
    visibilityClass: 'Public release',
    verificationAnchor: s.verificationAnchor,
    generatedAt: `${sessionIso}T18:00:00Z`,
    outcomeSummary: s.approvedText,
    body: buildInstrumentBody(s),
    processNote:
      PROCESS_NOTES[s.id] ??
      'Produced in a private written session. Release required deliberate facilitator approval after recorded confirmations.',
    scopeConfirms: SCOPE_CONFIRMS[s.id] ?? [
      'That approved outcome text was released',
      'That a verification anchor binds this instrument',
    ],
    scopeDoesNot: s.neverPublic,
    relatedRecords: RELATED[s.id] ?? [],
  };
}

/** @deprecated Prefer `ledgerSpecimens` — kept for existing card consumers. */
export const sampleRecords: RecordCardProps[] = ledgerSpecimens.map(specimenToCard);

export const sampleRecordDetails: LedgerRecordDetail[] = ledgerSpecimens.map(specimenToDetail);

export function getSampleRecordById(id: string): LedgerRecordDetail | undefined {
  const specimen = getSpecimenById(id);
  if (!specimen) return undefined;
  return specimenToDetail(specimen);
}

/** Primary sample shown on the homepage preview. */
export const homepageSampleRecord = specimenToCard(homepageSpecimen);

export type { LedgerSpecimen };
export {
  formatDisplayDate,
  formatRecordId,
  getStatusChips,
  getSpecimenById,
  homepageSpecimen,
  ledgerSpecimens,
  truncateAnchor,
} from './ledgerSpecimens';
