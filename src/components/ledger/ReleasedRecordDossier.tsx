import { useCallback, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../StatusBadge';
import { RecordAnchorBadge, VerificationAnchorBadge } from '../shared/VerificationAnchorBadge';
import { SpecimenNotice } from '../shared/SpecimenNotice';
import { publicShellInnerClass } from '../layout/publicShellTokens';
import type { LedgerRecordDetail, RelatedLedgerRecord } from '../../data/sampleRecords';

const SECTIONS = [
  { id: 'release-summary', label: 'Summary' },
  { id: 'outcome-summary', label: 'Scan' },
  { id: 'approved-text', label: 'Instrument' },
  { id: 'scope-limits', label: 'Scope' },
  { id: 'trust-tools', label: 'Verify & cite' },
  { id: 'related', label: 'Related' },
] as const;

function DossierLabel({ children }: { children: ReactNode }) {
  return <p className="sr-meta-label sr-dossier-label">{children}</p>;
}

function CopyButton({ label, getText }: { label: string; getText: () => string }) {
  const [done, setDone] = useState(false);
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setDone(true);
      window.setTimeout(() => setDone(false), 1600);
    } catch {
      setDone(false);
    }
  }, [getText]);

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      className="rounded-[var(--sr-radius-sm)] border border-line bg-transparent px-3 py-1.5 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-secondary transition-colors hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--sr-dossier-inset)] hover:text-ink focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--sr-bg),0_0_0_4px_var(--sr-primary)]"
    >
      {done ? 'Copied' : label}
    </button>
  );
}

function MetaCell({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 border-t border-line px-6 py-5 first:border-t-0 sm:border-t-0 sm:border-l sm:first:border-l-0">
      <p className="sr-meta-label">{label}</p>
      <p className="sr-meta-value mt-1.5">{value}</p>
    </div>
  );
}

/** Compact record anatomy — private room stays locked; only approved text is public. */
function TrustBoundaryStrip() {
  return (
    <figure
      className="sr-dossier-boundary m-0 overflow-hidden"
      aria-label="Private session stays locked; approved text is public; verification anchor seals integrity"
    >
      <div className="grid divide-y divide-line sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:divide-x sm:divide-y-0">
        <div className="sr-mode-room px-4 py-4">
          <DossierLabel>Private room</DossierLabel>
          <p className="mt-2 mb-0 text-sm font-medium text-ink">Sealed</p>
          <p className="mt-1 mb-0 text-xs leading-snug text-ink-secondary">
            Dialogue never published
          </p>
        </div>
        <div
          className="hidden items-center justify-center bg-[color:var(--sr-mode-gate-bg,var(--sr-bg-accent))] px-3 sm:flex"
          aria-hidden
        >
          <span className="size-1.5 rounded-full bg-brand/40" />
        </div>
        <div className="sr-dossier-boundary__cell--focus px-4 py-4">
          <DossierLabel>Approved text</DossierLabel>
          <p className="mt-2 mb-0 text-sm font-medium text-ink">Released instrument</p>
          <p className="mt-1 mb-0 text-xs leading-snug text-ink-secondary">
            Only this artifact leaves
          </p>
        </div>
        <div
          className="hidden items-center justify-center bg-[color:var(--sr-mode-gate-bg,var(--sr-bg-accent))] px-3 sm:flex"
          aria-hidden
        >
          <span className="size-1.5 rounded-full bg-brand/40" />
        </div>
        <div className="sr-mode-ledger px-4 py-4">
          <DossierLabel>Verification</DossierLabel>
          <p className="mt-2 mb-0 text-sm font-medium text-ink">Anchor sealed</p>
          <p className="mt-1 mb-0 text-xs leading-snug text-ink-secondary">
            Integrity, not substance
          </p>
        </div>
      </div>
      <figcaption className="border-t border-line px-4 py-2.5 text-center font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-secondary">
        Public record verifies release integrity, not private deliberation
      </figcaption>
    </figure>
  );
}

