import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ListChecks, Play, RefreshCw, Sparkles, StickyNote } from 'lucide-react';
import { useDemoWalkthrough } from '../../demo/DemoWalkthroughContext';
import { DEMO_MAIN_STEPS, DEMO_SCENARIOS, type DemoScenarioId } from '../../demo';

/**
 * Presenter hub: scenario picker + step list + restart/notes toggles.
 *
 * Sits behind RequireAuth + RequireModerator. Surfaces all of the controls a
 * presenter needs in one place so the live demo never has to "find" the right
 * URL during the call:
 *
 *   - Scenario chips (cross-border corridor / workplace / veterans).
 *   - Numbered step list with current-step indicator and one-click jump.
 *   - Restart, presenter notes toggle, exit.
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
    exitDemo,
  } = useDemoWalkthrough();

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

  return (
    <section className="space-y-8" aria-labelledby="demo-hub-title">
      <header className="space-y-3">
        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-amber/90">
          Presenter
        </p>
        <h1
          id="demo-hub-title"
          className="font-heading text-2xl font-semibold tracking-tight text-slate-100"
        >
          Demo command center
        </h1>
        <p className="max-w-prose font-sans text-[0.9rem] leading-relaxed text-slate-400">
          One-screen control for the scripted product walkthrough. Pick a scenario, jump to any
          step, and toggle the presenter notes overlay. The live tour at <code>?demo=1</code> picks
          up the same scenario; switching here updates onboarding, intent, profile, and the offline
          session in one go.
        </p>
      </header>

      <section aria-labelledby="demo-hub-scenarios" className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-light" aria-hidden />
          <h2
            id="demo-hub-scenarios"
            className="font-heading text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-slate-300"
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
                    ? 'border-teal-500/45 bg-teal-500/[0.06]'
                    : 'border-slate-700/70 bg-white/[0.02] hover:border-slate-500/80 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-heading text-[0.95rem] font-semibold text-slate-100">
                    {s.label}
                  </span>
                  {active ? (
                    <span className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-teal-light">
                      Active
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 font-sans text-[0.78rem] leading-snug text-slate-500">
                  {s.audience}
                </p>
                <p className="mt-2 font-sans text-[0.82rem] leading-relaxed text-slate-300">
                  {s.description}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 font-sans text-[0.72rem] text-slate-400">
                  <dt className="text-slate-500">Persona</dt>
                  <dd className="text-slate-200">{s.persona.callsign}</dd>
                  <dt className="text-slate-500">Role</dt>
                  <dd className="text-slate-200">{s.persona.role}</dd>
                  <dt className="text-slate-500">Region</dt>
                  <dd className="text-slate-200">{s.persona.region}</dd>
                </dl>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="demo-hub-controls" className="space-y-3">
        <h2
          id="demo-hub-controls"
          className="font-heading text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-slate-300"
        >
          Controls
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={restartWalkthrough}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal px-5 font-heading text-[0.88rem] font-semibold text-[#0b0f1a]"
          >
            <Play className="h-4 w-4" aria-hidden />
            Start from step 1
          </button>
          <button
            type="button"
            onClick={() => goToStepIndex(Math.max(0, currentStepIndex))}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-600 bg-transparent px-5 text-[0.88rem] text-slate-200 hover:border-slate-500 hover:bg-white/5"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Replay current step
          </button>
          <Link
            to={notesUrl}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-5 text-[0.88rem] transition-colors ${
              presenterNotesActive
                ? 'border-teal-500/45 bg-teal-500/[0.08] text-teal-light'
                : 'border-slate-600 bg-transparent text-slate-200 hover:border-slate-500 hover:bg-white/5'
            }`}
            aria-pressed={presenterNotesActive}
          >
            <StickyNote className="h-4 w-4" aria-hidden />
            {presenterNotesActive ? 'Notes overlay on' : 'Notes overlay off'}
          </Link>
          <button
            type="button"
            onClick={exitDemo}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-700 bg-transparent px-5 text-[0.88rem] text-slate-400 hover:border-amber/40 hover:text-amber"
          >
            Exit tour
          </button>
        </div>
        <p className="font-sans text-[0.75rem] text-slate-500">
          Tip: append <code className="text-slate-300">?notes=1</code> to any tour URL to show the
          presenter notes sidebar (right-side, desktop only).
        </p>
      </section>

      <section aria-labelledby="demo-hub-steps" className="space-y-3">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-teal-light" aria-hidden />
          <h2
            id="demo-hub-steps"
            className="font-heading text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-slate-300"
          >
            Steps
          </h2>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-slate-500">
            {DEMO_MAIN_STEPS.length} total
          </span>
        </div>
        <ol className="divide-y divide-slate-800/60 overflow-hidden rounded-xl border border-slate-800/80 bg-white/[0.02]">
          {stepRows.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => goToStepIndex(row.index)}
                className={`flex w-full items-start gap-4 px-4 py-3 text-left transition-colors ${
                  row.active
                    ? 'bg-teal-500/[0.06] text-slate-100'
                    : 'text-slate-300 hover:bg-white/[0.03]'
                }`}
              >
                <span
                  className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[0.7rem] font-semibold ${
                    row.active
                      ? 'border-teal-500/55 bg-teal-500/15 text-teal-light'
                      : 'border-slate-700 bg-slate-900/40 text-slate-400'
                  }`}
                  aria-hidden
                >
                  {String(row.index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-[0.92rem] font-semibold text-slate-100">
                    {row.title}
                  </p>
                  {row.description ? (
                    <p className="mt-0.5 font-sans text-[0.78rem] leading-snug text-slate-500">
                      {row.description}
                    </p>
                  ) : null}
                  {row.notes ? (
                    <p className="mt-2 rounded-md bg-slate-900/60 px-3 py-2 font-sans text-[0.78rem] leading-relaxed text-slate-300">
                      <span className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Talk-track
                      </span>{' '}
                      {row.notes}
                    </p>
                  ) : null}
                  <p className="mt-2 font-mono text-[0.7rem] text-slate-600">{row.path}</p>
                </div>
                <ArrowRight
                  className={`mt-1 h-4 w-4 shrink-0 ${
                    row.active ? 'text-teal-light' : 'text-slate-600'
                  }`}
                  aria-hidden
                />
              </button>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
