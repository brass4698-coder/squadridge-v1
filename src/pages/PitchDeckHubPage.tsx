/* DEFERRED: pilot-first — internal pitch deck ops hub. Not part of MVP demo.
   Gated to super_admin at /pitch-deck-hub (App.v2.tsx). */
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Copy,
  Eye,
  FileStack,
  Filter,
  Layers,
  MoreHorizontal,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { runConsistencyCheck } from '../pitch-deck-hub/consistencyChecker';
import { buildFinancialModel, formatUsd } from '../pitch-deck-hub/financialEngine';
import type {
  DeckAudience,
  DeckReadiness,
  DeckStatus,
  DataIntegrityLabel,
  EvidenceItem,
  FinancialAssumptions,
  FinancialScenario,
  MessagingLayer,
  PitchDeck,
} from '../pitch-deck-hub/types';
import { pitchDeckHubHtmlFileNameForDeck } from '../pitch-deck-hub/deckHtmlRoutes';
import {
  labelForConfidence,
  labelForStatus,
  usePitchDeckHubStore,
} from '../pitch-deck-hub/usePitchDeckHubStore';
import { SquadLogo } from '../components/SquadLogo';
import { SquadRidgeWordmark } from '../components/SquadRidgeWordmark';
import { cn } from '../lib/cn';

const AUDIENCE_LABEL: Record<DeckAudience, string> = {
  investors: 'Investors',
  pilots_partners: 'Pilots & partners',
  policy_government: 'Policy & peacebuilding',
  technical_diligence: 'Technical diligence',
  facilitators_demos: 'Facilitators & demos',
  financial_appendix: 'Financial appendix',
};

const HUB_NAV = [
  { id: 'hub-overview', label: 'Overview' },
  { id: 'hub-messaging', label: 'Messaging' },
  { id: 'hub-financial', label: 'Financial' },
  { id: 'hub-evidence', label: 'Evidence' },
  { id: 'hub-consistency', label: 'Consistency' },
] as const;

const pitchDeckHubBase = `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}pitch-deck-hub/`;

function viewDeckHrefForId(deckId: string): string {
  return `${pitchDeckHubBase}${pitchDeckHubHtmlFileNameForDeck(deckId)}`;
}

const MESSAGING_FIELD_LABELS: Record<keyof MessagingLayer, string> = {
  masterPositioning: 'Master positioning',
  conflictPreventionThesis: 'Conflict prevention thesis (shipped vs roadmap)',
  oneLine: 'One line',
  threeLine: 'Three lines',
  mission: 'Mission',
  problemStatement: 'Problem statement',
  solutionStatement: 'Solution statement',
  detectionMechanism: 'Pillar: Detection',
  interventionProtocol: 'Pillar: Intervention',
  impactMeasurement: 'Pillar: Impact & measurement',
  whyNow: 'Why now',
  trustModel: 'Trust model',
  coreDifferentiators: 'Core differentiators',
  proofPoints: 'Proof points',
  toneRules: 'Tone rules',
  bannedPhrases: 'Banned phrases',
};

// Typed as Record<keyof FinancialAssumptions, string> so TypeScript will error
// at compile time if a new FinancialAssumptions field is added without a label here.
const ASSUMPTION_LABELS: Record<keyof FinancialAssumptions, string> = {
  modelStartISO: 'Model start date',
  monthlyHorizonMonths: 'Horizon (months)',
  startingCashUsd: 'Starting cash (USD)',
  pricePerPilotSeatMonthUsd: 'Price per pilot seat / month (USD)',
  targetPayingSeatsMonth12: 'Paying seats target at month 12',
  seatRampMonths: 'Seat ramp period (months)',
  headcountFteMonth0: 'Headcount at month 0 (FTE)',
  headcountFteMonth12: 'Headcount at month 12 (FTE)',
  headcountFteMonth24: 'Headcount at month 24 (FTE)',
  fullyLoadedCostPerFteAnnualUsd: 'Fully-loaded FTE cost / year (USD)',
  monthlyInfrastructureUsd: 'Monthly infrastructure (USD)',
  monthlyLegalComplianceUsd: 'Monthly legal & compliance (USD)',
  monthlySalesMarketingUsd: 'Monthly sales & marketing (USD)',
  monthlyContractorsUsd: 'Monthly contractors (USD)',
  contingencyRate: 'Contingency rate (e.g. 0.08 = 8%)',
  fundraisingAskUsd: 'Fundraising ask (USD)',
  milestoneFirstTranche: 'First tranche milestone',
};

