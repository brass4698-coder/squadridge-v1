import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DEMO_PROPOSAL_ID, DEMO_SESSION_ID } from '../lib/demoSession';

/**
 * Public SquadRidge Ledger — index is a rich preview; full content for `demo-proposal-001`.
 */
export function LedgerPage() {
  const { proposalId } = useParams<{ proposalId?: string }>();
  const isDemo = proposalId === DEMO_PROPOSAL_ID;

  if (isDemo) {
    return <LedgerDemoProposalDetail />;
  }

  return <LedgerIndex unknownProposalId={proposalId} />;
}

function LedgerDemoProposalDetail() {
  return (
    <div className="relative min-h-dvh bg-navy pb-20 pt-4 md:pt-5">
      <div className="relative z-[1] mx-auto w-full max-w-copy px-md py-10">
        <p className="mb-0 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-teal/80">
          Ledger
        </p>
        <p className="mt-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-amber/90">
          Investor demo
        </p>
        <h1
          className="mb-0 mt-2 font-heading text-ink"
          style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          Civilian protection protocols — displacement corridor
        </h1>
        <p className="mt-2 font-sans text-sm text-ink-muted">Proposal ID · {DEMO_PROPOSAL_ID}</p>

        <div className="mt-8 min-w-0 overflow-x-auto rounded-xl border border-[#1e2a3d] bg-[#0f1623]/60 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded border border-teal-500/40 bg-teal-500/10 px-2 py-0.5 font-heading text-[0.65rem] font-semibold uppercase tracking-wider text-teal-light">
              Published
            </span>
            <span className="font-sans text-xs text-ink-muted">ZK-attested summary · demo fixture</span>
          </div>

          <div className="mt-4 min-w-0 space-y-2 font-sans text-[0.85rem] leading-relaxed text-ink-secondary">
            <p className="mb-0 break-words">
              <span className="font-medium text-ink-muted">Objective.</span>{' '}
              Reduce civilian harm and miscoordination during corridor movements in a mixed-control zone.
            </p>
            <p className="mb-0 break-words">
              <span className="font-medium text-ink-muted">Scope.</span>{' '}
              Temporary displacement corridors where armed actors agree to time-boxed movement windows for civilians.
            </p>
          </div>

          <h2 className="mt-5 break-words font-heading text-section-title font-bold text-ink">Consensus output</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 font-sans text-body-lg font-normal text-ink-secondary [word-break:break-word]">
            <li>
              Corridor coordinators establish a neutral coordination frequency and a single written chain of custody for
              corridor access before any movement windows open.
            </li>
            <li>
              Corridor stewards post visible de-escalation markers at agreed intervals; if any marker is contested, all
              crossings pause for 15 minutes while the channel resolves the incident.
            </li>
            <li>
              Displaced civilians are routed through three pre-cleared nodes only; no ad-hoc detours occur without
              unanimous squad sign-off on the shared channel.
            </li>
          </ol>

          <p className="mt-5 rounded-lg border border-dashed border-[#2d3f55] bg-[#0b0f14]/80 p-4 font-sans text-[0.8rem] leading-relaxed text-ink-muted">
            <span className="block">
              <span className="font-medium text-ink-subtle">Impact note.</span>{' '}
              These rules are designed to lower the risk of cross-fire, corridor abuse, and last-minute rerouting that
              leaves families exposed in transit.
            </span>
          </p>

          <p className="mt-4 break-all rounded-lg border border-dashed border-[#2d3f55] bg-[#060a11]/90 p-3 font-mono text-[0.75rem] leading-relaxed text-ink-muted">
            ledger:root=0x7f3a…c91d · session_ref=demo-session-001 · anon_set=Semaphore:v3-demo
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-6">
          <Link to="/match" className="text-teal-light underline-offset-4 hover:underline">
            Replay match flow
          </Link>
          <Link to={`/session/${DEMO_SESSION_ID}`} className="text-teal-light underline-offset-4 hover:underline">
            Back to squad session
          </Link>
          <Link to="/ledger" className="text-ink-muted underline-offset-4 hover:text-ink-secondary hover:underline">
            All ledger entries
          </Link>
          <Link to="/" className="text-ink-muted underline-offset-4 hover:text-ink-secondary hover:underline">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

const FILTER_LABELS = ['Region', 'Topic', 'Status'] as const;

function LedgerIndex({ unknownProposalId }: { unknownProposalId?: string }) {
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [citeCopied, setCiteCopied] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const modalTitleId = useId();
  const modalDescId = useId();

  const citation = useLedgerCitation();

  const copyCitation = useCallback(() => {
    void navigator.clipboard.writeText(citation).then(() => {
      setCiteCopied(true);
      window.setTimeout(() => setCiteCopied(false), 2000);
    });
  }, [citation]);

  useEffect(() => {
    if (!ledgerModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLedgerModalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    closeBtnRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [ledgerModalOpen]);

  return (
    <div className="relative min-h-dvh bg-navy pb-20 pt-4 md:pt-5">
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-md py-8 md:py-10">
        <div className="flex flex-col gap-4 border-b border-[#1a2236]/90 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="mb-0 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-teal/80">Ledger</p>
            <h1
              className="mb-0 mt-2 flex flex-wrap items-end gap-x-3 gap-y-2 font-heading text-ink"
              style={{
                fontSize: 'clamp(1.85rem, 3.2vw, 2.65rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.08,
              }}
            >
              <span className="min-w-0">SquadRidge</span>
              <span className="min-w-0">Ledger</span>
            </h1>
            <p className="mt-3 max-w-2xl font-sans text-body-lg font-normal leading-relaxed text-ink-secondary">
              A public archive of cross-border squad consensus proposals — citable, timestamped, and verified without exposing
              who sat in the room.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLedgerModalOpen(true)}
            className="shrink-0 self-start text-left font-sans text-sm font-medium text-teal-light underline-offset-4 hover:underline md:self-auto"
          >
            What is the SquadRidge Ledger?
          </button>
        </div>

        {unknownProposalId ? (
          <p className="mt-6 rounded-lg border border-amber/25 bg-amber/5 px-4 py-3 font-sans text-sm text-ink-secondary">
            No public entry for <span className="font-mono text-ink-muted">{unknownProposalId}</span> yet. Browse the ledger
            below or start from a squad session when entries go live.
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-2" role="toolbar" aria-label="Ledger filters (coming soon)">
          {FILTER_LABELS.map((label) => (
            <button
              key={label}
              type="button"
              disabled
              title="Coming soon"
              aria-disabled="true"
              className="cursor-not-allowed rounded-full border border-[#2d3f55]/90 bg-[#0d121c]/80 px-3 py-1.5 font-heading text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle opacity-80"
            >
              {label}
            </button>
          ))}
          <span className="font-sans text-xs text-ink-subtle">Filters ship with search in a later release.</span>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_min(22rem,100%)] lg:items-start lg:gap-12">
          <div className="min-w-0">
            <h2 className="font-heading text-section-title font-bold text-ink">Entries</h2>
            <p className="mt-1 font-sans text-sm text-ink-muted">Published proposals appear here as squads finalize consensus.</p>

            <div className="mt-6 rounded-xl border border-[#1e2a3a] bg-[#0c1018]/80">
              <div className="hidden overflow-x-auto overscroll-x-contain md:block">
                <table className="w-full min-w-[52rem] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#1e2a3a] bg-[#0a0e14]/90">
                      <th className="px-4 py-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                        Date
                      </th>
                      <th className="px-4 py-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                        Topic
                      </th>
                      <th className="px-4 py-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                        Summary
                      </th>
                      <th className="px-4 py-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                        Tags
                      </th>
                      <th className="px-4 py-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                        <span className="sr-only">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-sans text-sm text-ink-secondary">
                    <LedgerDemoRowDesktop
                      date="2026-03-18"
                      topic="Climate & corridors"
                      summary="Example proposal from a cross-border climate squad: coordinated civilian movement and de-escalation markers."
                      tags={['Climate', 'Displacement']}
                      href={`/ledger/${DEMO_PROPOSAL_ID}`}
                      demo
                    />
                    <LedgerDemoRowDesktop
                      date="2026-02-02"
                      topic="Watershed governance"
                      summary="Illustrative entry: shared monitoring commitments across a transboundary basin (preview)."
                      tags={['Water', 'Governance']}
                      href={null}
                      demo
                    />
                    <LedgerSkeletonRows count={3} />
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-[#1e2a3a] md:hidden">
                <LedgerDemoCard
                  date="2026-03-18"
                  topic="Climate & corridors"
                  summary="Example proposal from a cross-border climate squad: coordinated civilian movement and de-escalation markers."
                  tags={['Climate', 'Displacement']}
                  href={`/ledger/${DEMO_PROPOSAL_ID}`}
                  demo
                />
                <LedgerDemoCard
                  date="2026-02-02"
                  topic="Watershed governance"
                  summary="Illustrative entry: shared monitoring commitments across a transboundary basin (preview)."
                  tags={['Water', 'Governance']}
                  href={null}
                  demo
                />
                <LedgerSkeletonCards count={2} />
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <Link
                to="/onboarding"
                className="btn-primary inline-flex min-h-[44px] max-w-max items-center justify-center px-6 py-2.5 font-heading text-[0.95rem] font-semibold"
              >
                Form a squad to publish your own proposal
              </Link>
              <Link to="/" className="font-sans text-sm text-ink-muted underline-offset-4 hover:text-ink-secondary hover:underline">
                Back to home
              </Link>
            </div>
          </div>

          <aside className="min-w-0 space-y-8 lg:sticky lg:top-24">
            <section className="rounded-xl border border-[#1e2a3a] bg-[#0f1623]/50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <h2 className="font-heading text-[0.95rem] font-bold text-ink">How entries work</h2>
              <ul className="mt-4 list-none space-y-4 font-sans text-[0.875rem] leading-relaxed text-ink-secondary">
                <li>
                  <span className="font-medium text-ink-muted">Publishing.</span> When a squad closes a session with consensus,
                  the platform derives a compact proposal — not a transcript — and commits it to the ledger with a public
                  timestamp.
                </li>
                <li>
                  <span className="font-medium text-ink-muted">Anonymous, verifiable.</span> Identities stay off the record;
                  zero-knowledge proofs and cryptographic commitments let readers trust the outcome without learning who was in
                  the room.
                </li>
                <li>
                  <span className="font-medium text-ink-muted">Time &amp; immutability.</span> Each entry is anchored in time;
                  the content you cite is the content that was attested — not silently edited later.
                </li>
              </ul>
            </section>

            <section className="rounded-xl border border-[#1e2a3a] bg-[#0a0e14]/60 p-5">
              <h2 className="font-heading text-[0.95rem] font-bold text-ink">How to cite this</h2>
              <p className="mt-2 font-sans text-[0.8125rem] leading-relaxed text-ink-muted">
                Use this format for reports, footnotes, or policy annexes. Date reflects when you retrieved the page.
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-[#1e2a3a] bg-[#070b10] p-3 font-mono text-[0.7rem] leading-relaxed text-ink-muted">
                {citation}
              </pre>
              <button
                type="button"
                onClick={copyCitation}
                className="mt-3 inline-flex min-h-[40px] items-center rounded-lg border border-[#2d3f55] bg-transparent px-4 py-2 font-heading text-[0.8rem] font-medium text-teal-light transition-colors hover:border-teal/40 hover:bg-white/[0.02]"
              >
                {citeCopied ? 'Copied' : 'Copy citation'}
              </button>
            </section>
          </aside>
        </div>
      </div>

      {ledgerModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setLedgerModalOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            aria-describedby={modalDescId}
            className="relative z-10 max-h-[min(90vh,32rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#1e2a3a] bg-[#0f1623] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
          >
            <h2 id={modalTitleId} className="font-heading text-section-title font-bold text-ink">
              What is the SquadRidge Ledger?
            </h2>
            <div id={modalDescId} className="mt-4 space-y-4 font-sans text-body-lg font-normal leading-relaxed text-ink-secondary">
              <p className="mb-0">
                The Ledger is the public record of private dialogue: a place where squads leave a durable, citable summary of
                what they agreed—without exposing who was there or every word that was said.
              </p>
              <p className="mb-0">
                It exists so journalists, donors, and institutions can point to outcomes that matter across borders while
                participants stay protected. Each line is tied to verification and time, not to dossiers.
              </p>
              <p className="mb-0">
                SquadRidge is infrastructure for conversations that cannot happen in public. The Ledger is how those
                conversations leave a trace that still holds up in the open.
              </p>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={() => setLedgerModalOpen(false)}
              className="btn-primary mt-8 w-full min-h-[44px] sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function useLedgerCitation(): string {
  const [line, setLine] = useState(
    () =>
      `SquadRidge Ledger. “Civilian protection protocols — displacement corridor” (example entry). Retrieved ${todayIso()}, from ${typeof window !== 'undefined' ? window.location.origin : 'https://squadridge.example'}/ledger.`,
  );
  useEffect(() => {
    setLine(
      `SquadRidge Ledger. “Civilian protection protocols — displacement corridor” (example entry). Retrieved ${todayIso()}, from ${window.location.origin}/ledger.`,
    );
  }, []);
  return line;
}

function todayIso(): string {
  try {
    return new Date().toISOString().slice(0, 10);
  } catch {
    return 'YYYY-MM-DD';
  }
}

function LedgerDemoRowDesktop({
  date,
  topic,
  summary,
  tags,
  href,
  demo,
}: {
  date: string;
  topic: string;
  summary: string;
  tags: readonly string[];
  href: string | null;
  demo: boolean;
}) {
  return (
    <tr className="border-b border-[#1e2a3a]/80 align-top">
      <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-ink-muted">{date}</td>
      <td className="min-w-[8rem] px-4 py-4 align-top font-medium break-words text-ink">{topic}</td>
      <td className="min-w-[12rem] px-4 py-4 align-top break-words text-ink-secondary">{summary}</td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="rounded border border-[#2d3f55]/80 bg-[#0b0f14] px-2 py-0.5 text-[0.65rem] text-ink-muted">
              {t}
            </span>
          ))}
        </div>
      </td>
      <td className="min-w-[9.5rem] whitespace-nowrap px-4 py-4 align-top">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {demo ? (
            <span className="shrink-0 rounded border border-amber/30 bg-amber/10 px-1.5 py-0.5 font-heading text-[0.6rem] font-semibold uppercase tracking-wider text-amber/95">
              Demo data
            </span>
          ) : null}
          {href ? (
            <Link to={href} className="shrink-0 font-medium text-teal-light underline-offset-4 hover:underline">
              View proposal
            </Link>
          ) : (
            <button
              type="button"
              disabled
              title="Coming soon"
              className="cursor-not-allowed shrink-0 font-medium text-ink-subtle opacity-60"
            >
              View proposal
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function LedgerDemoCard({
  date,
  topic,
  summary,
  tags,
  href,
  demo,
}: {
  date: string;
  topic: string;
  summary: string;
  tags: readonly string[];
  href: string | null;
  demo: boolean;
}) {
  return (
    <article className="min-w-0 px-4 py-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <time className="font-mono text-xs text-ink-muted">{date}</time>
        {demo ? (
          <span className="rounded border border-amber/30 bg-amber/10 px-1.5 py-0.5 font-heading text-[0.6rem] font-semibold uppercase tracking-wider text-amber/95">
            Demo data
          </span>
        ) : null}
      </div>
      <h3 className="mt-2 break-words font-heading text-[1.05rem] font-bold text-ink">{topic}</h3>
      <p className="mt-2 break-words font-sans text-sm leading-relaxed text-ink-secondary">{summary}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="rounded border border-[#2d3f55]/80 bg-[#0b0f14] px-2 py-0.5 text-[0.65rem] text-ink-muted">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-4 min-w-0 pb-1">
        {href ? (
          <Link
            to={href}
            className="inline-block max-w-full break-words font-medium text-teal-light underline-offset-4 hover:underline"
          >
            View proposal →
          </Link>
        ) : (
          <button type="button" disabled title="Coming soon" className="cursor-not-allowed text-ink-subtle opacity-60">
            View proposal
          </button>
        )}
      </div>
    </article>
  );
}

function LedgerSkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <tr key={i} className="border-b border-[#1e2a3a]/50 align-top animate-pulse">
          <td className="px-4 py-4">
            <div className="h-3 w-20 rounded bg-[#1e2a3a]/90" />
          </td>
          <td className="px-4 py-4">
            <div className="h-3 w-28 rounded bg-[#1e2a3a]/90" />
          </td>
          <td className="px-4 py-4">
            <div className="space-y-2">
              <div className="h-3 max-w-[12rem] rounded bg-[#1e2a3a]/80" />
              <div className="h-3 max-w-[9rem] rounded bg-[#1e2a3a]/60" />
            </div>
          </td>
          <td className="px-4 py-4">
            <div className="flex gap-1.5">
              <div className="h-5 w-12 rounded bg-[#1e2a3a]/70" />
              <div className="h-5 w-14 rounded bg-[#1e2a3a]/70" />
            </div>
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-24 rounded bg-[#1e2a3a]/70" />
          </td>
        </tr>
      ))}
    </>
  );
}

function LedgerSkeletonCards({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse px-4 py-5">
          <div className="h-3 w-24 rounded bg-[#1e2a3a]/90" />
          <div className="mt-3 h-4 w-3/4 max-w-xs rounded bg-[#1e2a3a]/80" />
          <div className="mt-2 h-3 w-full max-w-md rounded bg-[#1e2a3a]/60" />
          <div className="mt-2 h-3 w-11/12 max-w-sm rounded bg-[#1e2a3a]/50" />
          <div className="mt-4 flex gap-2">
            <div className="h-5 w-14 rounded bg-[#1e2a3a]/70" />
            <div className="h-5 w-16 rounded bg-[#1e2a3a]/70" />
          </div>
          <div className="mt-4 h-4 w-28 rounded bg-[#1e2a3a]/70" />
        </div>
      ))}
    </>
  );
}
