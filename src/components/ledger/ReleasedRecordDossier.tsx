import { useCallback, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../StatusBadge';
import { VerificationAnchorBadge } from '../shared/VerificationAnchorBadge';
import { publicShellInnerClass } from '../layout/publicShellTokens';
import type { LedgerRecordDetail, RelatedLedgerRecord } from '../../data/sampleRecords';

const SECTIONS = [
  { id: 'release-summary', label: 'Release summary' },
  { id: 'outcome-summary', label: 'Outcome summary' },
  { id: 'approved-text', label: 'Approved text' },
  { id: 'process-note', label: 'Process note' },
  { id: 'scope-limits', label: 'Scope & limits' },
  { id: 'verification', label: 'Verification' },
  { id: 'citation', label: 'Citation & export' },
  { id: 'related', label: 'Related records' },
] as const;

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
      className="rounded-sm border border-line bg-surface-elevated px-3 py-1.5 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-secondary transition-colors hover:border-brand/40 hover:text-ink"
    >
      {done ? 'Copied' : label}
    </button>
  );
}

function MetaCell({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-t border-line pt-3 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0 first:border-l-0 first:pl-0 first:pt-0 first:border-t-0">
      <dt className="font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
        {label}
      </dt>
      <dd className="m-0 text-sm leading-snug text-ink">{value}</dd>
    </div>
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
 * Institution-grade released record dossier — room stays private; this is the public artifact.
 */
export function ReleasedRecordDossier({
  record,
  citation,
  verifyHref,
  illustrativeNotice,
}: ReleasedRecordDossierProps) {
  const printPage = () => window.print();

  return (
    <div className="sr-mode-ledger pb-20">
      <header className="border-b border-[color:var(--sr-mode-ledger-border)] bg-surface-sunken/40">
        <div className={`${publicShellInnerClass} py-10 md:py-14`}>
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 font-mono text-xs text-ink-secondary">
              <li>
                <Link to="/ledger" className="hover:underline">
                  Ledger
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li className="truncate text-ink">{record.title}</li>
            </ol>
          </nav>

          {illustrativeNotice ? (
            <p className="mb-5 max-w-3xl border border-sem-warning/30 bg-sem-warning-soft px-4 py-3 text-sm leading-relaxed text-ink-secondary">
              <span className="font-medium text-ink">Illustrative sample.</span>{' '}
              {illustrativeNotice}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge variant="published">Released outcome</StatusBadge>
            {record.variant === 'sample' ? (
              <StatusBadge variant="illustrative">Illustrative</StatusBadge>
            ) : (
              <StatusBadge variant="governed">Live release</StatusBadge>
            )}
            <VerificationAnchorBadge
              anchorId={record.id}
              status={record.anchorStatus ?? 'verified'}
            />
          </div>

          <p className="mt-5 font-mono text-xs text-ink-faint">Record ID · {record.id}</p>
          <h1 className="mt-3 max-w-4xl font-display text-display font-medium tracking-tight text-ink">
            {record.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-secondary">
            Approved outcomes only. The private session room is not public. Outsiders can verify
            integrity of this released instrument without accessing the conversation that produced
            it.
          </p>
        </div>
      </header>

      <div
        className={`${publicShellInnerClass} mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-14`}
      >
        <div className="min-w-0">
          <nav
            className="mb-10 flex flex-wrap gap-2 border-b border-line pb-4 lg:sticky lg:top-16 lg:z-10 lg:bg-surface/95 lg:backdrop-blur-sm"
            aria-label="Record sections"
          >
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="sr-interactive rounded-sm border border-line px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint no-underline hover:border-brand/40 hover:text-ink"
              >
                {s.label}
              </a>
            ))}
          </nav>

          <section id="release-summary" className="scroll-mt-28">
            <h2 className="font-display text-xl font-medium text-ink">Release summary</h2>
            <dl className="mt-5 grid gap-4 rounded-lg border border-line bg-surface-elevated p-5 sm:grid-cols-2 lg:grid-cols-3">
              <MetaCell label="Releasing body" value={record.org} />
              <MetaCell label="Region" value={record.region} />
              <MetaCell label="Released" value={record.releasedDate} />
              <MetaCell label="Session date" value={record.sessionDate} />
              <MetaCell label="Record type" value={record.outcomeType} />
              <MetaCell label="Process type" value={record.processType} />
              <MetaCell label="Visibility" value={record.visibilityClass} />
              {typeof record.participantCount === 'number' ? (
                <MetaCell
                  label="Verified parties (count)"
                  value={`${record.participantCount} — identities not public`}
                />
              ) : (
                <MetaCell label="Participants" value="Identities not public" />
              )}
              <MetaCell label="Publication mode" value="Facilitator-governed · no auto-publish" />
            </dl>
          </section>

          <section id="outcome-summary" className="mt-12 scroll-mt-28">
            <h2 className="font-display text-xl font-medium text-ink">Outcome summary</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              Plain-language scan of what this release contains. The official instrument follows.
            </p>
            <ul className="mt-5 m-0 list-none space-y-3 border-l-2 border-brand/40 pl-4 p-0">
              {record.outcomeSummary.map((bullet) => (
                <li key={bullet} className="text-sm leading-relaxed text-ink">
                  {bullet}
                </li>
              ))}
            </ul>
          </section>

          <section id="approved-text" className="mt-12 scroll-mt-28">
            <h2 className="font-display text-xl font-medium text-ink">Approved outcome text</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              Official released instrument. Not a transcript of the private room.
            </p>
            <div className="sr-evidence-frame mt-5 p-6 md:p-8">
              <pre className="m-0 whitespace-pre-wrap font-mono text-sm leading-relaxed text-ink">
                {record.body}
              </pre>
            </div>
          </section>

          <section id="process-note" className="mt-12 scroll-mt-28">
            <h2 className="font-display text-xl font-medium text-ink">Process and release note</h2>
            <div className="mt-5 rounded-lg border border-line bg-surface-sunken/50 p-5 text-sm leading-relaxed text-ink-secondary">
              <p className="m-0">{record.processNote}</p>
              <p className="mt-4 mb-0 text-ink-faint">
                Trust comes from boundaries, approvals, and verifiable release — not exposure.
              </p>
            </div>
          </section>

          <section id="scope-limits" className="mt-12 scroll-mt-28">
            <h2 className="font-display text-xl font-medium text-ink">Scope and limits</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-line bg-surface-elevated p-5">
                <h3 className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
                  This record confirms
                </h3>
                <ul className="mt-3 m-0 list-disc space-y-2 pl-5 text-sm text-ink-secondary">
                  {record.scopeConfirms.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-line bg-surface-elevated p-5">
                <h3 className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
                  Intentionally omitted
                </h3>
                <ul className="mt-3 m-0 list-disc space-y-2 pl-5 text-sm text-ink-secondary">
                  {record.scopeDoesNot.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-ink-faint">
              Documented limits: we reduce exposure by design. We do not claim full platform
              zero-knowledge or Signal-grade E2E today. Anonymity is not guaranteed. This record is
              not legal privilege advice.
            </p>
          </section>

          <section id="verification" className="mt-12 scroll-mt-28 lg:hidden">
            <VerificationPanel record={record} verifyHref={verifyHref} citation={citation} />
          </section>

          <section id="citation" className="mt-12 scroll-mt-28">
            <h2 className="font-display text-xl font-medium text-ink">Citation and export</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              Operational controls for institutional review, journalism, and audit trails.
            </p>
            <code className="mt-5 block break-words rounded-lg border border-line bg-surface-sunken px-4 py-3 font-mono text-xs leading-relaxed text-ink-secondary">
              {citation}
            </code>
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyButton label="Copy record ID" getText={() => record.id} />
              <CopyButton label="Copy citation" getText={() => citation} />
              <CopyButton label="Copy anchor" getText={() => record.verificationAnchor} />
              <button
                type="button"
                onClick={printPage}
                className="rounded-sm border border-line bg-surface-elevated px-3 py-1.5 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-secondary transition-colors hover:border-brand/40 hover:text-ink"
              >
                Print / PDF
              </button>
            </div>
          </section>

          <section id="related" className="mt-12 scroll-mt-28">
            <h2 className="font-display text-xl font-medium text-ink">Related records</h2>
            {record.relatedRecords.length === 0 ? (
              <p className="mt-3 text-sm text-ink-faint">
                No linked follow-up, amendment, or implementation checkpoint on this illustrative
                record.
              </p>
            ) : (
              <ul className="mt-5 m-0 list-none divide-y divide-line border border-line p-0">
                {record.relatedRecords.map((rel: RelatedLedgerRecord) => (
                  <li key={rel.id}>
                    <Link
                      to={`/ledger/${rel.id}`}
                      className="block px-4 py-4 no-underline transition-colors hover:bg-surface-sunken"
                    >
                      <span className="block font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
                        {rel.relation}
                      </span>
                      <span className="mt-1 block text-sm font-medium text-ink">{rel.title}</span>
                      <span className="mt-1 block font-mono text-xs text-ink-faint">{rel.id}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4" id="verification-aside">
            <VerificationPanel record={record} verifyHref={verifyHref} citation={citation} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function VerificationPanel({
  record,
  verifyHref,
  citation: _citation,
}: {
  record: ReleasedRecordDossierProps['record'];
  verifyHref?: string;
  citation: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-elevated p-5">
      <h2 className="m-0 font-display text-base font-medium text-ink">Verification</h2>
      <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
        Confirms the released payload has not been altered — not that the substance is true,
        binding, or endorsed by SquadRidge.
      </p>
      <p className="mt-4 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
        Anchor hash
      </p>
      <code className="mt-2 block break-all rounded-sm border border-line bg-surface-sunken px-3 py-2 font-mono text-[0.65rem] leading-relaxed text-ink-secondary">
        {record.verificationAnchor}
      </code>
      <p className="mt-3 text-xs text-ink-faint">
        Generated ·{' '}
        {new Date(record.generatedAt).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <CopyButton label="Copy anchor" getText={() => record.verificationAnchor} />
        {verifyHref ? (
          <Link
            to={verifyHref}
            className="rounded-sm border border-brand/40 bg-brand-soft px-3 py-1.5 text-center font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-brand no-underline"
          >
            How verification works →
          </Link>
        ) : (
          <Link
            to="/security#reviewers"
            className="text-center font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-brand no-underline hover:underline"
          >
            Documented limits →
          </Link>
        )}
      </div>
      <details className="mt-4 text-xs text-ink-secondary">
        <summary className="cursor-pointer font-medium text-ink">How verification works</summary>
        <p className="mt-2 mb-0 leading-relaxed">
          A verification anchor binds the approved outcome text at release. Reviewers can recompute
          and compare hashes where live verification is available. Private NGO releases may not
          appear on the public ledger. Session transcripts are never part of the anchor.
        </p>
      </details>
    </div>
  );
}
