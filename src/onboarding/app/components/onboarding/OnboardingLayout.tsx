import { useState } from 'react';
import { SquadLogo, MENDguildWordmark } from '../../../../components';
import { useOnboardingShell } from './OnboardingShellContext';

interface Props {
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  /** Arrow (default) or visible text on the forward control. */
  forwardControl?: 'arrow' | 'text';
  /** Arrow mode: screen-reader label. Text mode: visible label. */
  nextLabel?: string;
  nextDisabled?: boolean;
  /** Guided tour: brief ring pulse before advancing (Mission → Identity). */
  pulseForwardAdvance?: boolean;
  /** Short trust / safety line (anonymity, verification, data). */
  trustNote?: string;
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 6 10"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 1L1 5l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 6 10"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 1l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function OnboardingLayout({
  children,
  onBack,
  onNext,
  forwardControl = 'arrow',
  nextLabel = 'Next',
  nextDisabled = false,
  pulseForwardAdvance = false,
  trustNote = 'Anonymous in the room. No transcript leaves without your action. Data handling follows your consent.',
}: Props) {
  const [forwardPulse, setForwardPulse] = useState(false);
  const heightMode = useOnboardingShell();
  const rootSizeClass =
    heightMode === 'fill' ? 'h-full min-h-0 max-h-full' : 'h-dvh max-h-dvh min-h-0';

  const runForward = () => {
    if (nextDisabled) return;
    if (!pulseForwardAdvance) {
      onNext?.();
      return;
    }
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      onNext?.();
      return;
    }
    setForwardPulse(true);
    window.setTimeout(() => {
      setForwardPulse(false);
      onNext?.();
    }, 450);
  };

  const forwardWrapClass = 'relative inline-flex shrink-0 items-center justify-center';

  return (
    <div
      className={`flex ${rootSizeClass} flex-col overflow-hidden bg-onboarding-bg pt-5 text-ink sm:pt-6`}
    >
      <main className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto overscroll-y-contain px-5 py-2 sm:px-6 sm:py-3">
        <div className="mx-auto flex min-h-0 w-full max-w-[960px] flex-1 flex-col justify-center">
          <div className="flex min-h-0 w-full max-w-full flex-col gap-3 sm:gap-4">
            <div className="inline-flex shrink-0 items-center gap-2 self-start sm:gap-[0.525rem]">
              <SquadLogo size={34} className="block h-[34px] w-[34px] shrink-0" aria-hidden />
              <MENDguildWordmark
                alt=""
                className="h-[1.4rem] w-auto max-w-[min(140px,32vw)] translate-y-px sm:h-[1.575rem] md:h-[1.75rem]"
                aria-hidden
              />
            </div>
            <div className="min-h-0">{children}</div>
            {trustNote ? (
              <p
                className="mt-4 max-w-2xl font-sans text-[0.7rem] leading-relaxed text-ink-subtle/90 sm:mt-5"
                role="note"
              >
                {trustNote}
              </p>
            ) : null}
          </div>
        </div>
      </main>

      <footer className="flex shrink-0 items-center justify-between border-t border-white/5 px-6 py-3 sm:px-8 sm:py-[1.125rem]">
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          aria-label="Back"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] text-ink-muted transition-colors duration-150 hover:border-teal/25 hover:text-ink disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronLeft />
        </button>
        {forwardControl === 'text' ? (
          <span className={forwardWrapClass}>
            {forwardPulse ? (
              <span
                aria-hidden
                className="sr-demo-forward-pulse-ring pointer-events-none absolute left-1/2 top-1/2 z-0 h-12 w-12 rounded-full border-2 border-teal/80"
              />
            ) : null}
            <button
              type="button"
              data-demo="onboarding-forward"
              onClick={runForward}
              disabled={nextDisabled}
              className="relative z-[1] shrink-0 rounded-lg border border-white/[0.06] px-4 py-2.5 text-[0.8125rem] font-medium text-ink transition-colors duration-150 hover:border-teal/35 hover:text-teal disabled:pointer-events-none disabled:opacity-30"
            >
              {nextLabel}
            </button>
          </span>
        ) : (
          <span className={forwardWrapClass}>
            {forwardPulse ? (
              <span
                aria-hidden
                className="sr-demo-forward-pulse-ring pointer-events-none absolute left-1/2 top-1/2 z-0 h-12 w-12 rounded-full border-2 border-teal/80"
              />
            ) : null}
            <button
              type="button"
              data-demo="onboarding-forward"
              onClick={runForward}
              disabled={nextDisabled}
              aria-label={nextLabel}
              className="relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] text-ink transition-colors duration-150 hover:border-teal/35 hover:text-teal disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight />
            </button>
          </span>
        )}
      </footer>
    </div>
  );
}
