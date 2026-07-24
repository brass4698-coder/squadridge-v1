import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { sampleRecords } from '../../data/sampleRecords';
import { useLedger } from '../../hooks/useLedger';
import { ledgerEntryToCard } from '../../lib/ledgerDisplay';
import { RecordCardCompact, TrustLabel } from '../../components/shared';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';
import { useAuth } from '../../contexts/AuthContext';
import { appRoutes } from '../../lib/appRoutes';

/**
 * Ledger index — civic archive of approved outcomes only.
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
      <header
        className="scroll-mt-20 border-b border-[color:var(--sr-mode-ledger-border)] bg-surface-sunken/50"
        data-scroll-section
      >
        <div className={`${publicShellInnerClass} py-10 md:py-14`}>
          <TrustLabel variant="ledger" />
          <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="font-display text-display font-medium tracking-tight text-ink">
                Public integrity registry
              </h1>
              <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                A calm archive of approved outcomes — each with a verification anchor. The ledger
                proves that a specific approved text existed at a point in time. It does not publish
                room dialogue, participant identities, or unapproved drafts. Private NGO releases do
                not appear here.
              </p>
              <ul className="mt-5 m-0 flex list-none flex-wrap gap-2 p-0">
                {[
                  'Approved outcomes only',
                  'Verification anchors',
                  'No transcript',
                  'No auto-publish',
                ].map((t) => (
                  <li
                    key={t}
                    className="rounded-sm border border-line px-2.5 py-1 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <label className="block w-full max-w-sm shrink-0">
              <span className="mb-1.5 block font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
                Search records
              </span>
              <input
                id="ledger-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Title, organisation, or record ID…"
                className="w-full border border-line bg-surface-elevated px-4 py-2.5 font-mono text-sm text-ink outline-none focus:border-line-strong"
              />
            </label>
          </div>
          {error ? (
            <div className="mt-6 flex flex-wrap items-center gap-3 border border-sem-danger/30 bg-sem-danger-soft px-4 py-3 text-sm text-ink">
              <p className="m-0">
                Could not load live records. Illustrative specimens remain available.
              </p>
              <button
                type="button"
                className="font-mono text-xs uppercase tracking-[0.1em] text-brand"
                onClick={() => void refetch()}
              >
                Retry
              </button>
            </div>
          ) : null}
          {!hasLive && !loading && !error ? (
            <p className="mt-8 max-w-2xl border border-line bg-surface-elevated px-4 py-3 text-sm leading-relaxed text-ink-secondary">
              <span className="font-medium text-ink">Illustrative archive.</span> No live public
              records in this environment yet. Open any specimen to review the full release-dossier
              layout used for institutional verification.
            </p>
          ) : null}
        </div>
      </header>

      <section className="scroll-mt-20 py-10 md:py-14" data-scroll-section>
        <div className={publicShellInnerClass}>
          {loading ? (
            <p className="py-8 font-mono text-sm text-ink-secondary" role="status">
              Loading ledger…
            </p>
          ) : null}

          {hasLive ? (
            <div className="mb-14">
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
                  Published
                </h2>
                {session ? (
                  <Link to={appRoutes.appLedger} className="text-xs text-brand">
                    Workspace ledger →
                  </Link>
                ) : (
                  <Link to="/sign-in?next=%2Fapp%2Fledger" className="text-xs text-brand">
                    Sign in for workspace view →
                  </Link>
                )}
              </div>
              <div className="divide-y divide-line overflow-hidden rounded-lg border border-line">
                {liveCards.map((rec) => (
                  <RecordCardCompact key={rec.href} {...rec} />
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <h2 className="mb-2 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
              {hasLive ? 'Illustrative specimens' : 'Illustrative released records'}
            </h2>
            <p className="mb-5 max-w-2xl text-sm text-ink-secondary">
              Longer dossier format: release summary, outcome bullets, approved text, scope &amp;
              limits, verification panel, citation/export, and related records.
            </p>
            <div className="divide-y divide-line overflow-hidden rounded-lg border border-line">
              {filteredSamples.map((rec) => (
                <RecordCardCompact key={rec.id} {...rec} href={`/ledger/${rec.id}`} />
              ))}
            </div>
            {filteredSamples.length === 0 ? (
              <p className="mt-6 text-sm text-ink-faint">
                No illustrative records match that search.
              </p>
            ) : null}
          </div>

          <aside className="mt-12 max-w-2xl border-l-2 border-line pl-4 text-sm leading-relaxed text-ink-faint">
            <p className="m-0 font-medium text-ink-secondary">What the ledger is — and is not</p>
            <p className="mt-2 mb-0">
              Think archival registry, not a blockchain explorer or live feed. Integrity anchors
              confirm the released text has not been altered since publication. They do not prove
              what was said in the room, who each participant is, or external endorsement of
              substance. Session transcripts, unapproved drafts, and private NGO releases stay off
              this surface.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}