function Badge({
  children,
  variant = 'neutral',
  subtle = false,
}: {
  children: React.ReactNode;
  variant?: 'neutral' | 'teal' | 'amber' | 'danger' | 'muted';
  /** Smaller caps chip (legacy) vs calmer mixed-case meta */
  subtle?: boolean;
}) {
  const styles = {
    neutral: 'border-white/[0.08] bg-white/[0.04] text-[#cbd5e1]',
    teal: 'border-teal/30 bg-teal/10 text-teal-light',
    amber: 'border-amber/35 bg-amber/10 text-amber-light',
    danger: 'border-red-500/35 bg-red-500/10 text-red-300',
    muted: 'border-white/[0.06] bg-[#0c1219] text-[#94a3b8]',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-[0.65rem] font-medium',
        subtle
          ? 'normal-case tracking-normal text-[#94a3b8]'
          : 'font-semibold uppercase tracking-[0.1em]',
        styles[variant],
      )}
    >
      {children}
    </span>
  );
}

function evidenceAccent(dataLabel: DataIntegrityLabel, approvedForExternal: boolean): string {
  if (!approvedForExternal) return 'border-l-amber-400/70';
  if (dataLabel === 'input_required' || dataLabel === 'pending_validation')
    return 'border-l-amber-500/60';
  if (dataLabel === 'illustrative_only') return 'border-l-slate-500/60';
  return 'border-l-teal/50';
}

function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[7.5rem] border-t border-white/[0.06] pt-12 sm:pt-14">
      <p className="font-sans text-[0.75rem] font-medium tracking-wide text-teal/85">{eyebrow}</p>
      <h2 className="mt-2 font-heading text-fluid-h2 font-extrabold text-[#f1f5f9]">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-copy font-sans text-[0.92rem] leading-relaxed text-[#94a3b8]">
          {description}
        </p>
      ) : null}
      <div className="mt-10">{children}</div>
    </section>
  );
}

