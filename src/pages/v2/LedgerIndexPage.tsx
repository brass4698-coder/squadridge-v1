import { useMemo, useState } from 'react';
import { sampleRecords } from '../../data/sampleRecords';
import { useLedger } from '../../hooks/useLedger';
import { ledgerEntryToCard } from '../../lib/ledgerDisplay';
import {
  CTABlock,
  MarketingSection,
  RecordCardCompact,
  SectionLabel,
} from '../../components/shared';

export function LedgerIndexPage() {
  const [query, setQuery] = useState('');
  const { entries, loading } = useLedger(query);

  const liveCards = useMemo(() => entries.map(ledgerEntryToCard), [entries]);
  const sampleCards = sampleRecords.map((rec) => ({
    ...rec,
    href: `/ledger/${rec.id}`,
  }));

  const hasLive = liveCards.length > 0;

  return (
    <div className="bg-surface">
      <MarketingSection className="!pb-8 !pt-16">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel text="Public record" />
          <h1 className="mb-3 text-h1 text-ink">Outcome ledger</h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-ink-secondary">
            Approved outcome records from completed sessions. Each entry is verifiable via its
            anchor. Session room content is never published.
          </p>
        </div>

        {!hasLive && !loading ? (
          <div className="mx-auto mt-8 max-w-4xl rounded-lg border border-brand/25 bg-brand-soft px-5 py-4 text-sm leading-relaxed text-ink-secondary">
            <span className="font-semibold text-ink">Illustrative examples below.</span> No live
            published records yet — sample entries show the released record format.
          </div>
        ) : null}
      </MarketingSection>

      <section className="border-t border-line px-6 pb-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <label htmlFor="ledger-search" className="sr-only">
            Search records
          </label>
          <input
            id="ledger-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by summary…"
            className="mb-8 w-full rounded-lg border border-line bg-surface-elevated px-5 py-3 text-sm text-ink outline-none transition-colors focus:border-brand/40"
          />

          {loading ? (
            <p className="py-8 text-center text-sm text-ink-secondary">Loading ledger…</p>
          ) : null}

          {hasLive ? (
            <div className="mb-12">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-faint">
                Published records
              </h2>
              <div className="flex flex-col gap-4">
                {liveCards.map((rec) => (
                  <RecordCardCompact key={rec.href} {...rec} />
                ))}
              </div>
            </div>
          ) : null}

          <div>
            {hasLive ? (
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-faint">
                Illustrative examples
              </h2>
            ) : null}
            <div className="flex flex-col gap-4">
              {sampleCards.map((rec) => (
                <RecordCardCompact key={rec.id} {...rec} href={`/ledger/${rec.id}`} />
              ))}
            </div>
          </div>

          <p className="mt-12 text-center text-xs leading-relaxed text-ink-faint">
            Records are published with facilitator sign-off. SquadRidge verifies the release process
            — not the substance of published outcomes.
          </p>
        </div>
      </section>

      <CTABlock
        headline="Run a session that produces a verifiable record."
        secondaryLabel="See how it works"
        secondaryHref="/how-it-works"
      />
    </div>
  );
}
