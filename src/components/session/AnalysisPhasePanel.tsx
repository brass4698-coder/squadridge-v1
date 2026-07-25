import { useEffect, useState } from 'react';
import {
  Brain,
  Landmark,
  Vote,
  Users,
  Newspaper,
  Heart,
  ArrowRight,
  Loader2,
  FileText,
} from 'lucide-react';
import type {
  SessionAnalysisResult,
  LensAnalysis,
  RankedProposal,
  StakeholderLensId,
} from '../../lib/sessionPhases';

const LENS_ICONS: Record<StakeholderLensId, typeof Landmark> = {
  government: Landmark,
  political: Vote,
  public: Users,
  media: Newspaper,
  peace: Heart,
};

const LENS_COLORS: Record<StakeholderLensId, string> = {
  government: 'border-l-trust-blue text-trust-blue',
  political: 'border-l-amber text-amber-light',
  public: 'border-l-teal text-teal',
  media: 'border-l-sem-info text-sem-info',
  peace: 'border-l-brand text-brand',
};

interface AnalysisPhasePanelProps {
  analysis: SessionAnalysisResult | null;
  isLoading: boolean;
  onTriggerAnalysis: () => void;
  phase: 'analysis' | 'complete';
}

/**
 * AnalysisPhasePanel — AI feasibility analysis through 5 stakeholder lenses.
 *
 * During `analysis` phase: Shows animated processing indicator.
 * During `complete` phase: Shows full results with lens cards, ranked proposals,
 * and synthesis statement ready for ledger publishing.
 */
export function AnalysisPhasePanel({
  analysis,
  isLoading,
  onTriggerAnalysis,
  phase,
}: AnalysisPhasePanelProps) {
  // Auto-trigger analysis when entering the analysis phase
  useEffect(() => {
    if (phase === 'analysis' && !analysis && !isLoading) {
      onTriggerAnalysis();
    }
  }, [phase, analysis, isLoading, onTriggerAnalysis]);

  if (phase === 'analysis' && !analysis) {
    return <AnalysisProcessing />;
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <Brain className="size-10 text-ink-subtle" />
        <p className="font-sans text-[0.88rem] text-ink-secondary">
          Analysis results are not available yet.
        </p>
        <button
          type="button"
          onClick={onTriggerAnalysis}
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? 'Processing…' : 'Run Analysis'}
        </button>
      </div>
    );
  }

  return (
    <div className="sr-page-enter space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-brand/20 bg-brand/[0.03] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 items-center justify-center rounded-xl border border-brand/25 bg-brand/[0.08] text-brand">
            <Brain className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-brand">
              Feasibility analysis
            </p>
            <p className="font-sans text-[1rem] font-semibold text-ink">
              Stakeholder Lens Evaluation
            </p>
          </div>
        </div>
        <p className="mt-3 font-sans text-[0.85rem] leading-relaxed text-ink-secondary">
          Each proposal has been evaluated through 5 stakeholder lenses to assess real-world
          feasibility, risks, and implementation pathways.
        </p>
      </div>

      {/* Synthesis statement */}
      {analysis.synthesisStatement ? (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface-hover/20 px-5 py-4">
          <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
            Synthesis
          </p>
          <p className="mt-2 font-heading text-[1.05rem] leading-relaxed text-ink italic">
            {analysis.synthesisStatement}
          </p>
        </div>
      ) : null}

      {/* Stakeholder lens cards */}
      <div className="space-y-3">
        <h3 className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink-subtle">
          Stakeholder lenses
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {analysis.lenses.map((lens) => (
            <LensCard key={lens.lensId} lens={lens} />
          ))}
        </div>
      </div>

      {/* Ranked proposals */}
      {analysis.rankedProposals.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink-subtle">
            Ranked proposals
          </h3>
          <div className="space-y-3">
            {analysis.rankedProposals.map((proposal) => (
              <ProposalCard key={proposal.rank} proposal={proposal} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Ledger CTA */}
      <div className="flex items-center justify-between rounded-xl border border-brand/20 bg-brand/[0.04] px-5 py-4">
        <div className="flex items-center gap-3">
          <FileText className="size-5 text-brand" />
          <div>
            <p className="font-sans text-[0.88rem] font-semibold text-ink">Ready for the ledger</p>
            <p className="font-sans text-[0.75rem] text-ink-faint">
              Use the consensus panel below to draft and vote on the final proposal.
            </p>
          </div>
        </div>
        <ArrowRight className="size-5 text-brand/50" />
      </div>
    </div>
  );
}

// ── Processing animation ────────────────────────────────────────────

function AnalysisProcessing() {
  const [currentLens, setCurrentLens] = useState(0);
  const lensNames = ['Government', 'Political', 'Public', 'Media', 'Peacebuilding'];

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentLens((prev) => (prev + 1) % lensNames.length);
    }, 2800);
    return () => clearInterval(id);
  }, [lensNames.length]);

  return (
    <div className="sr-page-enter flex flex-col items-center justify-center gap-6 py-16 text-center">
      {/* Animated brain */}
      <div className="relative">
        <div className="inline-flex size-20 items-center justify-center rounded-2xl border border-brand/25 bg-brand/[0.08] text-brand">
          <Brain className="size-9" strokeWidth={1.5} />
        </div>
        <span className="absolute inset-0 rounded-2xl border border-brand/20 animate-ping" />
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-brand text-[0.6rem] font-bold text-surface">
          <Loader2 className="size-3 animate-spin" />
        </span>
      </div>

      <div>
        <p className="font-sans text-[1rem] font-semibold text-ink">
          Analyzing through stakeholder lenses
        </p>
        <p className="mt-2 font-mono text-[0.78rem] text-brand transition-all duration-500">
          {lensNames[currentLens]} perspective...
        </p>
      </div>

      <div className="flex items-center gap-2">
        {lensNames.map((_, idx) => (
          <span
            key={idx}
            className={`size-2 rounded-full transition-all duration-300 ${
              idx === currentLens
                ? 'scale-125 bg-brand'
                : idx < currentLens
                  ? 'bg-brand/40'
                  : 'bg-surface-hover'
            }`}
          />
        ))}
      </div>

      <p className="max-w-sm font-sans text-[0.78rem] leading-relaxed text-ink-faint">
        All inputs and negotiation dialogue are being evaluated for feasibility across government,
        political, public, media, and peacebuilding dimensions.
      </p>
    </div>
  );
}

