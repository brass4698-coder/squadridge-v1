import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CircleAlert,
  CircleCheck,
  Copy,
  History,
  ListChecks,
  Play,
  RefreshCw,
  Sparkles,
  StickyNote,
} from 'lucide-react';
import { useDemoWalkthrough } from '../../demo/DemoWalkthroughContext';
import {
  DEMO_MAIN_STEPS,
  DEMO_SCENARIOS,
  DEMO_SCENARIO_STORAGE_KEY,
  DEMO_WALKTHROUGH_STORAGE_KEY,
  type DemoScenarioId,
} from '../../demo';
import { isDemoSquadShortcutsEnabled, isZkHashStubExplicit } from '../../lib';

/**
 * Build a shareable demo URL for a step. Adds the active scenario id so the
 * recipient lands on the same scripted persona without having to flip the chip
 * after opening the link.
 */
function buildShareUrl(stepPath: string, scenarioId: DemoScenarioId): string {
  const [pathname, query = ''] = stepPath.split('?');
  const params = new URLSearchParams(query);
  params.set('demo', '1');
  params.set('scenario', scenarioId);
  return `${pathname}?${params.toString()}`;
}

type PreflightStatus = 'pass' | 'warn' | 'info';

interface PreflightRow {
  label: string;
  status: PreflightStatus;
  detail: string;
}

function buildPreflightRows(): PreflightRow[] {
  const rows: PreflightRow[] = [];

  const sessionStorageWalkthrough =
    typeof window !== 'undefined' &&
    window.sessionStorage.getItem(DEMO_WALKTHROUGH_STORAGE_KEY) === '1';
  rows.push({
    label: 'Session storage clean',
    status: sessionStorageWalkthrough ? 'warn' : 'pass',
    detail: sessionStorageWalkthrough
      ? 'A previous tour is still flagged active. Exit before starting a fresh demo.'
      : 'No stale tour flag in sessionStorage.',
  });

  const persistedScenario =
    typeof window !== 'undefined' ? window.sessionStorage.getItem(DEMO_SCENARIO_STORAGE_KEY) : null;
  rows.push({
    label: 'Scenario persisted',
    status: persistedScenario ? 'pass' : 'info',
    detail: persistedScenario
      ? `Active scenario "${persistedScenario}" stored for this session.`
      : 'No scenario stored — default cross-border-corridor is in effect.',
  });

  rows.push({
    label: 'VITE_ENABLE_DEMO_SQUAD',
    status: isDemoSquadShortcutsEnabled() ? 'pass' : 'warn',
    detail: isDemoSquadShortcutsEnabled()
      ? '/session/demo-session-001 and /match?demo=1 are reachable.'
      : 'Demo squad shortcuts are disabled. Set VITE_ENABLE_DEMO_SQUAD=true in staging or DEV.',
  });

  rows.push({
    label: 'VITE_ZK_STUB',
    status: isZkHashStubExplicit() ? 'warn' : 'pass',
    detail: isZkHashStubExplicit()
      ? 'Hash stub is on — verification will not generate real Semaphore proofs.'
      : 'Verification will run the real Semaphore + verify-zk-proof flow.',
  });

  return rows;
}

const STATUS_PILL: Record<PreflightStatus, string> = {
  pass: 'border-teal/45 bg-teal/[0.08] text-teal-light',
  warn: 'border-amber/45 bg-amber/[0.08] text-amber',
  info: 'border-slate-700 bg-white/[0.02] text-slate-300',
};

const STATUS_ICON: Record<PreflightStatus, ReactNode> = {
  pass: <CircleCheck className="h-4 w-4 shrink-0" aria-hidden />,
  warn: <CircleAlert className="h-4 w-4 shrink-0" aria-hidden />,
  info: <CircleCheck className="h-4 w-4 shrink-0 opacity-50" aria-hidden />,
};

/**
 * Presenter hub: pre-flight check + scenario picker + step list + resume / restart / notes.
 *
 * Lives behind RequireAuth + RequireModerator. Surfaces every control a presenter
 * needs in one place so the live demo never has to "find" the right URL during
 * the call.
 *
 *   - Pre-flight pills (env flags, sessionStorage cleanliness, scenario loaded).
 *   - Scenario chips (cross-border corridor / workplace / veterans).
 *   - Numbered step list with copy-URL action and one-click jump.
 *   - Resume at last step, restart, presenter notes toggle, exit.
 *
 * The hub does **not** drive the script itself — it talks to the existing
 * `useDemoWalkthrough` provider so behaviour stays consistent with `?demo=1`
 * deep links.
 */
