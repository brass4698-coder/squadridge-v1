import { useEffect, type ReactNode } from 'react';
import { useDemoWalkthrough } from './DemoWalkthroughContext';
import { DemoOverlay } from './DemoOverlay';

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
 * Demo chrome: top banner, bottom bar, optional overlays, Space-to-advance (when not typing).
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
    exitDemo,
  } = useDemoWalkthrough();

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
        <div
          className="relative z-[5] border-b border-amber/25 bg-amber/10 px-gutter py-2.5 text-center"
          role="status"
        >
          <p className="font-sans text-[0.8rem] leading-snug text-amber/95 md:text-[0.85rem]">
            Guided simulation. Seeded data only; no live disputes or real people.
          </p>
        </div>
      ) : null}
      {children}
      {showDemoChrome ? (
        <>
          <DemoOverlay steps={currentStep?.overlaySteps} layoutKey={currentStepIndex} />
          <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-navy-light/60 bg-[#070b12]/95 px-gutter py-3 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
                {currentStepIndex >= 0 && currentStepTitle ? (
                  <>
                    Step {currentStepIndex + 1} · {currentStepTitle}
                  </>
                ) : (
                  <>Guided tour</>
                )}
              </p>
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
