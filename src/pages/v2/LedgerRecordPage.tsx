import { Link, useParams } from 'react-router-dom';
import { getSampleRecordById } from '../../data/sampleRecords';
import { useLedgerRecord } from '../../hooks/useLedger';
import {
  CTABlock,
  MarketingSection,
  SectionLabel,
  VerificationAnchorBadge,
} from '../../components/shared';
import { CTA } from '../../data/siteMessaging';

export function LedgerRecordPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const { entry, loading } = useLedgerRecord(recordId);
  const sample = recordId ? getSampleRecordById(recordId) : undefined;

  if (loading) {
    return (
      <div className="bg-surface">
        <MarketingSection className="!pt-20">
          <p className="text-center text-sm text-ink-secondary">Loading record…</p>
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
      <div className="bg-surface">
        <MarketingSection className="!pb-8 !pt-16">
          <div className="mx-auto max-w-3xl">
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-xs text-ink-secondary">
                <li>
                  <Link to="/ledger" className="hover:underline">
                    Ledger
                  </Link>
                </li>
                <li aria-hidden="true">›</li>
                <li className="text-ink">{title}</li>
              </ol>
            </nav>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <SectionLabel text="Released outcome record" />
              <VerificationAnchorBadge anchorId={anchorId} status="verified" />
            </div>

            <h1 className="font-display text-h1 font-medium tracking-tight text-ink">{title}</h1>
            <p className="mt-4 text-sm italic text-ink-secondary">
              Approved outcome from a facilitated session. The session room is not public.
            </p>
            <p className="mt-2 text-xs text-ink-faint">Released: {releasedDate}</p>
          </div>
        </MarketingSection>

        <section className="border-t border-line px-6 pb-[var(--space-section)] md:px-8 lg:px-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 border border-line bg-surface-elevated p-8">
              <h2 className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
                Approved outcome text
              </h2>
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-ink">
                {body}
              </pre>
            </div>

            <section className="mb-10 border border-line bg-surface-elevated p-6">
              <h2 className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
                Verification anchor
              </h2>
              <code className="block break-all border border-line bg-surface-sunken px-4 py-3 font-mono text-xs text-ink-secondary">
                {entry.ledger_sha ?? entry.id}
              </code>
            </section>

            <section>
              <h2 className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
                Cite this record
              </h2>
              <code className="block border border-line bg-surface-sunken px-4 py-3 font-mono text-xs leading-relaxed text-ink-secondary">
                {citation}
              </code>
            </section>
          </div>
        </section>

        <CTABlock
          headline={CTA.pilotHeadline}
          body={CTA.pilotBody}
          secondaryLabel={CTA.secondaryProcess}
          secondaryHref={CTA.secondaryProcessHref}
        />
      </div>
    );
  }

  const record = sample;

  if (!record) {
    return (
      <div className="bg-surface">
        <MarketingSection className="!pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel text="Record not found" />
            <h1 className="font-display text-h2 font-medium text-ink">
              No record matches that ID.
            </h1>
            <p className="mt-4 text-sm text-ink-secondary">
              <Link to="/ledger" className="text-ink-secondary underline-offset-4 hover:underline">
                Back to ledger
              </Link>
            </p>
          </div>
        </MarketingSection>
      </div>
    );
  }

  const citation = `${record.org}. (${new Date(record.releasedDate).getFullYear() || '2024'}). ${record.title}. SquadRidge Outcome Ledger. https://squadridge.app/ledger/${record.id}. Accessed: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  return (
    <div className="bg-surface">
      <MarketingSection className="!pb-8 !pt-16">
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-xs text-ink-secondary">
              <li>
                <Link to="/ledger" className="hover:underline">
                  Ledger
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li className="text-ink">{record.title}</li>
            </ol>
          </nav>

          <div className="mb-8 border border-line bg-surface-elevated px-5 py-4 text-sm leading-relaxed text-ink-secondary">
            <span className="font-medium text-ink">Illustrative example.</span> Sample data
            demonstrating the released record format.
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <SectionLabel text="Released outcome record" />
            <VerificationAnchorBadge
              anchorId={record.id}
              status={record.anchorStatus ?? 'verified'}
            />
          </div>

          <h1 className="font-display text-h1 font-medium tracking-tight text-ink">
            {record.title}
          </h1>
          <p className="mt-4 text-sm italic text-ink-secondary">
            Approved outcome text from a facilitated, text-based dialogue. The session that produced
            this outcome is not public.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-2 border border-line bg-surface-sunken px-3 py-2 text-xs text-ink-secondary">
            <span className="font-semibold uppercase tracking-wider text-ink-faint">Context:</span>
            <span>{record.org}</span>
            <span className="opacity-40">·</span>
            <span>{record.region}</span>
            <span className="opacity-40">·</span>
            <span>Released: {record.releasedDate}</span>
          </div>
        </div>
      </MarketingSection>

      <section className="border-t border-line px-6 pb-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 border border-line bg-surface-elevated p-8">
            <h2 className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
              Approved outcome text
            </h2>
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-ink">
              {record.body}
            </pre>
          </div>

          <section className="mb-10 border border-line bg-surface-elevated p-6">
            <h2 className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
              Verification anchor
            </h2>
            <code className="block break-all border border-line bg-surface-sunken px-4 py-3 font-mono text-xs text-ink-secondary">
              {record.verificationAnchor}
            </code>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
              Cite this record
            </h2>
            <code className="block border border-line bg-surface-sunken px-4 py-3 font-mono text-xs leading-relaxed text-ink-secondary">
              {citation}
            </code>
          </section>
        </div>
      </section>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.pilotBody}
        secondaryLabel={CTA.secondaryProcess}
        secondaryHref={CTA.secondaryProcessHref}
      />
    </div>
  );
}