function ReadinessBar({ done, total }: { done: number; total: number }) {
  if (total <= 0) return null;
  const pct = Math.min(100, Math.round((done / total) * 100));
  return (
    <div className="flex w-full items-center gap-3">
      <div
        className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#0f172a]"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full max-w-full rounded-full bg-gradient-to-r from-teal/85 to-teal/55 transition-[width] duration-500 ease-out"
          style={pct === 0 ? { width: '3px' } : { width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 font-sans text-[0.7rem] tabular-nums text-[#64748b]">
        {done} / {total}
      </span>
    </div>
  );
}

const menuBtn =
  'flex w-full items-center gap-2 rounded-md px-2.5 py-2 font-sans text-[0.78rem] text-left text-[#cbd5e1] transition-colors hover:bg-white/[0.06]';

function DeckCard({
  deck,
  onDuplicate,
  onMarkReady,
  onExportOutline,
  onOpenFinancial,
  readiness,
  viewDeckHref,
}: {
  deck: PitchDeck;
  onDuplicate: (id: string) => void;
  onMarkReady: (id: string) => void;
  onExportOutline: () => void;
  onOpenFinancial: () => void;
  readiness: DeckReadiness | undefined;
  viewDeckHref?: string;
}) {
  const rDone = readiness?.items.filter((i) => i.done).length ?? 0;
  const rTotal = readiness?.items.length ?? 0;

  const primaryCta =
    'inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-teal/35 bg-teal/12 px-4 py-2.5 font-sans text-[0.8rem] font-semibold text-[#ecfeff] shadow-[0_0_0_1px_rgba(0,194,178,0.12)] transition-[background,border] hover:border-teal/50 hover:bg-teal/18';

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-[linear-gradient(165deg,rgba(18,26,46,0.94),rgba(8,12,20,0.96))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-[border-color,transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex min-w-0 flex-row items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 pr-1 font-heading text-[1.15rem] font-semibold leading-tight text-[#f8fafc]">
          {deck.name}
        </h3>
        <div className="flex shrink-0 items-center justify-end gap-2">
          <div className="flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Badge variant="teal" subtle>
              {AUDIENCE_LABEL[deck.audience]}
            </Badge>
            <Badge variant="neutral" subtle>
              {labelForStatus(deck.status)}
            </Badge>
            <Badge variant="amber" subtle>
              {labelForConfidence(deck.confidence)}
            </Badge>
          </div>
          <details className="group/deck-menu relative shrink-0">
            <summary
              className="flex list-none cursor-pointer items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] p-2 text-[#94a3b8] transition-colors hover:border-teal/30 hover:text-[#e2e8f0] [&::-webkit-details-marker]:hidden"
              aria-label={`More actions for ${deck.name}`}
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </summary>
            <div
              className="absolute right-0 z-40 mt-1 min-w-[14rem] rounded-lg border border-white/[0.1] bg-[#0c1219] py-1 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className={menuBtn} onClick={() => onDuplicate(deck.id)}>
                <Copy className="size-3.5 opacity-70" aria-hidden />
                Duplicate variant
              </button>
              <button type="button" className={menuBtn} onClick={onExportOutline}>
                <FileStack className="size-3.5 opacity-70" aria-hidden />
                Export outline
              </button>
              <button type="button" className={menuBtn} onClick={onOpenFinancial}>
                <Layers className="size-3.5 opacity-70" aria-hidden />
                Financial appendix
              </button>
              <button type="button" className={menuBtn} onClick={() => onMarkReady(deck.id)}>
                <ShieldCheck className="size-3.5 opacity-70" aria-hidden />
                Mark external-ready
              </button>
              <button
                type="button"
                className={menuBtn}
                onClick={() =>
                  document.getElementById('hub-messaging')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <ClipboardList className="size-3.5 opacity-70" aria-hidden />
                Shared copy layer
              </button>
            </div>
          </details>
        </div>
      </div>

      <p className="w-full font-sans text-[0.84rem] leading-relaxed text-[#94a3b8]">
        {deck.purpose}
      </p>
      {deck.narrativeEmphasis ? (
        <p className="w-full border-l-2 border-teal/25 pl-3 font-sans text-[0.78rem] leading-snug text-[#7c8796]">
          <span className="block text-[0.65rem] font-medium uppercase tracking-[0.08em] text-[#64748b]">
            Story weight
          </span>
          <span className="mt-0.5 block text-[#94a3b8]">{deck.narrativeEmphasis}</span>
        </p>
      ) : null}

      <div className="flex min-w-0 flex-nowrap items-baseline gap-x-3 overflow-x-auto font-sans text-[0.72rem] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span>
          <span className="opacity-40">Slides</span>{' '}
          <span className="tabular-nums text-[#a8b3c4]">{deck.slideCount}</span>
        </span>
        <span className="text-[#334155] opacity-60">·</span>
        <span>
          <span className="opacity-40">Owner</span>{' '}
          <span className="text-[#a8b3c4]">{deck.owner}</span>
        </span>
        <span className="text-[#334155] opacity-60">·</span>
        <span>
          <span className="opacity-40">Updated</span>{' '}
          <span className="tabular-nums text-[#a8b3c4]">
            {new Date(deck.lastUpdatedISO).toLocaleDateString()}
          </span>
        </span>
      </div>

      {rTotal > 0 ? <ReadinessBar done={rDone} total={rTotal} /> : null}

      <div className="pt-0.5">
        {viewDeckHref ? (
          <a href={viewDeckHref} target="_blank" rel="noopener noreferrer" className={primaryCta}>
            <Eye className="size-4 shrink-0 opacity-90" aria-hidden />
            View deck
          </a>
        ) : (
          <button
            type="button"
            className={primaryCta}
            onClick={() =>
              toast.message('Attach your .pptx asset in DAM or Drive — hub tracks metadata only.')
            }
          >
            <Eye className="size-4 shrink-0 opacity-90" aria-hidden />
            View deck
          </button>
        )}
      </div>
    </article>
  );
}

function ReadinessBlock({
  deckName,
  readiness,
  onToggle,
}: {
  deckName: string;
  readiness: DeckReadiness | undefined;
  onToggle: (deckId: string, itemId: string) => void;
}) {
  if (!readiness) return null;
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0a0f16]/90 p-4">
      <p className="font-sans text-[0.78rem] font-medium text-[#94a3b8]">
        External readiness · <span className="text-[#cbd5e1]">{deckName}</span>
      </p>
      <ul className="mt-3 space-y-2">
        {readiness.items.map((it) => (
          <li key={it.id}>
            <label className="flex cursor-pointer items-start gap-2 font-sans text-[0.82rem] text-[#a8b2c1]">
              <input
                type="checkbox"
                checked={it.done}
                onChange={() => onToggle(readiness.deckId, it.id)}
                className="mt-1 size-3.5 rounded border-white/[0.12] bg-[#0c1219] text-teal focus:ring-teal/40"
              />
              <span className={it.done ? 'text-[#cbd5e1] line-through opacity-60' : ''}>
                {it.label}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Founder command center for deck variants, messaging, and traceable scenario financials. */
export function PitchDeckHubPage() {
  const {
    state,
    meta,
    updateMessaging,
    updateAssumptions,
    setActiveScenario,
    updateDeck,
    duplicateDeck,
    toggleReadiness,
    markExternalReady,
    resetHub,
    exportOutline,
    exportFullJson,
  } = usePitchDeckHubStore();

  const [audienceFilter, setAudienceFilter] = useState<DeckAudience | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DeckStatus | 'all'>('all');
  const [readinessDeckId, setReadinessDeckId] = useState<string>('core-investor');
  const [activeMessagingKey, setActiveMessagingKey] =
    useState<keyof MessagingLayer>('masterPositioning');
  const [activeNavId, setActiveNavId] = useState<string>(HUB_NAV[0].id);

  const model = buildFinancialModel(state.assumptions, state.activeScenario);
  const issues = runConsistencyCheck(state);

  const messagingKeys = useMemo(
    () => Object.keys(state.messaging) as (keyof MessagingLayer)[],
    [state.messaging],
  );

  const nextBlocking = useMemo(() => {
    if (meta.needsEvidence > 0)
      return `Add or link evidence (${meta.needsEvidence} item${meta.needsEvidence === 1 ? '' : 's'} open)`;
    const blocker = issues.find((i) => i.severity === 'error');
    if (blocker) return 'Resolve consistency flags';
    return 'Review checklist before external use';
  }, [meta.needsEvidence, issues]);

  useEffect(() => {
    if (!messagingKeys.includes(activeMessagingKey) && messagingKeys[0]) {
      setActiveMessagingKey(messagingKeys[0]);
    }
  }, [messagingKeys, activeMessagingKey]);

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    if (hash && HUB_NAV.some((n) => n.id === hash)) setActiveNavId(hash);
  }, []);

  useEffect(() => {
    const ids = HUB_NAV.map((n) => n.id);
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        if (visible[0]?.target.id) setActiveNavId(visible[0].target.id);
      },
      { rootMargin: '-12% 0px -55% 0px', threshold: [0.08, 0.2, 0.35] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const filteredDecks = state.decks.filter((d) => {
    if (audienceFilter !== 'all' && d.audience !== audienceFilter) return false;
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="w-full pb-28 pt-[56px]">
      <header className="border-b border-white/[0.06] pb-12">
        <div className="flex flex-wrap items-center gap-4">
          <SquadLogo size={44} aria-hidden className="opacity-95" />
          <SquadRidgeWordmark className="h-8 w-auto opacity-95 sm:h-9" alt="SquadRidge" />
        </div>
        <p className="mt-8 font-sans text-[0.8rem] font-medium text-teal/85">Internal materials</p>
        <h1 className="mt-3 max-w-[20ch] font-heading text-display-hero font-extrabold leading-[1.08] text-[#f1f5f9]">
          Pitch Deck Hub
        </h1>
        <p className="mt-5 max-w-copy font-sans text-body-lg text-[#94a3b8]">
          Conflict prevention and early-warning narrative—grounded in verified squads,
          facilitator-led de-escalation, and honest security boundaries. When a figure is unknown,
          label it. Separate shipped product from pilot and roadmap, and never upgrade a claim
          beyond what sources and CURRENT_STATUS support.{' '}
          <span className="text-[#a8b2c1]">
            Every deck variant shares the same design system — colors, typography, spacing,
            components, and brand lockup — while content density, narrative angle, and slide
            emphasis shift by audience.
          </span>
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-white/[0.07] bg-[#0c1219]/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <p className="font-sans text-[0.72rem] text-[#64748b]">Last content touch</p>
            <p className="mt-1 font-heading text-lg font-semibold tabular-nums text-[#f1f5f9]">
              {meta.lastReview
                ? new Date(meta.lastReview).toLocaleDateString(undefined, { dateStyle: 'medium' })
                : '—'}
            </p>
            <p className="mt-1 font-sans text-[0.7rem] text-[#64748b]">
              {meta.lastReview
                ? new Date(meta.lastReview).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/35 bg-gradient-to-br from-amber-500/[0.09] to-[#0c1219]/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-amber-400/15">
            <p className="font-sans text-[0.72rem] font-medium text-amber-200/90">
              Items still needing evidence
            </p>
            <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-amber-100">
              {meta.needsEvidence}
            </p>
            <p className="mt-2 font-sans text-[0.72rem] leading-relaxed text-amber-200/75">
              Tighten sources before external decks ship.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-[#0c1219]/80 p-5">
            <p className="font-sans text-[0.72rem] text-[#64748b]">External-ready decks</p>
            <p className="mt-1 font-heading text-2xl font-semibold tabular-nums text-teal-light">
              {meta.safeExternal}
            </p>
            <p className="mt-2 font-sans text-[0.72rem] text-[#64748b]">
              Marked safe for outside audiences
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-[#0c1219]/80 p-5">
            <p className="font-sans text-[0.72rem] text-[#64748b]">Next blocking focus</p>
            <p className="mt-1 font-sans text-[0.85rem] font-medium leading-snug text-[#cbd5e1]">
              {nextBlocking}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to="/security"
                className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[0.72rem] text-[#e2e8f0] hover:border-teal/30 hover:text-white"
              >
                Security disclosure
                <ArrowRight className="size-3" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() =>
                  document.getElementById('hub-evidence')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[0.72rem] text-[#94a3b8] hover:border-teal/30 hover:text-[#e2e8f0]"
              >
                Evidence locker
              </button>
            </div>
          </div>
        </div>

        <nav
          className="sticky top-0 z-30 -mx-4 mt-10 flex flex-wrap gap-1.5 border-y border-white/[0.06] bg-[#080c12]/90 px-4 py-3 font-sans text-[0.8rem] backdrop-blur-md sm:-mx-6 sm:px-6"
          aria-label="Hub sections"
        >
          {HUB_NAV.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={cn(
                'rounded-t-md border-b-2 px-3 py-2 font-medium transition-colors',
                activeNavId === id
                  ? 'border-teal text-teal-light'
                  : 'border-transparent text-[#8b95a8] hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-[#e2e8f0]',
              )}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <SectionShell
        id="hub-overview"
        eyebrow="Overview"
        title="Variants & status"
        description="One visual language across variants; each row below calls out how story weight differs for that audience. Filter by audience and readiness. CTAs orchestrate workflow; link source decks in your storage layer."
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-[#94a3b8]">
            <Filter className="size-3.5 shrink-0 opacity-60" aria-hidden />
            <span className="font-sans text-[0.78rem] text-[#64748b]">Audience</span>
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value as DeckAudience | 'all')}
              className="rounded-lg border border-white/[0.1] bg-[#0c1219] px-2 py-1.5 font-sans text-[0.82rem] text-[#e2e8f0]"
            >
              <option value="all">All</option>
              {(Object.keys(AUDIENCE_LABEL) as DeckAudience[]).map((k) => (
                <option key={k} value={k}>
                  {AUDIENCE_LABEL[k]}
                </option>
              ))}
            </select>
            <span className="ml-2 font-sans text-[0.78rem] text-[#64748b]">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DeckStatus | 'all')}
              className="rounded-lg border border-white/[0.1] bg-[#0c1219] px-2 py-1.5 font-sans text-[0.82rem] text-[#e2e8f0]"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="internal">Internal</option>
              <option value="needs_review">Needs review</option>
              <option value="external_ready">External-ready</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportOutline}
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 font-sans text-[0.8rem] font-medium text-[#e2e8f0] hover:border-teal/35"
            >
              Export all outlines
            </button>
            <button
              type="button"
              onClick={exportFullJson}
              className="rounded-lg border border-white/[0.08] bg-transparent px-4 py-2 font-sans text-[0.8rem] text-[#94a3b8] hover:border-teal/35 hover:text-[#e2e8f0]"
            >
              Export hub JSON
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    'Reset will replace all hub edits with seed data. This cannot be undone. Continue?',
                  )
                ) {
                  resetHub();
                }
              }}
              className="rounded-lg border border-red-500/20 bg-transparent px-4 py-2 font-sans text-[0.8rem] text-red-300/90 hover:border-red-500/40"
            >
              Reset hub
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onDuplicate={duplicateDeck}
              onMarkReady={markExternalReady}
              onExportOutline={exportOutline}
              onOpenFinancial={() =>
                document.getElementById('hub-financial')?.scrollIntoView({ behavior: 'smooth' })
              }
              readiness={state.readiness.find((r) => r.deckId === deck.id)}
              viewDeckHref={viewDeckHrefForId(deck.id)}
            />
          ))}
        </div>

        {filteredDecks.length === 0 ? (
          <p className="mt-8 rounded-lg border border-dashed border-white/[0.1] bg-[#0a0f14]/80 px-4 py-8 text-center font-sans text-[0.9rem] text-[#64748b]">
            No decks match filters. Clear filters or add a duplicate variant.
          </p>
        ) : null}

        <div className="mt-12 max-w-2xl">
          <p className="font-sans text-[0.8rem] font-medium text-[#94a3b8]">
            External-readiness checklist
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label htmlFor="readiness-deck" className="font-sans text-[0.78rem] text-[#94a3b8]">
              Deck
            </label>
            <select
              id="readiness-deck"
              value={readinessDeckId}
              onChange={(e) => setReadinessDeckId(e.target.value)}
              className="rounded-lg border border-white/[0.1] bg-[#0c1219] px-2 py-1.5 font-sans text-[0.82rem] text-[#e2e8f0]"
            >
              {state.decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <ReadinessBlock
              deckName={state.decks.find((d) => d.id === readinessDeckId)?.name ?? readinessDeckId}
              readiness={state.readiness.find((r) => r.deckId === readinessDeckId)}
              onToggle={toggleReadiness}
            />
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="hub-messaging"
        eyebrow="Messaging"
        title="Shared copy layer"
        description="Single source of tone and claims for every deck. Deck-specific slides still need alignment by hand — this layer prevents silent drift."
      >
        <div className="flex min-h-[22rem] flex-col gap-6 rounded-xl border border-white/[0.06] bg-[#060a10]/40 lg:flex-row lg:gap-0">
          <div
            className="flex shrink-0 flex-col border-b border-white/[0.06] lg:w-[min(14rem,34%)] lg:border-b-0 lg:border-r"
            role="tablist"
            aria-label="Messaging fields"
          >
            {messagingKeys.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                id={`hub-msg-tab-${key}`}
                aria-selected={activeMessagingKey === key}
                aria-controls={`hub-msg-panel-${key}`}
                onClick={() => setActiveMessagingKey(key)}
                className={cn(
                  'border-l-2 px-4 py-3 text-left font-sans text-[0.82rem] transition-colors',
                  activeMessagingKey === key
                    ? 'border-teal bg-teal/[0.06] font-medium text-[#f1f5f9]'
                    : 'border-transparent text-[#94a3b8] hover:bg-white/[0.03] hover:text-[#e2e8f0]',
                )}
              >
                {MESSAGING_FIELD_LABELS[key]}
              </button>
            ))}
          </div>
          <div
            id={`hub-msg-panel-${activeMessagingKey}`}
            role="tabpanel"
            aria-labelledby={`hub-msg-tab-${activeMessagingKey}`}
            className="min-h-[18rem] flex-1 p-4 sm:p-6"
          >
            <label htmlFor="hub-msg-editor" className="font-sans text-[0.78rem] text-[#64748b]">
              {MESSAGING_FIELD_LABELS[activeMessagingKey]}
            </label>
            <textarea
              id="hub-msg-editor"
              value={state.messaging[activeMessagingKey]}
              onChange={(e) => updateMessaging({ [activeMessagingKey]: e.target.value })}
              rows={14}
              className="mt-3 min-h-[16rem] w-full rounded-lg border border-white/[0.08] bg-[#0c1219] px-4 py-3 font-sans text-[0.9rem] leading-relaxed text-[#e2e8f0] placeholder:text-[#475569] focus:border-teal/40 focus:outline-none focus:ring-1 focus:ring-teal/30"
            />
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="hub-financial"
        eyebrow="Financial"
        title="Assumption-driven model"
        description="Scenario planning only — not audited actuals. Every row traces to inputs; downgrade claims, never upgrade them."
      >
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-5 ring-1 ring-amber-400/10">
          <p className="font-sans text-[0.9rem] font-medium leading-relaxed text-amber-100/95">
            Scenario planning only — not audited actuals. Labels on outputs reflect assumption
            quality; treat as diligence support, not GAAP reporting.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="font-sans text-[0.78rem] text-[#64748b]">Scenario</span>
          {(['base', 'conservative', 'aggressive'] as FinancialScenario[]).map((sc) => (
            <button
              key={sc}
              type="button"
              onClick={() => setActiveScenario(sc)}
              className={cn(
                'rounded-lg border px-4 py-2 font-sans text-[0.8rem] font-medium capitalize transition-colors',
                state.activeScenario === sc
                  ? 'border-teal/45 bg-teal/10 text-teal-light'
                  : 'border-white/[0.06] bg-transparent text-[#94a3b8] hover:border-white/[0.12]',
              )}
            >
              {sc}
            </button>
          ))}
          <Badge variant="muted" subtle>
            Revenue label: {model.labels.revenue.replace(/_/g, ' ')}
          </Badge>
        </div>

        <div className="mt-10">
          <p className="font-sans text-[0.72rem] font-medium text-[#64748b]">
            Modeled outcomes ({state.activeScenario})
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/[0.08] bg-[#0a0f16] p-5">
              <p className="font-sans text-[0.72rem] text-[#64748b]">Runway</p>
              <p className="mt-1 font-heading text-2xl font-semibold text-[#f1f5f9]">
                {model.runwayMonthsFromStart != null ? `${model.runwayMonthsFromStart} mo` : '—'}
              </p>
              <p className="mt-1 font-sans text-[0.72rem] text-[#64748b]">
                Cash to zero: month {model.cashZeroMonthIndex ?? '—'}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#0a0f16] p-5">
              <p className="font-sans text-[0.72rem] text-[#64748b]">Break-even (operating)</p>
              <p className="mt-1 font-heading text-2xl font-semibold text-[#f1f5f9]">
                {model.breakEvenMonthIndex != null
                  ? `M${model.breakEvenMonthIndex}`
                  : 'Not in horizon'}
              </p>
            </div>
            <div className="rounded-xl border border-teal/25 bg-teal/[0.06] p-5 ring-1 ring-teal/15">
              <p className="font-sans text-[0.72rem] text-[#94a3b8]">Fundraising ask (input)</p>
              <p className="mt-1 font-heading text-2xl font-semibold text-teal-light/95">
                {formatUsd(state.assumptions.fundraisingAskUsd)}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#0a0f16] p-5">
              <p className="font-sans text-[0.72rem] text-[#64748b]">Ending cash (last month)</p>
              <p className="mt-1 font-heading text-2xl font-semibold text-[#f1f5f9]">
                {model.monthly.length
                  ? formatUsd(model.monthly[model.monthly.length - 1].cashEndUsd)
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        <details className="group/fin-inputs mt-10 rounded-xl border border-white/[0.07] bg-[#060a10]/55">
          <summary className="cursor-pointer list-none px-5 py-4 font-sans text-[0.88rem] font-medium text-[#e2e8f0] [&::-webkit-details-marker]:hidden">
            <span className="mr-2 text-[#64748b]">▸</span>
            Model inputs
            <span className="ml-2 font-normal text-[#64748b]">
              Assumptions that drive the scenario
            </span>
          </summary>
          <div className="border-t border-white/[0.06] px-5 pb-6 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {(Object.keys(state.assumptions) as (keyof typeof state.assumptions)[]).map((k) => {
                const v = state.assumptions[k];
                const label = ASSUMPTION_LABELS[k] ?? k;
                if (k === 'modelStartISO') {
                  return (
                    <div key={k}>
                      <label className="font-sans text-[0.75rem] text-[#64748b]">{label}</label>
                      <input
                        type="date"
                        value={typeof v === 'string' ? v.slice(0, 10) : ''}
                        onChange={(e) => updateAssumptions({ modelStartISO: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#0c1219] px-3 py-2 font-mono text-[0.82rem] text-[#e2e8f0] focus:border-teal/40 focus:outline-none"
                      />
                    </div>
                  );
                }
                if (typeof v === 'string') {
                  return (
                    <div key={k} className="md:col-span-2">
                      <label className="font-sans text-[0.75rem] text-[#64748b]">{label}</label>
                      <textarea
                        value={v}
                        onChange={(e) => updateAssumptions({ [k]: e.target.value })}
                        rows={2}
                        className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#0c1219] px-3 py-2 font-sans text-[0.85rem] text-[#e2e8f0] focus:border-teal/40 focus:outline-none"
                      />
                    </div>
                  );
                }
                return (
                  <div key={k}>
                    <label className="font-sans text-[0.75rem] text-[#64748b]">{label}</label>
                    <input
                      type="number"
                      value={typeof v === 'number' ? v : 0}
                      onChange={(e) => updateAssumptions({ [k]: parseFloat(e.target.value) || 0 })}
                      className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#0c1219] px-3 py-2 font-mono text-[0.82rem] text-[#e2e8f0] focus:border-teal/40 focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </details>

        <details className="group/fin-monthly mt-4 rounded-xl border border-white/[0.07] bg-[#060a10]/55">
          <summary className="cursor-pointer list-none px-5 py-4 font-sans text-[0.88rem] font-medium text-[#e2e8f0] [&::-webkit-details-marker]:hidden">
            <span className="mr-2 text-[#64748b]">▸</span>
            Monthly cash model
            <span className="ml-2 font-normal text-[#64748b]">Month-by-month diligence detail</span>
          </summary>
          <div className="overflow-x-auto border-t border-white/[0.06]">
            <table className="min-w-[720px] w-full border-collapse font-sans text-[0.75rem]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#0c1219] text-left text-[#64748b]">
                  <th className="px-3 py-2 font-semibold">Month</th>
                  <th className="px-3 py-2 font-semibold">Seats</th>
                  <th className="px-3 py-2 font-semibold">Revenue</th>
                  <th className="px-3 py-2 font-semibold">Payroll</th>
                  <th className="px-3 py-2 font-semibold">Non-payroll opex</th>
                  <th className="px-3 py-2 font-semibold">Contingency</th>
                  <th className="px-3 py-2 font-semibold">Op. income</th>
                  <th className="px-3 py-2 font-semibold">Cash end</th>
                </tr>
              </thead>
              <tbody>
                {model.monthly.map((row) => (
                  <tr
                    key={row.monthIndex}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                  >
                    <td className="px-3 py-2 text-[#cbd5e1]">{row.label}</td>
                    <td className="px-3 py-2 font-mono text-[#94a3b8]">{row.payingSeats}</td>
                    <td className="px-3 py-2 font-mono text-[#e2e8f0]">
                      {formatUsd(row.revenueUsd)}
                    </td>
                    <td className="px-3 py-2 font-mono text-[#94a3b8]">
                      {formatUsd(row.payrollUsd)}
                    </td>
                    <td className="px-3 py-2 font-mono text-[#94a3b8]">
                      {formatUsd(row.nonPayrollOpexUsd)}
                    </td>
                    <td className="px-3 py-2 font-mono text-[#64748b]">
                      {formatUsd(row.contingencyUsd)}
                    </td>
                    <td
                      className={cn(
                        'px-3 py-2 font-mono',
                        row.operatingIncomeUsd < 0 ? 'text-amber-light' : 'text-teal-light',
                      )}
                    >
                      {formatUsd(row.operatingIncomeUsd)}
                    </td>
                    <td className="px-3 py-2 font-mono text-[#f1f5f9]">
                      {formatUsd(row.cashEndUsd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-4 font-sans text-[0.72rem] leading-relaxed text-[#64748b]">
            Traceability sample (first month): {model.monthly[0]?.lineage.slice(0, 6).join(' · ')}
            {model.monthly[0]?.lineage.length ? ' …' : ''}
          </p>
        </details>

        <details className="group/fin-annual mt-4 rounded-xl border border-white/[0.07] bg-[#060a10]/55">
          <summary className="cursor-pointer list-none px-5 py-4 font-sans text-[0.88rem] font-medium text-[#e2e8f0] [&::-webkit-details-marker]:hidden">
            <span className="mr-2 text-[#64748b]">▸</span>
            Annual rollup
          </summary>
          <div className="overflow-x-auto border-t border-white/[0.06]">
            <table className="min-w-[480px] w-full border-collapse font-sans text-[0.78rem]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#0c1219] text-left text-[#64748b]">
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2">Revenue</th>
                  <th className="px-3 py-2">Total opex</th>
                  <th className="px-3 py-2">Operating income</th>
                </tr>
              </thead>
              <tbody>
                {model.annual.map((y) => (
                  <tr key={y.year} className="border-b border-white/[0.04]">
                    <td className="px-3 py-2 text-[#cbd5e1]">{y.year}</td>
                    <td className="px-3 py-2 font-mono">{formatUsd(y.revenueUsd)}</td>
                    <td className="px-3 py-2 font-mono">{formatUsd(y.totalOpexUsd)}</td>
                    <td className="px-3 py-2 font-mono text-[#e2e8f0]">
                      {formatUsd(y.operatingIncomeUsd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </SectionShell>

      <SectionShell
        id="hub-evidence"
        eyebrow="Evidence"
        title="Sources & artifacts"
        description="Trace deck bullets here before marking external-ready. Each row shows permission and validation state at a glance."
      >
        <div className="space-y-5">
          {state.evidence.map((ev: EvidenceItem) => (
            <article
              key={ev.id}
              className={cn(
                'overflow-hidden rounded-xl border border-white/[0.06] border-l-[3px] bg-[#0c1219]/90 pl-5 pr-4 py-5 shadow-sm',
                evidenceAccent(ev.dataLabel, ev.approvedForExternal),
              )}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-[0.72rem] font-medium text-[#64748b]">
                    Document record
                  </p>
                  <h4 className="mt-1 font-heading text-[1.02rem] font-semibold text-[#f1f5f9]">
                    {ev.title}
                  </h4>
                  <p className="mt-2 max-w-prose font-sans text-[0.84rem] leading-relaxed text-[#94a3b8]">
                    {ev.summary}
                  </p>
                  {ev.sourceUrl ? (
                    ev.sourceUrl.startsWith('/') ? (
                      <Link
                        to={ev.sourceUrl}
                        className="mt-3 inline-block font-sans text-[0.78rem] text-teal-light underline-offset-4 hover:underline"
                      >
                        {ev.sourceUrl}
                      </Link>
                    ) : (
                      <a
                        href={ev.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block font-sans text-[0.78rem] text-teal-light underline-offset-4 hover:underline"
                      >
                        {ev.sourceUrl}
                      </a>
                    )
                  ) : (
                    <p className="mt-3 font-sans text-[0.78rem] text-amber-light/90">
                      No URL linked — add a source before external use.
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-2 lg:w-[min(18rem,100%)]">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="neutral" subtle>
                      {ev.category.replace(/_/g, ' ')}
                    </Badge>
                    <Badge variant={ev.approvedForExternal ? 'teal' : 'amber'} subtle>
                      {ev.approvedForExternal ? 'External OK' : 'Internal only'}
                    </Badge>
                  </div>
                  <p className="rounded-md border border-white/[0.05] bg-[#070b10]/80 px-2.5 py-2 font-sans text-[0.72rem] leading-snug text-[#94a3b8]">
                    <span className="text-[#64748b]">Data state ·</span>{' '}
                    <span
                      className={
                        ev.dataLabel === 'input_required' || ev.dataLabel === 'pending_validation'
                          ? 'text-amber-light'
                          : ev.dataLabel === 'illustrative_only'
                            ? 'text-slate-400'
                            : 'text-[#cbd5e1]'
                      }
                    >
                      {ev.dataLabel.replace(/_/g, ' ')}
                    </span>
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="hub-consistency"
        eyebrow="Consistency"
        title="Narrative checks"
        description="Heuristic signals — not a substitute for partner review."
      >
        <ul className="space-y-3">
          {issues.length === 0 ? (
            <li className="flex gap-3 font-sans text-[0.9rem] text-teal-light/95">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
              No blocking issues detected with current thresholds.
            </li>
          ) : null}
          {issues.map((issue) => (
            <li
              key={issue.code + issue.message}
              className="flex gap-3 rounded-lg border border-white/[0.06] bg-[#0a0f14] px-4 py-3 font-sans text-[0.85rem] text-[#cbd5e1]"
            >
              {issue.severity === 'error' ? (
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-400/90" aria-hidden />
              ) : (
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-light/90" aria-hidden />
              )}
              <span>
                <span className="font-semibold text-[#e2e8f0]">{issue.message}</span>
                {issue.hint ? (
                  <span className="mt-1 block text-[#64748b]">{issue.hint}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-lg border border-dashed border-white/[0.08] bg-[#0c1219]/40 p-5 font-sans text-[0.82rem] text-[#94a3b8]">
          <p className="font-medium text-[#e2e8f0]">Deck field quick-edit</p>
          <p className="mt-2">Adjust status when outline changes — keeps filters honest.</p>
          <div className="mt-4 flex flex-col gap-3">
            {state.decks.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-2">
                <span className="min-w-[10rem] text-[0.78rem] text-[#64748b]">{d.name}</span>
                <select
                  value={d.status}
                  onChange={(e) => updateDeck(d.id, { status: e.target.value as DeckStatus })}
                  className="rounded-lg border border-white/[0.1] bg-[#0a0f16] px-2 py-1.5 font-sans text-[0.78rem] text-[#e2e8f0]"
                >
                  <option value="draft">Draft</option>
                  <option value="internal">Internal</option>
                  <option value="needs_review">Needs review</option>
                  <option value="external_ready">External-ready</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>
    </div>
  );
}