// ── Lens Card ───────────────────────────────────────────────────────

function LensCard({ lens }: { lens: LensAnalysis }) {
  const Icon = LENS_ICONS[lens.lensId];
  const colorClass = LENS_COLORS[lens.lensId] ?? 'border-l-white/20 text-ink';

  const scoreColor =
    lens.feasibilityScore >= 70
      ? 'text-sem-success'
      : lens.feasibilityScore >= 40
        ? 'text-amber-light'
        : 'text-sem-danger';

  return (
    <div
      className={`card-lift rounded-xl border border-line border-l-[3px] bg-surface-elevated ${colorClass.split(' ')[0]} overflow-hidden`}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon ? <Icon className={`size-4 ${colorClass.split(' ')[1]}`} /> : null}
            <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-faint">
              {lens.lensId}
            </span>
          </div>
          <span className={`font-mono text-[1.1rem] font-bold tabular-nums ${scoreColor}`}>
            {lens.feasibilityScore}
          </span>
        </div>
        <p className="mt-2 font-sans text-[0.78rem] leading-relaxed text-ink-secondary">
          {lens.rationale}
        </p>
        {lens.risks.length > 0 ? (
          <div className="mt-2">
            <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-sem-danger/70">
              Risks
            </p>
            <ul className="mt-1 space-y-0.5">
              {lens.risks.slice(0, 2).map((r, i) => (
                <li key={i} className="font-sans text-[0.72rem] text-ink-faint">
                  • {r}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {lens.opportunities.length > 0 ? (
          <div className="mt-2">
            <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-sem-success/70">
              Opportunities
            </p>
            <ul className="mt-1 space-y-0.5">
              {lens.opportunities.slice(0, 2).map((o, i) => (
                <li key={i} className="font-sans text-[0.72rem] text-ink-faint">
                  • {o}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── Proposal Card ───────────────────────────────────────────────────

function ProposalCard({ proposal }: { proposal: RankedProposal }) {
  const scoreColor =
    proposal.overallFeasibility >= 70
      ? 'text-sem-success border-sem-success/30 bg-sem-success/[0.04]'
      : proposal.overallFeasibility >= 40
        ? 'text-amber-light border-amber/30 bg-amber/[0.04]'
        : 'text-sem-danger border-sem-danger/30 bg-sem-danger/[0.04]';

  return (
    <div className="card-lift rounded-xl border border-line bg-surface-elevated overflow-hidden">
      <div className="flex items-start gap-4 px-5 py-4">
        {/* Rank badge */}
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl border font-mono text-[1rem] font-bold ${scoreColor}`}
        >
          #{proposal.rank}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-sans text-[0.92rem] font-semibold text-ink">{proposal.title}</h4>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[0.72rem] font-bold tabular-nums ${scoreColor}`}
            >
              {proposal.overallFeasibility}%
            </span>
          </div>
          <p className="mt-1.5 font-sans text-[0.82rem] leading-relaxed text-ink-secondary">
            {proposal.description}
          </p>

          {proposal.actionItems.length > 0 ? (
            <div className="mt-3">
              <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                Action items
              </p>
              <ul className="mt-1.5 space-y-1">
                {proposal.actionItems.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 font-sans text-[0.78rem] text-ink-faint"
                  >
                    <ArrowRight className="mt-0.5 size-3 shrink-0 text-brand/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {proposal.sourceParticipants.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {proposal.sourceParticipants.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-line bg-surface-hover/40 px-2 py-0.5 font-mono text-[0.62rem] text-ink-subtle"
                >
                  {p}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default AnalysisPhasePanel;
