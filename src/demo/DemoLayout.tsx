import { useEffect, useState, type ReactNode } from 'react';
import { useDemoWalkthrough } from './DemoWalkthroughContext';
import { DemoOverlay } from './DemoOverlay';
import { DEMO_MAIN_STEPS } from './demoScript';

type Props = {
  children: ReactNode;
};

function isSpaceAdvanceBlocked(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return true;
  if (target.closest('[contenteditable="true"]')) return true;
  if (target.closest('button, [role="button"], a[href], input, textarea, select')) return true;
  return false;
}

/**
 * Demo chrome: top banner, bottom bar with step picker, optional presenter notes
 * sidebar (`?notes=1`), overlays, Space-to-advance (when not typing).
 *
 * Safe to delete with `src/demo/` — core routes ignore this.
 */
export function DemoLayout({ children }: Props) {
  const {
    demoActive,
    showDemoChrome,
    currentStepIndex,
    currentStepTitle,
    currentStep,
    canGoNext,
    canGoBack,
    goNext,
    goBack,
    goToStepIndex,
    restartWalkthrough,
    exitDemo,
    presenterNotesActive,
    scenario,
  } = useDemoWalkthrough();

  const [stepPickerOpen, setStepPickerOpen] = useState(false);

  useEffect(() => {
    if (!demoActive || !showDemoChrome) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ') return;
      if (isSpaceAdvanceBlocked(event.target)) return;
      event.preventDefault();
      goNext();
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [demoActive, showDemoChrome, goNext]);

  useEffect(() => {
    setStepPickerOpen(false);
  }, [currentStepIndex]);

  return (
    <>
      {showDemoChrome ? (
        <div
          className="relative z-[5] border-b border-amber/25 bg-amber/10 px-gutter py-2.5 text-center"
          role="status"
        >
          <p className="font-sans text-[0.8rem] leading-snug text-amber/95 md:text-[0.85rem]">
            Guided simulation · {scenario.shortLabel} · Seeded data only; no live disputes or real
            people.
          </p>
        </div>
      ) : null}
      {children}
      {showDemoChrome ? (
        <>
          <DemoOverlay steps={currentStep?.overlaySteps} layoutKey={currentStepIndex} />
          {presenterNotesActive && currentStep ? (
            <aside
              className="fixed bottom-[5.25rem] right-4 z-50 hidden max-w-[20rem] rounded-lg border border-teal-500/40 bg-[#0a1118]/95 p-4 backdrop-blur-md md:block"
              aria-label="Presenter notes"
            >
              <p className="mb-1 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-teal-light">
                Presenter notes · Step {currentStepIndex + 1}
              </p>
              <p className="font-sans text-[0.82rem] leading-relaxed text-slate-200">
                {currentStep.presenterNotes ??
                  'No talk-track yet — add a `presenterNotes` field on this step in `demoScript.ts`.'}
              </p>
              <p className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-slate-500">
                Toggle: drop <code>?notes=1</code> from URL to hide.
              </p>
            </aside>
          ) : null}
          {stepPickerOpen ? (
            <div
              className="fixed bottom-[5.25rem] left-1/2 z-50 w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-slate-700/80 bg-[#070b12]/96 p-3 shadow-2xl backdrop-blur-md"
              role="dialog"
              aria-label="Step picker"
            >
              <p className="mb-2 px-1 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Jump to step
              </p>
              <ul className="grid max-h-[60vh] grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
                {DEMO_MAIN_STEPS.map((step, idx) => {
                  const active = idx === currentStepIndex;
                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        onClick={() => goToStepIndex(idx)}
                        className={`flex w-full items-baseline justify-between gap-3 rounded-md border px-3 py-2 text-left transition-colors ${
                          active
                            ? 'border-teal-500/45 bg-teal-500/10 text-teal-light'
                            : 'border-transparent bg-white/[0.02] text-slate-300 hover:border-slate-600 hover:bg-white/[0.05] hover:text-slate-100'
                        }`}
                      >
                        <span className="font-sans text-[0.85rem] font-medium leading-tight">
                          <span className="font-mono text-[0.7rem] text-slate-500">
                            {String(idx + 1).padStart(2, '0')}
                          </span>{' '}
                          {step.title}
                        </span>
                        {active ? (
                          <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-teal-light">
                            current
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
          <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-navy-light/60 bg-[#070b12]/95 px-gutter py-3 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {currentStepIndex >= 0 && currentStepTitle ? (
                    <>
                      Step {currentStepIndex + 1}/{DEMO_MAIN_STEPS.length} · {currentStepTitle}
                    </>
                  ) : (
                    <>Guided tour · {scenario.shortLabel}</>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setStepPickerOpen((prev) => !prev)}
                  className="rounded-md border border-slate-600 bg-transparent px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-slate-300 hover:border-teal-500/50 hover:text-teal-light"
                  aria-expanded={stepPickerOpen}
                  aria-controls="demo-step-picker"
                >
                  Steps
                </button>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <button
                  type="button"
                  className="btn-secondary min-h-[2.5rem] px-4 py-2 text-sm"
                  disabled={!canGoBack}
                  onClick={goBack}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-secondary min-h-[2.5rem] px-4 py-2 text-sm"
                  disabled={!canGoNext}
                  onClick={goNext}
                >
                  Next
                </button>
                <button
                  type="button"
                  className="min-h-[2.5rem] rounded-md border border-slate-600 bg-transparent px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:bg-white/5"
                  onClick={restartWalkthrough}
                  title="Restart from step 1"
                >
                  Restart
                </button>
                <button
                  type="button"
                  className="min-h-[2.5rem] rounded-md border border-slate-600 bg-transparent px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:bg-white/5"
                  onClick={exitDemo}
                >
                  Exit tour
                </button>
              </div>
            </div>
          </footer>
        </>
      ) : null}
    </>
  );
}
