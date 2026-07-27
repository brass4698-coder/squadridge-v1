import { Link, useParams } from 'react-router-dom';
import { getSampleRecordById, type LedgerRecordDetail } from '../../data/sampleRecords';
import { getSpecimenById, specimenToDocumentFields } from '../../data/ledgerSpecimens';
import { useLedgerRecord } from '../../hooks/useLedger';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  ReleasedRecordDossier,
  type ReleasedRecordDossierProps,
} from '../../components/ledger/ReleasedRecordDossier';
import { MarketingSection, SectionLabel, ShellWidth } from '../../components/shared';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';
import { ledgerEntryToDocumentFields } from '../../lib/ledgerDisplay';

function liveEntryToDossier(entry: NonNullable<ReturnType<typeof useLedgerRecord>['entry']>): {
  record: ReleasedRecordDossierProps['record'];
  citation: string;
} {
  const document = ledgerEntryToDocumentFields(entry);
  const title = entry.session?.title ?? 'Released outcome';
  const releasedDate = document.issuedAtDisplay;
  const year = entry.published_at
    ? new Date(entry.published_at).getFullYear()
    : new Date().getFullYear();
  const body = [entry.summary, entry.agreed_terms, entry.pending_items]
    .filter(Boolean)
    .join('\n\n');
  const summaryBits = [entry.summary, entry.agreed_terms, entry.pending_items]
    .filter(Boolean)
    .map((s) => String(s).split('\n')[0]?.slice(0, 160) ?? '')
    .filter(Boolean)
    .slice(0, 5);

  const citation = `${document.organisation}. (${year}). ${title}. SquadRidge Outcome Ledger. https://squadridge.app/ledger/${entry.id}.`;

  return {
    citation,
    record: {
      id: document.caseReference,
      title,
      org: document.organisation,
      region: 'As recorded',
      releasedDate,
      sessionDate: releasedDate,
      outcomeType: document.templateType,
      processType: entry.session?.conflict_type ?? 'Facilitated written session',
      visibilityClass: document.visibilityLabel,
      verificationAnchor: entry.ledger_sha ?? entry.id,
      generatedAt: entry.published_at ?? new Date().toISOString(),
      outcomeSummary:
        summaryBits.length > 0
          ? summaryBits
          : [
              'Approved outcome text released after facilitator-governed approvals.',
              'Session room dialogue is not public.',
              'Verification anchor binds this released instrument.',
            ],
      body: body || 'Approved outcome text.',
      processNote:
        'Produced in a private written session. Release required deliberate facilitator approval after recorded confirmations. Only approved outcome text and limited metadata are public.',
      scopeConfirms: [
        'That approved outcome text was released',
        'That a verification anchor binds this instrument',
      ],
      scopeDoesNot: [
        'Session transcript',
        'Participant identities',
        'Unapproved drafts',
        'Full platform zero-knowledge or Signal-grade E2E claims',
      ],
      relatedRecords: [],
      variant: 'live',
      anchorStatus: 'verified',
      document,
    },
  };
}

export function LedgerRecordPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const { entry, loading } = useLedgerRecord(recordId);
  const sample = recordId ? getSampleRecordById(recordId) : undefined;
  usePageTitle(sample?.title ?? entry?.session?.title ?? 'Released record');

  if (loading) {
    return (
      <div className="sr-ledger-dark min-h-[40vh]">
        <div className={`${publicShellInnerClass} py-16`}>
          <p className="font-mono text-sm text-ink-secondary" role="status">
            Loading released record…
          </p>
        </div>
      </div>
    );
  }

  if (entry) {
    const { record, citation } = liveEntryToDossier(entry);
    return (
      <ReleasedRecordDossier
        record={record}
        citation={citation}
        verifyHref={`/ledger/${entry.id}/verify`}
      />
    );
  }

  if (!sample) {
    return (
      <div className="sr-ledger-dark min-h-[40vh]">
        <MarketingSection density="spacious" className="!pt-16">
          <ShellWidth>
            <div className="max-w-measure">
              <SectionLabel text="Record not found" />
              <h1 className="font-sans text-h2 font-semibold tracking-[-0.02em] text-ink">
                No public record matches that ID.
              </h1>
              <p className="mt-4 text-sm text-ink-secondary">
                Private anchored releases are not listed on the public ledger. If you expected a
                public record, confirm the ID with the releasing facilitator.
              </p>
              <p className="mt-4">
                <Link to="/ledger" className="underline-offset-4 hover:underline">
                  Back to ledger
                </Link>
              </p>
            </div>
          </ShellWidth>
        </MarketingSection>
      </div>
    );
  }

  return <SampleDossier record={sample} />;
}

function SampleDossier({ record }: { record: LedgerRecordDetail }) {
  const specimen = getSpecimenById(record.id);
  const year = specimen ? Number(specimen.releasedAt.slice(0, 4)) : new Date().getFullYear();
  const citation = `ILLUSTRATIVE SPECIMEN (not a citable record). ${record.org}. (${year}). ${record.title}. SquadRidge Outcome Ledger citation format.`;
  const document = record.document ?? (specimen ? specimenToDocumentFields(specimen) : undefined);

  return (
    <ReleasedRecordDossier
      record={{
        ...record,
        verificationAnchor: specimen?.verificationAnchor ?? record.verificationAnchor,
        document,
      }}
      citation={citation}
      illustrativeNotice="Designed to show the structure, metadata, and verification surface of a released record. No facilitated session produced this text, the anchor is illustrative, and no organisation named here has released anything through SquadRidge."
    />
  );
}