export type ReleasedRecordDossierProps = {
  record: {
    id: string;
    title: string;
    org: string;
    region: string;
    releasedDate: string;
    sessionDate: string;
    outcomeType: string;
    processType: string;
    visibilityClass: string;
    /** Omit when count is not public (typical for live releases). */
    participantCount?: number;
    verificationAnchor: string;
    generatedAt: string;
    outcomeSummary: string[];
    body: string;
    processNote: string;
    scopeConfirms: string[];
    scopeDoesNot: string[];
    relatedRecords: RelatedLedgerRecord[];
    variant?: LedgerRecordDetail['variant'];
    anchorStatus?: LedgerRecordDetail['anchorStatus'];
  };
  citation: string;
  verifyHref?: string;
  illustrativeNotice?: string;
};

/**
 * Released-record dossier — elevated archival modules, not a flat content slab.
 * Zones: hero → metadata → instrument → trust tools.
 */
export function ReleasedRecordDossier({
  record,
  citation,
  verifyHref,
  illustrativeNotice,
}: ReleasedRecordDossierProps) {
  const printPage = () => window.print();
  const isSpecimen = record.variant === 'sample';

  return (
    <div className="sr-ledger-dark sr-dossier pb-20" data-page="ledger-record">
      {/* ── Zone 1: Hero — open composition on continuous dark canvas ─ */}
      <header className="border-b border-line">
        <div className={`${publicShellInnerClass} pb-12 pt-10 md:pb-16 md:pt-16`}>
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="m-0 flex list-none items-center gap-2 p-0 font-mono text-xs text-ink-secondary">
              <li>
                <Link
                  to="/ledger"
                  className="no-underline underline-offset-4 transition-colors hover:text-brand hover:underline"
                >
                  Ledger
                </Link>
              </li>
              <li aria-hidden className="text-ink-faint">
                /
              </li>
              <li className="truncate text-ink-faint">{record.id}</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            {isSpecimen ? (
              <StatusBadge variant="illustrative">Illustrative</StatusBadge>
            ) : (
              <StatusBadge variant="published">Published</StatusBadge>
            )}
            <VerificationAnchorBadge
              anchorId={record.id}
              status={record.anchorStatus ?? 'verified'}
            />
            <RecordAnchorBadge recordId={record.id} />
          </div>

          <h1 className="mt-5 mb-0 max-w-3xl font-sans text-h2 font-semibold leading-tight tracking-[-0.02em] text-ink md:text-[length:var(--sr-text-display)]">
            {record.title}
          </h1>

          <p className="mt-3 mb-0 max-w-measure text-sm leading-relaxed text-ink-secondary">
            {isSpecimen
              ? 'Specimen of an approved outcome record. No private session produced this text.'
              : 'Approved outcome text only. The private session that produced it is not public.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="font-mono text-[length:var(--text-label)] text-ink-secondary">
              {record.org} · {record.releasedDate}
            </span>
          </div>

          {isSpecimen ? (
            <SpecimenNotice className="mt-6 max-w-measure">{illustrativeNotice}</SpecimenNotice>
          ) : null}

          <div className="mt-8">
            <TrustBoundaryStrip />
          </div>
        </div>
      </header>

      <div
        className={`${publicShellInnerClass} mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,17rem)] lg:items-start lg:gap-14`}
      >
        <div className="min-w-0">
          <nav
            className="mb-12 overflow-x-auto border-b border-line pb-0"
            aria-label="Record sections"
          >
            <ul className="m-0 flex list-none gap-0 p-0">
              {SECTIONS.map((s) => (
                <li key={s.id} className="shrink-0">
                  <a
                    href={`#${s.id}`}
                    className="block border-b-2 border-transparent px-3 py-2.5 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-secondary no-underline transition-colors hover:border-line-strong hover:text-ink focus-visible:text-ink focus-visible:outline-none"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Zone 2: Metadata ───────────────────────────────────── */}
          <section id="release-summary" className="scroll-mt-28">
            <DossierLabel>Release summary</DossierLabel>
            <h2 className="sr-only">Release summary</h2>
            <div className="sr-dossier-module mt-4 overflow-hidden">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3">
                <MetaCell label="Releasing body" value={record.org} />
                <MetaCell label="Region" value={record.region} />
                <MetaCell label="Released" value={record.releasedDate} />
                <MetaCell label="Session date" value={record.sessionDate} />
                <MetaCell label="Record type" value={record.outcomeType} />
                <MetaCell label="Process type" value={record.processType} />
                <MetaCell label="Visibility" value={record.visibilityClass} />
                {typeof record.participantCount === 'number' ? (
                  <MetaCell
                    label="Verified parties"
                    value={`${record.participantCount} — identities not public`}
                  />
                ) : (
                  <MetaCell label="Participants" value="Identities not public" />
                )}
                <MetaCell label="Publication" value="Facilitator-governed · no auto-publish" />
              </div>
            </div>
          </section>

          <section id="outcome-summary" className="mt-16 scroll-mt-28">
            <DossierLabel>Outcome scan</DossierLabel>
            <h2 className="mt-2 mb-0 font-heading text-h3 font-semibold text-ink">
              What this release contains
            </h2>
            <p className="mt-2 mb-0 max-w-measure text-sm text-ink-secondary">
              Plain-language bullets. The official instrument follows.
            </p>
            <ul className="mt-6 m-0 max-w-measure list-none space-y-3 border-l border-line pl-4 p-0">
              {record.outcomeSummary.map((bullet) => (
                <li key={bullet} className="text-sm leading-relaxed text-ink">
                  {bullet}
                </li>
              ))}
            </ul>
          </section>

          {/* ── Zone 3: Instrument — elevated inset surface ─ */}
          <section id="approved-text" className="mt-16 scroll-mt-28">
            <DossierLabel>Official instrument</DossierLabel>
            <h2 className="mt-2 mb-0 font-heading text-h3 font-semibold text-ink">
              Approved outcome text
            </h2>
            <p className="mt-2 mb-0 max-w-measure text-sm text-ink-secondary">
              Not a transcript of the private room.
            </p>
            <article
              className={`sr-dossier-instrument mt-6${isSpecimen ? ' sr-specimen-surface' : ''}`}
            >
              <header className="sr-dossier-instrument__header flex flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-8">
                <DossierLabel>
                  {isSpecimen ? 'Specimen instrument' : 'Released instrument'}
                </DossierLabel>
                <RecordAnchorBadge recordId={record.id} />
              </header>
              <div className="px-5 py-8 md:px-10 md:py-10">
                <pre className="sr-dossier-instrument__body m-0 max-w-prose whitespace-pre-wrap font-mono text-[0.8125rem] leading-[1.75] md:text-sm">
                  {record.body}
                </pre>
              </div>
            </article>
          </section>

          <section id="process-note" className="mt-16 scroll-mt-28">
            <DossierLabel>Process</DossierLabel>
            <h2 className="mt-2 mb-0 font-heading text-h3 font-semibold text-ink">Release note</h2>
            <div className="mt-5 max-w-measure border-l-2 border-line pl-4 text-sm leading-relaxed text-ink-secondary">
              <p className="m-0">{record.processNote}</p>
            </div>
          </section>

          <section id="scope-limits" className="mt-16 scroll-mt-28">
            <DossierLabel>Scope</DossierLabel>
            <h2 className="mt-2 mb-0 font-heading text-h3 font-semibold text-ink">
              Confirms — and intentionally omits
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="sr-dossier-module p-5">
                <DossierLabel>This record confirms</DossierLabel>
                <ul className="mt-3 m-0 list-none space-y-2.5 p-0 text-sm leading-relaxed text-ink">
                  {record.scopeConfirms.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span
                        aria-hidden
                        className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-brand"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sr-dossier-module sr-dossier-module--inset p-5">
                <DossierLabel>Intentionally omitted</DossierLabel>
                <ul className="mt-3 m-0 list-none space-y-2.5 p-0 text-sm leading-relaxed text-ink-secondary">
                  {record.scopeDoesNot.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span
                        aria-hidden
                        className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-[color:var(--sr-ink-secondary)]"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-5 mb-0 max-w-measure text-xs leading-relaxed text-ink-secondary">
              We reduce exposure by design. We do not claim full platform zero-knowledge or
              Signal-grade E2E today. Anonymity is not guaranteed. This record is not legal
              privilege advice.
            </p>
          </section>

          <section id="trust-tools" className="mt-16 scroll-mt-28 lg:hidden">
            <TrustToolsPanel
              record={record}
              citation={citation}
              verifyHref={verifyHref}
              onPrint={printPage}
            />
          </section>

          <section id="related" className="mt-16 scroll-mt-28">
            <DossierLabel>Archive</DossierLabel>
            <h2 className="mt-2 mb-0 font-heading text-h3 font-semibold text-ink">
              Related records
            </h2>
            {record.relatedRecords.length === 0 ? (
              <p className="mt-3 mb-0 text-sm text-ink-secondary">
                No linked follow-up, amendment, or implementation checkpoint on this record.
              </p>
            ) : (
              <ul className="sr-dossier-module mt-5 m-0 list-none divide-y divide-line overflow-hidden p-0">
                {record.relatedRecords.map((rel: RelatedLedgerRecord) => (
                  <li key={rel.id}>
                    <Link
                      to={`/ledger/${rel.id}`}
                      className="block px-4 py-4 no-underline transition-colors hover:bg-[color:var(--sr-dossier-inset)] focus-visible:bg-[color:var(--sr-dossier-inset)] focus-visible:outline-none"
                    >
                      <DossierLabel>{rel.relation}</DossierLabel>
                      <span className="mt-1.5 block text-sm font-medium text-ink">{rel.title}</span>
                      <span className="mt-1 block font-mono text-xs text-ink-secondary">
                        {rel.id}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="hidden lg:block" aria-label="Verification and citation tools">
          <div className="sticky top-20">
            <TrustToolsPanel
              record={record}
              citation={citation}
              verifyHref={verifyHref}
              onPrint={printPage}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function TrustToolsPanel({
  record,
  citation,
  verifyHref,
  onPrint,
}: {
  record: ReleasedRecordDossierProps['record'];
  citation: string;
  verifyHref?: string;
  onPrint: () => void;
}) {
  const isSpecimen = record.variant === 'sample';

  return (
    <div className="sr-dossier-tools overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <DossierLabel>Trust tools</DossierLabel>
        <h2 className="mt-2 mb-0 font-heading text-base font-medium text-ink">Verify &amp; cite</h2>
        <p className="mt-2 mb-0 text-xs leading-relaxed text-ink-secondary">
          {isSpecimen
            ? 'Shows the verification surface a released record carries. This specimen has no released instrument behind it, so the anchor resolves to nothing and the citation is not usable.'
            : 'Confirms the released payload has not been altered — not that the substance is true, binding, or endorsed.'}
        </p>
      </div>

      <div className="border-b border-line px-5 py-4">
        <DossierLabel>
          {isSpecimen ? 'Specimen anchor (not verifiable)' : 'Anchor hash'}
        </DossierLabel>
        <code className="mt-2 block break-all rounded-[var(--sr-radius-sm)] border border-line px-3 py-2.5 font-mono text-[0.65rem] leading-relaxed">
          {record.verificationAnchor}
        </code>
        <p className="mt-2.5 mb-0 text-xs text-ink-secondary">
          Generated ·{' '}
          {new Date(record.generatedAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </div>

      <div className="border-b border-line px-5 py-4">
        <DossierLabel>{isSpecimen ? 'Citation format (specimen)' : 'Citation'}</DossierLabel>
        <code className="mt-2 block break-words rounded-[var(--sr-radius-sm)] border border-line px-3 py-2.5 font-mono text-[0.65rem] leading-relaxed">
          {citation}
        </code>
      </div>

      <div className="flex flex-col gap-2 px-5 py-4">
        <CopyButton label="Copy record ID" getText={() => record.id} />
        <CopyButton label="Copy citation" getText={() => citation} />
        <CopyButton label="Copy anchor" getText={() => record.verificationAnchor} />
        <button
          type="button"
          onClick={onPrint}
          className="rounded-[var(--sr-radius-sm)] border border-line bg-transparent px-3 py-1.5 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-secondary transition-colors hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--sr-dossier-inset)] hover:text-ink focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--sr-bg),0_0_0_4px_var(--sr-primary)]"
        >
          Print / PDF
        </button>
        {verifyHref ? (
          <Link
            to={verifyHref}
            className="mt-1 rounded-[var(--sr-radius-sm)] border border-line px-3 py-1.5 text-center font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-secondary no-underline transition-colors hover:border-[color:var(--color-border-strong)] hover:text-ink"
          >
            How verification works →
          </Link>
        ) : (
          <Link
            to="/security#reviewers"
            className="mt-1 text-center font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-secondary no-underline underline-offset-4 hover:text-ink hover:underline"
          >
            Documented limits →
          </Link>
        )}
      </div>
    </div>
  );
}
