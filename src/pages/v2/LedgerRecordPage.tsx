import { Link, useParams } from 'react-router-dom';
import { getSampleRecordById } from '../../data/sampleRecords';
import { useLedgerRecord } from '../../hooks/useLedger';
import {
  MarketingSection,
  SectionLabel,
  ShellWidth,
  VerificationAnchorBadge,
} from '../../components/shared';

function Breadcrumb({ title }: { title: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 font-mono text-xs text-ink-secondary">
        <li>
          <Link to="/ledger" className="hover:underline">
            Ledger
          </Link>
        </li>
        <li aria-hidden="true">›</li>
        <li className="truncate text-ink">{title}</li>
      </ol>
    </nav>
  );
}

function RecordBody({
  body,
  anchor,
  citation,
  recordId,
}: {
  body: string;
  anchor: string;
  citation: string;
  recordId?: string;
}) {
  return (
    <MarketingSection tone="bordered" density="compact">
      <ShellWidth>
        <div className="mx-auto max-w-measure">
          <div className="sr-evidence-frame mb-8 p-6 md:p-8">
            <h2 className="mb-5 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
              Approved outcome text
            </h2>
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-ink">
              {body}
            </pre>
          </div>

          <section className="mb-8 border border-line bg-surface-elevated p-5">
            <h2 className="mb-3 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
              Verification anchor
            </h2>
            <code className="block break-all border border-line bg-surface-sunken px-4 py-3 font-mono text-xs text-ink-secondary">
              {anchor}
            </code>
            {recordId ? (
              <p className="mt-3">
                <Link
                  to={`/ledger/${recordId}/verify`}
                  className="font-mono text-xs text-brand hover:underline"
                >
                  Verify integrity anchor →
                </Link>
              </p>
            ) : null}
          </section>

          <section>
            <h2 className="mb-3 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
              Cite this record
            </h2>
            <code className="block border border-line bg-surface-sunken px-4 py-3 font-mono text-xs leading-relaxed text-ink-secondary">
              {citation}
            </code>
          </section>
        </div>
      </ShellWidth>
    </MarketingSection>
  );
}

export function LedgerRecordPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const { entry, loading } = useLedgerRecord(recordId);
  const sample = recordId ? getSampleRecordById(recordId) : undefined;

  if (loading) {
    return (
      <div className="sr-mode-ledger min-h-[40vh]">
        <MarketingSection density="spacious">
          <ShellWidth>
            <p className="font-mono text-sm text-ink-secondary" role="status">
              Loading record…
            </p>
          </ShellWidth>
        </MarketingSection>
      </div>
    );
  }

  if (entry) {
    const anchorId = entry.ledger_sha
      ? `SQR-${entry.ledger_sha.slice(0, 8).toUpperCase()}`
      : entry.id.slice(0, 8).toUpperCase();
    const title = entry.session?.title ?? 'Released outcome';
    const body = [entry.summary, entry.agreed_terms, entry.pending_items]
      .filter(Boolean)
      .join('\n\n');
    const releasedDate = entry.published_at
      ? new Date(entry.published_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '—';
    const citation = `${entry.session?.conflict_type ?? 'Facilitated session'}. (${entry.published_at ? new Date(entry.published_at).getFullYear() : new Date().getFullYear()}). ${title}. SquadRidge Outcome Ledger. https://squadridge.app/ledger/${entry.id}.`;

    return (
      <div className="sr-mode-ledger">
        <MarketingSection density="compact" className="!pt-16">
          <ShellWidth>
            <div className="max-w-measure">
              <Breadcrumb title={title} />
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <SectionLabel text="Released outcome record" />
                <VerificationAnchorBadge anchorId={anchorId} status="verified" />
              </div>
              <h1 className="font-display text-display font-medium text-ink">{title}</h1>
              <p className="mt-4 text-sm italic text-ink-secondary">
                Approved outcome from a facilitated session. The session room is not public.
              </p>
              <p className="mt-3 font-mono text-xs text-ink-faint">Released: {releasedDate}</p>
              <p className="mt-4">
                <Link
                  to={`/ledger/${entry.id}/verify`}
                  className="font-mono text-xs text-brand hover:underline"
                >
                  Verify integrity anchor →
                </Link>
              </p>
            </div>
          </ShellWidth>
        </MarketingSection>

        <RecordBody
          body={body}
          anchor={entry.ledger_sha ?? entry.id}
          citation={citation}
          recordId={entry.id}
        />
      </div>
    );
  }

  const record = sample;

  if (!record) {
    return (
      <div className="sr-mode-ledger min-h-[40vh]">
        <MarketingSection density="spacious" className="!pt-16">
          <ShellWidth>
            <div className="max-w-measure">
              <SectionLabel text="Record not found" />
              <h1 className="font-display text-h2 font-medium text-ink">
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

  const citation = `${record.org}. (${new Date(record.releasedDate).getFullYear() || '2024'}). ${record.title}. SquadRidge Outcome Ledger. https://squadridge.app/ledger/${record.id}. Accessed: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  return (
    <div className="sr-mode-ledger">
      <MarketingSection density="compact" className="!pt-16">
        <ShellWidth>
          <div className="max-w-measure">
            <Breadcrumb title={record.title} />
            <div className="mb-5 border border-line bg-surface-elevated px-4 py-3 text-sm leading-relaxed text-ink-secondary">
              <span className="font-medium text-ink">Illustrative example.</span> Sample data
              demonstrating the released record format — not a live publish.
            </div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <SectionLabel text="Released outcome record" />
              <VerificationAnchorBadge
                anchorId={record.id}
                status={record.anchorStatus ?? 'verified'}
              />
            </div>
            <h1 className="font-display text-display font-medium text-ink">{record.title}</h1>
            <p className="mt-4 text-sm italic text-ink-secondary">
              Approved outcome text from a facilitated, text-based dialogue. The session that
              produced this outcome is not public.
            </p>
            <dl className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-3">
              <div className="bg-surface-sunken px-3 py-2.5">
                <dt className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-ink-faint">
                  Organisation
                </dt>
                <dd className="mt-0.5 font-mono text-xs text-ink-secondary">{record.org}</dd>
              </div>
              <div className="bg-surface-sunken px-3 py-2.5">
                <dt className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-ink-faint">
                  Region
                </dt>
                <dd className="mt-0.5 font-mono text-xs text-ink-secondary">{record.region}</dd>
              </div>
              <div className="bg-surface-sunken px-3 py-2.5">
                <dt className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-ink-faint">
                  Released
                </dt>
                <dd className="mt-0.5 font-mono text-xs text-ink-secondary">
                  {record.releasedDate}
                </dd>
              </div>
            </dl>
          </div>
        </ShellWidth>
      </MarketingSection>

      <RecordBody body={record.body} anchor={record.verificationAnchor} citation={citation} />
    </div>
  );
}
