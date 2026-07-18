import { useMemo, useState } from 'react';
import { sampleRecords } from '../../data/sampleRecords';
import { useLedger } from '../../hooks/useLedger';
import { ledgerEntryToCard } from '../../lib/ledgerDisplay';
import { LedgerArchiveVisual } from '../../components/institutional';
import { CTA } from '../../data/siteMessaging';
import {
  CTABlock,
  EvaluatorPath,
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
    <div>
      <MarketingSection className="!pb-8 !pt-16">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
          <div className="max-w-xl">
            <SectionLabel text="Public record" />
            <h1 className="font-display text-h1 font-medium tracking-tight text-ink">
              Outcome ledger
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary md:text-base">
              Approved outcome records from completed sessions. Each entry is verifiable via its
              anchor. Session room content is never published — only text you approve as
              facilitator, plus limited metadata. That is the boundary between protected session and
              released outcome.
            </p>
            {!hasLive && !loading ? (
              <div className="mt-6 border border-line bg-surface-elevated px-5 py-4 text-sm leading-relaxed text-ink-secondary">
                <span className="font-medium text-ink">Illustrative examples below.</span> No live
                published records yet — samples show the released record format.
              </div>
            ) : null}
          </div>
          <LedgerArchiveVisual className="w-full" />
        </div>
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
            className="mb-8 w-full border border-line bg-surface-elevated px-5 py-3 text-sm text-ink outline-none transition-colors focus:border-line-strong"
          />

          {loading ? (
            <p className="py-8 text-center text-sm text-ink-secondary">Loading ledger…</p>
          ) : null}

          {hasLive ? (
            <div className="mb-12">
              <h2 className="mb-4 font-mono text-[0.65rem] font-medium uppercase tracking-[0.12em] text-ink-faint">
                Published records
              </h2>
              <div className="flex flex-col gap-px border border-line bg-line">
                {liveCards.map((rec) => (
                  <div key={rec.href} className="bg-surface">
                    <RecordCardCompact {...rec} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            {hasLive ? (
              <h2 className="mb-4 font-mono text-[0.65rem] font-medium uppercase tracking-[0.12em] text-ink-faint">
                Illustrative examples
              </h2>
            ) : null}
            <div className="flex flex-col gap-px border border-line bg-line">
              {sampleCards.map((rec) => (
                <div key={rec.id} className="bg-surface">
                  <RecordCardCompact {...rec} href={`/ledger/${rec.id}`} />
                </div>
              ))}
            </div>
          </div>

          <p className="mt-12 text-xs leading-relaxed text-ink-faint">
            Records are published with facilitator sign-off. SquadRidge verifies the release process
            — not the substance of published outcomes.
          </p>
        </div>
      </section>

      <MarketingSection className="!py-12">
        <div className="mx-auto max-w-6xl">
          <EvaluatorPath current="trust" />
        </div>
      </MarketingSection>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.pilotBody}
        secondaryLabel={CTA.secondaryProcess}
        secondaryHref={CTA.secondaryProcessHref}
      />
    </div>
  );
}
