import { useEffect, useState, type ReactNode } from 'react';
import { useDemoWalkthrough } from './DemoWalkthroughContext';
import { DemoOverlay } from './DemoOverlay';
import { DemoExitConfirm } from './DemoExitConfirm';
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
  if (target.closest('[role="dialog"]')) return true;
  return false;
}

/**
 * Demo chrome: corner progress pill, dismissible badge, spotlight overlay, compact nav.
 * All tour styles scoped via `data-demo-active` / `.demoActive` on `document.body`.
 */
export function DemoLayout({ children }: Props) {
  const {
    demoActive,
    showDemoChrome,
    currentStepIndex,
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
  const [badgeDismissed, setBadgeDismissed] = useState(false);

  const stepCount = DEMO_MAIN_STEPS.length;
  const progressPct =
    tipTotal > 0 && tipOrdinal > 0
      ? Math.round((tipOrdinal / tipTotal) * 100)
      : currentStepIndex >= 0
        ? Math.round(((currentStepIndex + 1) / stepCount) * 100)
        : 0;
  const progressNow = tipOrdinal || currentStepIndex + 1;
  const progressMax = tipTotal || stepCount;

  // Scope demo-only CSS under a single root flag (rip-out friendly).
  useEffect(() => {
    if (!demoActive) {
      document.body.removeAttribute('data-demo-active');
      document.body.classList.remove('demoActive');
      return;
    }
    document.body.setAttribute('data-demo-active', '');
    document.body.classList.add('demoActive');
    return () => {
      document.body.removeAttribute('data-demo-active');
      document.body.classList.remove('demoActive');
    };
  }, [demoActive]);

  useEffect(() => {
    setBadgeDismissed(false);
  }, [currentStep?.id]);

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
      {children}
      {showDemoChrome ? (
        <>
          {!badgeDismissed ? (
            <div className="sr-tour-badge" role="status">
              <span className="sr-tour-badge__label">Tour</span>
              <span className="sr-tour-badge__hint">Space · Next</span>
              <button
                type="button"
                className="sr-tour-badge__dismiss"
                onClick={() => setBadgeDismissed(true)}
                aria-label="Dismiss tour badge"
              >
                ×
              </button>
            </div>
          ) : null}

          <div
            className="sr-tour-progress-pill"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={progressMax}
            aria-valuenow={progressNow}
            aria-label="Tour progress"
          >
            <span className="sr-tour-progress-pill__label">
              {progressNow}/{progressMax}
            </span>
            <div className="sr-tour-progress-pill__track">
              <div className="sr-tour-progress-pill__bar" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <DemoOverlay
            step={currentStep}
            tip={currentTip}
            tipIndex={tipIndex}
            tipCount={currentTips.length}
            tipOrdinal={tipOrdinal}
            tipTotal={tipTotal}
            sheetMinimized={sheetMinimized}
            onMinimizeSheet={() => setSheetMinimized(true)}
            onExpandSheet={() => setSheetMinimized(false)}
            layoutKey={`${currentStep?.id ?? ''}-${tipIndex}`}
          />

          <footer className="sr-tour-footer">
            <div className="sr-tour-footer__inner">
              <p className="sr-tour-footer__meta">
                {currentStepIndex >= 0 ? (
                  <>
                    {currentStepIndex + 1}/{stepCount}
                    {tipTotal > 0 ? (
                      <span className="sr-tour-footer__meta-muted">
                        {' '}
                        · tip {tipOrdinal}/{tipTotal}
                      </span>
                    ) : null}
                  </>
                ) : (
                  'Tour'
                )}
              </p>
              <div className="sr-tour-footer__actions">
                <button
                  type="button"
                  className="sr-tour-btn"
                  disabled={!canGoBack}
                  onClick={goBack}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="sr-tour-btn sr-tour-btn--primary"
                  disabled={!canGoNext}
                  onClick={goNext}
                >
                  Next
                </button>
                <button type="button" className="sr-tour-btn" onClick={() => setExitOpen(true)}>
                  Exit
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
