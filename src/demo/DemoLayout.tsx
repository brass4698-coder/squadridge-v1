import { useEffect, useState, type ReactNode } from 'react';
import { useDemoWalkthrough } from './DemoWalkthroughContext';
import { DemoOverlay } from './DemoOverlay';
import { DemoExitConfirm } from './DemoExitConfirm';
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
  if (target.closest('[role="dialog"]')) return true;
  return false;
}

/**
 * Demo chrome: top banner, progress, bottom bar, side sheet + callout, Space-to-advance.
 */
export function DemoLayout({ children }: Props) {
  const location = useLocation();
  const {
    demoActive,
    showDemoChrome,
    currentStepIndex,
    currentStepTitle,
    currentStep,
    currentTip,
    currentTips,
    tipIndex,
    tipOrdinal,
    tipTotal,
    canGoNext,
    canGoBack,
    sheetMinimized,
    setSheetMinimized,
    goNext,
    goBack,
    exitDemo,
  } = useDemoWalkthrough();

  const [exitOpen, setExitOpen] = useState(false);

  const roleAccent = workspaceRoleFromPath(location.pathname);
  const stepCount = DEMO_MAIN_STEPS.length;
  const progressPct =
    tipTotal > 0 && tipOrdinal > 0
      ? Math.round((tipOrdinal / tipTotal) * 100)
      : currentStepIndex >= 0
        ? Math.round(((currentStepIndex + 1) / stepCount) * 100)
        : 0;

  useEffect(() => {
    if (!demoActive || !showDemoChrome || exitOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ') return;
      if (isSpaceAdvanceBlocked(event.target)) return;
      event.preventDefault();
      goNext();
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [demoActive, showDemoChrome, goNext, exitOpen]);

  return (
    <>
      {showDemoChrome ? (
        <div className="sr-tour-banner relative z-[5] px-gutter py-0" role="status">
          <div
            className="sr-tour-progress"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={tipTotal || stepCount}
            aria-valuenow={tipOrdinal || currentStepIndex + 1}
            aria-label="Tour progress"
          >
            <div className="sr-tour-progress__bar" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2.5 text-center">
            <p className="font-sans text-[0.8rem] leading-snug text-ink md:text-[0.85rem]">
              Guided tour · illustrative data · Space or Next to advance
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
          <DemoOverlay
            step={currentStep}
            tip={currentTip}
            tipIndex={tipIndex}
            tipCount={currentTips.length}
            stepIndex={currentStepIndex}
            stepCount={stepCount}
            tipOrdinal={tipOrdinal}
            tipTotal={tipTotal}
            sheetMinimized={sheetMinimized}
            onMinimizeSheet={() => setSheetMinimized(true)}
            onExpandSheet={() => setSheetMinimized(false)}
            layoutKey={`${currentStep?.id ?? ''}-${tipIndex}`}
          />
          <footer className="sr-tour-footer fixed bottom-0 left-0 right-0 z-50 px-4 py-3.5 pb-[max(0.85rem,env(safe-area-inset-bottom))] sm:px-6">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  {currentStepIndex >= 0 ? (
                    <>
                      Step {currentStepIndex + 1} of {stepCount}
                      {tipTotal > 0 ? (
                        <span className="text-ink-secondary">
                          {' '}
                          · tip {tipOrdinal}/{tipTotal}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <>Guided tour</>
                  )}
                </p>
                {currentStepTitle ? (
                  <p className="mt-0.5 truncate font-sans text-sm font-medium text-ink">
                    {currentStepTitle}
                    {currentTip?.title ? (
                      <span className="font-normal text-ink-secondary"> — {currentTip.title}</span>
                    ) : null}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <button
                  type="button"
                  className="min-h-[2.5rem] rounded-lg border border-line-strong bg-transparent px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--sr-focus)]"
                  disabled={!canGoBack}
                  onClick={goBack}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="min-h-[2.5rem] rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-on shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--sr-focus)]"
                  disabled={!canGoNext}
                  onClick={goNext}
                >
                  Next
                </button>
                <button
                  type="button"
                  className="min-h-[2.5rem] rounded-lg border border-line bg-transparent px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:border-line-strong hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--sr-focus)]"
                  onClick={() => setExitOpen(true)}
                >
                  Exit tour
                </button>
              </div>
            </div>
          </footer>
          <DemoExitConfirm
            open={exitOpen}
            onCancel={() => setExitOpen(false)}
            onConfirm={() => {
              setExitOpen(false);
              exitDemo();
            }}
          />
        </>
      ) : null}
    </>
  );
}
