import { useEffect, type ReactNode } from 'react';
import { useDemoWalkthrough } from './DemoWalkthroughContext';
import { DemoOverlay } from './DemoOverlay';
import { DEMO_MAIN_STEPS } from './demoScript';
import { workspaceRoleFromPath } from '../lib/workspaceRole';
import { useLocation } from 'react-router-dom';

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
 * Demo chrome: top banner, progress, bottom bar, directional bubbles, Space-to-advance.
 */
export function DemoLayout({ children }: Props) {
  const location = useLocation();
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
    exitDemo,
  } = useDemoWalkthrough();

  const roleAccent = workspaceRoleFromPath(location.pathname);
  const stepCount = DEMO_MAIN_STEPS.length;
  const progressPct =
    currentStepIndex >= 0 ? Math.round(((currentStepIndex + 1) / stepCount) * 100) : 0;

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

  return (
    <>
      {showDemoChrome ? (
        <div className="sr-tour-banner relative z-[5] px-gutter py-0" role="status">
          <div className="sr-tour-progress" aria-hidden>
            <div className="sr-tour-progress__bar" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2.5 text-center">
            <p className="font-sans text-[0.8rem] leading-snug text-slate-200/95 md:text-[0.85rem]">
              Guided tour — seeded data only. Scroll for hints · Space or Next to advance.
            </p>
            {roleAccent ? (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em] sr-chip-role-${roleAccent}`}
              >
                <span className="size-1.5 rounded-full bg-current opacity-80" aria-hidden />
                {roleAccent} view
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
      {children}
      {showDemoChrome ? (
        <>
          <DemoOverlay steps={currentStep?.overlaySteps} layoutKey={currentStepIndex} />
          <footer className="sr-tour-footer fixed bottom-0 left-0 right-0 z-50 px-4 py-3.5 pb-[max(0.85rem,env(safe-area-inset-bottom))] sm:px-6">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {currentStepIndex >= 0 ? (
                    <>
                      Step {currentStepIndex + 1} of {stepCount}
                    </>
                  ) : (
                    <>Guided tour</>
                  )}
                </p>
                {currentStepTitle ? (
                  <p className="mt-0.5 truncate font-sans text-sm font-medium text-slate-100">
                    {currentStepTitle}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <button
                  type="button"
                  className="min-h-[2.5rem] rounded-lg border border-slate-500/80 bg-transparent px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:border-slate-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!canGoBack}
                  onClick={goBack}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="min-h-[2.5rem] rounded-lg bg-[color:var(--sr-primary)] px-4 py-2 text-sm font-semibold text-[color:var(--sr-on-primary)] shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!canGoNext}
                  onClick={goNext}
                >
                  Next →
                </button>
                <button
                  type="button"
                  className="min-h-[2.5rem] rounded-lg border border-slate-600/80 bg-transparent px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-100"
                  onClick={exitDemo}
                >
                  Skip
                </button>
              </div>
            </div>
          </footer>
        </>
      ) : null}
    </>
  );
}