export function AdminDemoHubPage() {
  const {
    scenario,
    setScenarioId,
    currentStepIndex,
    presenterNotesActive,
    goToStepIndex,
    restartWalkthrough,
    resumeWalkthrough,
    lastStepIndex,
    exitDemo,
  } = useDemoWalkthrough();

  const [copiedStepId, setCopiedStepId] = useState<string | null>(null);
  const preflightRows = useMemo(() => buildPreflightRows(), []);

  const stepRows = useMemo(
    () =>
      DEMO_MAIN_STEPS.map((step, index) => ({
        index,
        id: step.id,
        title: step.title,
        description: step.description,
        path: step.path,
        notes: step.presenterNotes,
        active: index === currentStepIndex,
      })),
    [currentStepIndex],
  );

  const notesUrl = presenterNotesActive
    ? scenario.id // already on, link toggles off below
    : `${DEMO_MAIN_STEPS[0]?.path ?? '/?demo=1'}&notes=1`;

  const resumeStep =
    lastStepIndex !== null && lastStepIndex >= 0 && lastStepIndex < DEMO_MAIN_STEPS.length
      ? DEMO_MAIN_STEPS[lastStepIndex]
      : null;

  const handleCopy = useCallback(async (stepId: string, url: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedStepId(stepId);
      window.setTimeout(() => {
        setCopiedStepId((prev) => (prev === stepId ? null : prev));
      }, 1600);
    } catch {
      // No-op: presenter can still read the URL inline below the row.
    }
  }, []);

  return (
    <section className="space-y-8" aria-labelledby="demo-hub-title">
      <header className="space-y-3">
        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-amber/90">
          Presenter
        </p>
        <h1
          id="demo-hub-title"
          className="font-heading text-2xl font-semibold tracking-tight text-ink"
        >
          Demo command center
        </h1>
        <p className="max-w-prose font-sans text-[0.9rem] leading-relaxed text-ink-secondary">
          One-screen control for the scripted product walkthrough. Pick a scenario, jump to any
          step, copy a deep link, and toggle the presenter notes overlay. The live tour at{' '}
          <code>?demo=1</code> picks up the same scenario; switching here updates onboarding,
          intent, profile, and the offline session in one go.
        </p>
      </header>

      <section aria-labelledby="demo-hub-preflight" className="space-y-3">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-amber/90" aria-hidden />
          <h2
            id="demo-hub-preflight"
            className="font-heading text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-ink-secondary"
          >
            Pre-flight
          </h2>
        </div>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2" aria-label="Pre-flight checks">
          {preflightRows.map((row) => (
            <li
              key={row.label}
              className={`flex items-start gap-3 rounded-xl border px-3 py-3 ${STATUS_PILL[row.status]}`}
            >
              {STATUS_ICON[row.status]}
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
                  {row.label}
                </p>
                <p className="mt-1 font-sans text-[0.78rem] leading-snug text-ink-secondary">
                  {row.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="demo-hub-scenarios" className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-light" aria-hidden />
          <h2
            id="demo-hub-scenarios"
            className="font-heading text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-ink-secondary"
          >
            Scenario
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {DEMO_SCENARIOS.map((s) => {
            const active = s.id === scenario.id;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() => setScenarioId(s.id as DemoScenarioId)}
                className={`group relative rounded-xl border px-4 py-4 text-left transition-colors ${
                  active
                    ? 'border-brand/55 bg-brand-soft'
                    : 'border-line bg-surface-elevated hover:border-line-strong hover:bg-surface-secondary'
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-heading text-[0.95rem] font-semibold text-ink">
                    {s.label}
                  </span>
                  {active ? (
                    <span className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-teal-light">
                      Active
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 font-sans text-[0.78rem] leading-snug text-ink-muted">
                  {s.audience}
                </p>
                <p className="mt-2 font-sans text-[0.82rem] leading-relaxed text-ink-secondary">
                  {s.description}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 font-sans text-[0.72rem] text-ink-faint">
                  <dt className="text-ink-muted">Persona</dt>
                  <dd className="text-ink">{s.persona.callsign}</dd>
                  <dt className="text-ink-muted">Role</dt>
                  <dd className="text-ink">{s.persona.role}</dd>
                  <dt className="text-ink-muted">Region</dt>
                  <dd className="text-ink">{s.persona.region}</dd>
                </dl>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="demo-hub-controls" className="space-y-3">
        <h2
          id="demo-hub-controls"
          className="font-heading text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-ink-secondary"
        >
          Controls
        </h2>
        <div className="flex flex-wrap gap-3">
          {resumeStep ? (
            <button
              type="button"
              onClick={resumeWalkthrough}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-brand/55 bg-brand-soft px-5 font-heading text-[0.88rem] font-semibold text-teal-light"
            >
              <History className="h-4 w-4" aria-hidden />
              Resume at step {(lastStepIndex ?? 0) + 1}
              <span className="font-sans text-[0.78rem] font-normal text-teal-light/70">
                · {resumeStep.title}
              </span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={restartWalkthrough}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal px-5 font-heading text-[0.88rem] font-semibold text-navy"
          >
            <Play className="h-4 w-4" aria-hidden />
            Start from step 1
          </button>
          <button
            type="button"
            onClick={() => goToStepIndex(Math.max(0, currentStepIndex))}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-line-strong bg-transparent px-5 text-[0.88rem] text-ink-secondary hover:border-line hover:bg-surface-elevated"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Replay current step
          </button>
          <Link
            to={notesUrl}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-5 text-[0.88rem] transition-colors ${
              presenterNotesActive
                ? 'border-brand/55 bg-brand-soft text-teal-light'
                : 'border-line-strong bg-transparent text-ink-secondary hover:border-line hover:bg-surface-elevated'
            }`}
            aria-pressed={presenterNotesActive}
          >
            <StickyNote className="h-4 w-4" aria-hidden />
            {presenterNotesActive ? 'Notes overlay on' : 'Notes overlay off'}
          </Link>
          <button
            type="button"
            onClick={exitDemo}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-line bg-transparent px-5 text-[0.88rem] text-ink-muted hover:border-amber/40 hover:text-amber"
          >
            Exit tour
          </button>
        </div>
        <p className="font-sans text-[0.75rem] text-ink-muted">
          Tip: append <code className="text-ink-secondary">?notes=1</code> to any tour URL to show
          the presenter notes sidebar (right-side, desktop only).
        </p>
      </section>

      <section aria-labelledby="demo-hub-steps" className="space-y-3">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-teal-light" aria-hidden />
          <h2
            id="demo-hub-steps"
            className="font-heading text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-ink-secondary"
          >
            Steps
          </h2>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-muted">
            {DEMO_MAIN_STEPS.length} total
          </span>
        </div>
        <ol className="divide-y divide-line/60 overflow-hidden rounded-xl border border-line bg-surface-elevated">
          {stepRows.map((row) => {
            const shareUrl = buildShareUrl(row.path, scenario.id as DemoScenarioId);
            const copied = copiedStepId === row.id;
            return (
              <li key={row.id} className="relative">
                <div
                  className={`flex w-full items-start gap-4 px-4 py-3 text-left transition-colors ${
                    row.active ? 'bg-brand-soft text-ink' : 'text-ink-secondary'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => goToStepIndex(row.index)}
                    aria-label={`Jump to step ${row.index + 1}: ${row.title}`}
                    className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[0.7rem] font-semibold transition-colors ${
                      row.active
                        ? 'border-brand/65 bg-brand-soft text-teal-light'
                        : 'border-line bg-surface-secondary text-ink-faint hover:border-line-strong'
                    }`}
                  >
                    {String(row.index + 1).padStart(2, '0')}
                  </button>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => goToStepIndex(row.index)}
                      className="block w-full text-left"
                    >
                      <p className="font-heading text-[0.92rem] font-semibold text-ink">
                        {row.title}
                      </p>
                      {row.description ? (
                        <p className="mt-0.5 font-sans text-[0.78rem] leading-snug text-ink-muted">
                          {row.description}
                        </p>
                      ) : null}
                    </button>
                    {row.notes ? (
                      <p className="mt-2 rounded-md bg-surface-secondary px-3 py-2 font-sans text-[0.78rem] leading-relaxed text-ink-secondary">
                        <span className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                          Talk-track
                        </span>{' '}
                        {row.notes}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <code className="font-mono text-[0.7rem] text-ink-subtle">{shareUrl}</code>
                      <button
                        type="button"
                        onClick={() => void handleCopy(row.id, shareUrl)}
                        className={`inline-flex min-h-[28px] items-center gap-1 rounded-md border px-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] transition-colors ${
                          copied
                            ? 'border-brand/55 bg-brand-soft text-teal-light'
                            : 'border-line bg-transparent text-ink-muted hover:border-line-strong hover:text-ink-secondary'
                        }`}
                        aria-live="polite"
                      >
                        {copied ? (
                          <Check className="h-3 w-3" aria-hidden />
                        ) : (
                          <Copy className="h-3 w-3" aria-hidden />
                        )}
                        {copied ? 'Copied' : 'Copy URL'}
                      </button>
                    </div>
                  </div>
                  <ArrowRight
                    className={`mt-1 h-4 w-4 shrink-0 ${
                      row.active ? 'text-teal-light' : 'text-ink-subtle'
                    }`}
                    aria-hidden
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </section>
  );
}
