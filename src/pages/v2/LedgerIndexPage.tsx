import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { sampleRecords } from '../../data/sampleRecords';
import { useLedger } from '../../hooks/useLedger';
import { ledgerEntryToCard } from '../../lib/ledgerDisplay';
import { CapsLabel, RecordCardCompact } from '../../components/shared';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';
import { useAuth } from '../../contexts/AuthContext';
import { appRoutes } from '../../lib/appRoutes';

const TRUST_STRIP =
  'Approved outcomes only · Verification anchors · No transcript · No auto-publish';

/**
 * Ledger index — calm institutional archive of approved outcomes.
 */
export function LedgerIndexPage() {
  const [query, setQuery] = useState('');
  const { entries, loading, error, refetch } = useLedger(query);
  const { session } = useAuth();

  const liveCards = useMemo(() => entries.map(ledgerEntryToCard), [entries]);
  const sampleCards = useMemo(
    () => sampleRecords.map((rec) => ({ ...rec, href: `/ledger/${rec.id}` })),
    [],
  );

  const hasLive = liveCards.length > 0;
  const filteredSamples = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sampleCards;
    return sampleCards.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.org.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q),
    );
  }, [query, sampleCards]);

  return (
    <div className="sr-mode-ledger min-h-[50vh]" data-demo="ledger-index">
      {/* 1. Registry header */}
      <header
        className="scroll-mt-20 border-b border-[color:var(--sr-mode-ledger-border)] bg-surface-sunken/40"
        data-scroll-section
      >
        <div className={`${publicShellInnerClass} py-10 md:py-12`}>
          <CapsLabel>Public integrity registry</CapsLabel>
          <h1 className="mt-3 font-display text-display font-medium tracking-tight text-ink">
            Outcome ledger
          </h1>
          <p className="mt-4 mb-0 max-w-measure text-base leading-relaxed text-ink-secondary">
            A calm archive of approved outcomes — each with a verification anchor. The ledger
            anchors that a specific approved text existed at a point in time. Room dialogue and
            private NGO releases do not appear here.
          </p>
          <p className="mt-5 mb-0 max-w-measure font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
            {TRUST_STRIP}
          </p>
        </div>
      </header>

      {/* 2. Archive control bar */}
      <div className="border-b border-line bg-surface-elevated" data-scroll-section>
        <div
          className={`${publicShellInnerClass} flex flex-col gap-3 py-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8`}
        >
          <div>
            <CapsLabel>Browse records</CapsLabel>
            <p className="mt-1 mb-0 text-sm text-ink-secondary">
              Search by title, organisation, or record ID.
            </p>
          </div>
          <label className="block w-full max-w-md shrink-0">
            <span className="sr-only">Search ledger records</span>
            <input
              id="ledger-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, organisation, or record ID…"
              className="w-full border border-line bg-surface-sunken/40 px-4 py-2.5 font-mono text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-line-strong focus:bg-surface-elevated"
            />
          </label>
        </div>
        {error ? (
          <div className={`${publicShellInnerClass} pb-4`}>
            <div className="flex flex-wrap items-center gap-3 border border-sem-danger/30 bg-sem-danger-soft px-4 py-3 text-sm text-ink">
              <p className="m-0">
                Could not load published records. Illustrative specimens remain available.
              </p>
              <button
                type="button"
                className="font-mono text-xs uppercase tracking-[var(--tracking-caps)] text-ink-secondary underline-offset-4 hover:underline"
                onClick={() => void refetch()}
              >
                Retry
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <section className="scroll-mt-20 py-12 md:py-16" data-scroll-section>
        <div className={publicShellInnerClass}>
          {loading ? (
            <p className="py-6 font-mono text-sm text-ink-secondary" role="status">
              Loading ledger…
            </p>
          ) : null}

          {/* 3. Published records */}
          {hasLive ? (
            <div className="mb-16 md:mb-20">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div>
                  <CapsLabel id="published-h">Published records</CapsLabel>
                  <p className="mt-1.5 mb-0 text-sm text-ink-secondary">
                    Workspace-published releases with a public integrity anchor.
                  </p>
                </div>
                {session ? (
                  <Link
                    to={appRoutes.appLedger}
                    className="shrink-0 text-sm text-ink-secondary no-underline underline-offset-4 transition-colors hover:text-ink hover:underline"
                  >
                    Workspace ledger
                  </Link>
                ) : (
                  <Link
                    to="/sign-in?next=%2Fapp%2Fledger"
                    className="shrink-0 text-sm text-ink-secondary no-underline underline-offset-4 transition-colors hover:text-ink hover:underline"
                  >
                    Sign in for workspace view
                  </Link>
                )}
              </div>
              <div className="divide-y divide-line overflow-hidden rounded-[var(--sr-radius-md)] border border-line shadow-[var(--sr-shadow-sm)]">
                {liveCards.map((rec) => (
                  <RecordCardCompact key={rec.href} {...rec} />
                ))}
              </div>
            </div>
          ) : null}

          {/* 4. Illustrative specimens */}
          <div>
            <div className="mb-5 max-w-measure">
              <CapsLabel id="specimens-h">
                {hasLive ? 'Illustrative specimens' : 'Illustrative released records'}
              </CapsLabel>
              <p className="mt-1.5 mb-0 text-sm text-ink-secondary">
                {hasLive
                  ? 'Designed preview dossiers — not live releases. Room content is never published.'
                  : 'No live public releases in this environment yet. Specimens show the dossier format used for institutional verification.'}
              </p>
            </div>
            <div className="divide-y divide-line overflow-hidden rounded-[var(--sr-radius-md)] border border-line border-dashed bg-surface-sunken/20">
              {filteredSamples.map((rec) => (
                <RecordCardCompact key={rec.id} {...rec} href={`/ledger/${rec.id}`} />
              ))}
            </div>
            {filteredSamples.length === 0 ? (
              <p className="mt-6 text-sm text-ink-faint">No specimens match that search.</p>
            ) : null}
          </div>

          {/* 5. Ledger doctrine */}
          <aside className="mt-14 max-w-measure border-t border-line pt-8 md:mt-16">
            <CapsLabel>What the ledger is — and is not</CapsLabel>
            <p className="mt-3 mb-0 text-sm leading-relaxed text-ink-secondary">
              An archival registry, not a feed. Integrity anchors confirm the released text has not
              been altered since publication.
            </p>
            <ul className="mt-4 mb-0 list-none space-y-2 p-0 text-sm leading-relaxed text-ink-faint">
              <li className="flex gap-2.5">
                <span
                  aria-hidden
                  className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-ink-faint"
                />
                <span>They do not attest what was said in the room</span>
              </li>
              <li className="flex gap-2.5">
                <span
                  aria-hidden
                  className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-ink-faint"
                />
                <span>They do not identify individual participants</span>
              </li>
              <li className="flex gap-2.5">
                <span
                  aria-hidden
                  className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-ink-faint"
                />
                <span>They do not imply external endorsement of substance</span>
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}
