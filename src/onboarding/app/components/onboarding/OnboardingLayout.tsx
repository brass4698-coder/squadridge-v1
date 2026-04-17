import { SquadRidgeWordmark } from '../../../../components/SquadRidgeWordmark';

interface Props {
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  /** Arrow (default) or visible text on the forward control. */
  forwardControl?: 'arrow' | 'text';
  /** Arrow mode: screen-reader label. Text mode: visible label. */
  nextLabel?: string;
  nextDisabled?: boolean;
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 6 10" fill="none" aria-hidden="true">
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
    <svg className={className} width="20" height="20" viewBox="0 0 6 10" fill="none" aria-hidden="true">
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
}: Props) {
  return (
    <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-onboarding-bg pt-5 text-ink sm:pt-6">
      <main className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-5 py-2 sm:px-6 sm:py-3">
        <div className="mx-auto flex min-h-0 w-full max-w-[960px] flex-1 flex-col justify-center">
          <div className="flex min-h-0 w-full max-w-full flex-col gap-3 sm:gap-4">
            <div className="inline-flex shrink-0 items-center gap-2 self-start sm:gap-[0.525rem]">
              <img
                src="/assets/logo.png"
                alt=""
                aria-hidden="true"
                className="h-[34px] w-[34px] shrink-0 object-contain"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.src.includes('/logo-bridge.svg')) {
                    img.src = '/logo-bridge.svg';
                  }
                }}
              />
              <SquadRidgeWordmark
                alt=""
                className="h-[1.4rem] w-auto max-w-[min(140px,32vw)] translate-y-px sm:h-[1.575rem] md:h-[1.75rem]"
                aria-hidden
              />
            </div>
            <div className="min-h-0">{children}</div>
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
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="shrink-0 rounded-lg border border-white/[0.06] px-4 py-2.5 text-[0.8125rem] font-medium text-ink transition-colors duration-150 hover:border-teal/35 hover:text-teal disabled:pointer-events-none disabled:opacity-30"
          >
            {nextLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            aria-label={nextLabel}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] text-ink transition-colors duration-150 hover:border-teal/35 hover:text-teal disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight />
          </button>
        )}
      </footer>
    </div>
  );
}
