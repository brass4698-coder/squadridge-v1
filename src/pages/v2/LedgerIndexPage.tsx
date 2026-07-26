import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ledgerSpecimens } from '../../data/ledgerSpecimens';
import { useLedger } from '../../hooks/useLedger';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ledgerEntryToCard } from '../../lib/ledgerDisplay';
import {
  CapsLabel,
  GlossTerm,
  ImplementationStatusBadge,
  NoLiveReleasesPanel,
  RecordCardCompact,
  specimenToRecordCardProps,
} from '../../components/shared';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';
import { useAuth } from '../../contexts/AuthContext';
import { appRoutes } from '../../lib/appRoutes';
import { getClaim } from '../../data/implementationStatus';
import { CTA } from '../../data/siteMessaging';

const TRUST_STRIP =
  'Approved outcomes only · Verification anchors · No transcript · No auto-publish';

const ANCHOR_CLAIM = getClaim('sha256_anchor');
const RFC_CLAIM = getClaim('rfc3161_timestamp');

/**
 * Ledger index — continuous dark integrity register (Apple/security-grade).
 */
export function LedgerIndexPage() {
  usePageTitle('Outcome ledger');
  const [query, setQuery] = useState('');
  const { entries, loading, error, refetch } = useLedger(query);
  const { session } = useAuth();

  const liveCards = useMemo(() => entries.map(ledgerEntryToCard), [entries]);
  const sampleCards = useMemo(
    () => ledgerSpecimens.map((s) => specimenToRecordCardProps(s, `/ledger/${s.id}`)),
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
    <div className="sr-ledger-dark min-h-[50vh]" data-demo="ledger-index" data-page="ledger">
      {/* 1. Registry header — same canvas, no cream band */}
      <header className="scroll-mt-20" data-scroll-section>
        <div className={`${publicShellInnerClass} pb-12 pt-16 md:pb-16 md:pt-24`}>
          <CapsLabel>Public integrity registry</CapsLabel>
          <h1 className="mt-3 font-sans text-[length:var(--sr-text-display)] font-semibold tracking-[-0.02em] text-ink">
            Outcome ledger
          </h1>
          <p className="mt-4 mb-0 max-w-measure text-base leading-relaxed text-ink-secondary">
            A calm archive of approved outcomes — each with a{' '}
            <GlossTerm term="verification-anchor" />. Room dialogue and private NGO releases do not
            appear here.
          </p>
          <aside
            className="mt-5 max-w-measure rounded-[var(--sr-radius-lg)] border border-line bg-surface-elevated/80 px-4 py-4"
            aria-label="What the verification anchor proves"
          >
            <div className="flex flex-wrap items-center gap-2">
              <ImplementationStatusBadge status={ANCHOR_CLAIM.status} size="sm" />
              <span className="text-sm font-medium text-ink">Verification anchor (SHA-256)</span>
            </div>
            <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">
              <span className="font-medium text-ink">Proves: </span>
              integrity of the approved release text — anyone holding the file can recompute the
              hash.
            </p>
            <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">
              <span className="font-medium text-ink">Does not prove: </span>
              independently attested time, legal privilege, or court-admissible evidence of when.
              RFC 3161 is{' '}
              <ImplementationStatusBadge
                status={RFC_CLAIM.status}
                size="sm"
                className="align-middle"
              />{' '}
              — not LIVE until a verified TSA token is stored on release.
            </p>
          </aside>
          <p className="mt-3 mb-0 max-w-measure text-sm leading-relaxed text-ink-faint">
            Process detail on{' '}
            <Link
              to={CTA.secondaryProcessHref}
              className="text-ink-secondary underline-offset-4 hover:underline"
            >
              How it works
            </Link>
            . Diligence samples (synthetic):{' '}
            <a
              href="/diligence/sample-approved-record.md"
              className="text-brand underline-offset-2 hover:underline"
              download
            >
              approved record
            </a>
            {' · '}
            <a
              href="/diligence/sample-audit-trail-export.md"
              className="text-brand underline-offset-2 hover:underline"
              download
            >
              audit-trail export
            </a>
            .
          </p>
          <p className="mt-5 mb-0 max-w-measure font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
            {TRUST_STRIP}
          </p>
        </div>
      </header>

      {/* 2. Browse — same elevation as canvas, hairline only */}
      <div className="border-y border-line" data-scroll-section>
        <div
          className={`${publicShellInnerClass} flex flex-col gap-3 py-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8`}
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
              className="w-full rounded-[var(--sr-radius-md)] border border-line bg-surface-elevated px-4 py-2.5 font-mono text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-line-strong focus:shadow-[var(--sr-focus-ring)]"
            />
          </label>
        </div>
        {error ? (
          <div className={`${publicShellInnerClass} pb-6`}>
            <div
              className="flex flex-wrap items-center gap-3 rounded-[var(--sr-radius-md)] border border-line bg-surface-sunken/50 px-4 py-3 text-sm text-ink"
              role="alert"
            >
              <p className="m-0 max-w-measure text-ink-secondary">
                Live published records could not be loaded right now. Illustrative specimens below
                are unaffected.
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

      <section className="scroll-mt-20 py-16 md:py-24" data-scroll-section>
        <div className={publicShellInnerClass}>
          {loading ? (
            <p className="py-6 font-mono text-sm text-ink-secondary" role="status">
              Loading ledger…
            </p>
          ) : null}

          {hasLive ? (
            <div className="mb-16 md:mb-20">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div>
                  <CapsLabel id="published-h">Published records</CapsLabel>
                  <p className="mt-1.5 mb-0 text-sm text-ink-secondary">
                    Workspace-published releases with a public integrity anchor.
                  </p>
                </div>
                {session ? (
                  <Link
                    to={appRoutes.appLedger}
                    className="shrink-0 text-sm text-ink-secondary no-underline underline-offset-4 transition-colors hover:text-brand hover:underline"
                  >
                    Workspace ledger
                  </Link>
                ) : (
                  <Link
                    to="/sign-in?next=%2Fapp%2Fledger"
                    className="shrink-0 text-sm text-ink-secondary no-underline underline-offset-4 transition-colors hover:text-brand hover:underline"
                  >
                    Sign in for workspace view
                  </Link>
                )}
              </div>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {liveCards.map((rec) => (
                  <li key={rec.href}>
                    <RecordCardCompact {...rec} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            {!hasLive && !loading && !error ? <NoLiveReleasesPanel className="mb-10" /> : null}
            <div className="mb-6 max-w-measure">
              <CapsLabel id="specimens-h">Illustrative specimens</CapsLabel>
              <p className="mt-1.5 mb-0 text-sm text-ink-secondary">
                Designed dossiers that show the released-record format used for institutional
                verification. Their anchors are illustrative and do not resolve against a released
                instrument. Room content is never published.
              </p>
            </div>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {filteredSamples.map((rec) => (
                <li key={rec.id}>
                  <RecordCardCompact {...rec} href={`/ledger/${rec.id}`} />
                </li>
              ))}
            </ul>
            {filteredSamples.length === 0 ? (
              <p className="mt-6 text-sm text-ink-faint">No specimens match that search.</p>
            ) : null}
          </div>

          <aside className="mt-16 max-w-measure border-t border-line pt-10 md:mt-20">
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

          <div className="mt-12 max-w-measure border-t border-line pt-10">
            <p className="m-0 text-sm leading-relaxed text-ink-secondary">{CTA.closeLedger}</p>
            <div className="sr-cta-row mt-5">
              <Link
                to={CTA.primaryHref}
                className="btn-institutional btn-institutional--primary text-sm"
              >
                {CTA.primaryLabel}
              </Link>
              <Link
                to={CTA.secondaryProcessHref}
                className="text-sm text-ink-secondary no-underline underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                {CTA.secondaryProcess}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
