import { useMemo, useState } from 'react';
import { sampleRecords } from '../../data/sampleRecords';
import { useLedger } from '../../hooks/useLedger';
import { ledgerEntryToCard } from '../../lib/ledgerDisplay';
import { CTA } from '../../data/siteMessaging';
import { CTABlock, RecordCardCompact, TrustLabel } from '../../components/shared';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';

/**
 * Ledger index — archival docket: title bar + search + list. No hero kit.
 */
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
      <header className="border-b border-line bg-surface-sunken/50">
        <div className={`${publicShellInnerClass} py-12 md:py-14`}>
          <TrustLabel variant="ledger" />
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-display text-display font-medium text-ink">Outcome ledger</h1>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-secondary">
                Approved outcomes only. Each entry carries a verification anchor. Session dialogue
                is never published.
              </p>
            </div>
            <label className="block w-full max-w-sm md:shrink-0">
              <span className="sr-only">Search records</span>
              <input
                id="ledger-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by summary…"
                className="w-full border border-line bg-surface-elevated px-4 py-2.5 font-mono text-sm text-ink outline-none focus:border-line-strong"
              />
            </label>
          </div>
          {!hasLive && !loading ? (
            <p className="mt-6 border border-line bg-surface-elevated px-4 py-3 font-mono text-xs text-ink-secondary">
              Illustrative examples — no live published records yet.
            </p>
          ) : null}
        </div>
      </header>

      <section className="py-10 md:py-12">
        <div className={publicShellInnerClass}>
          {loading ? (
            <p className="py-8 font-mono text-sm text-ink-secondary">Loading ledger…</p>
          ) : null}

          {hasLive ? (
            <div className="mb-12">
              <h2 className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
                Published
              </h2>
              <div className="divide-y divide-line border border-line">
                {liveCards.map((rec) => (
                  <RecordCardCompact key={rec.href} {...rec} />
                ))}
              </div>
            </div>
          ) : null}

          <div>
            {hasLive ? (
              <h2 className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
                Illustrative
              </h2>
            ) : null}
            <div className="divide-y divide-line border border-line">
              {sampleCards.map((rec) => (
                <RecordCardCompact key={rec.id} {...rec} href={`/ledger/${rec.id}`} />
              ))}
            </div>
          </div>

          <p className="mt-10 max-w-prose font-mono text-xs leading-relaxed text-ink-faint">
            Facilitator sign-off publishes the record. SquadRidge verifies release integrity — not
            the substance of outcomes.
          </p>
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
