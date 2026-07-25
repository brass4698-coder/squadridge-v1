import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../ui/utils';
import { useOnboardingMotion } from './onboardingMotion';

export type OnboardingNavMode = 'first' | 'middle' | 'last';

/** Shared ink: white at rest; desaturated amber on hover/active (matches ghost chevrons). */
const ghostNavInk =
  'text-white transition-[color,transform] duration-200 ease-out hover:text-[color-mix(in_srgb,var(--color-onboarding-accent)_68%,#78716c)] active:text-[color-mix(in_srgb,var(--color-onboarding-accent)_78%,#78716c)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-onboarding-accent/45 motion-reduce:transition-colors';

/** Ghost nav chevrons: no card chrome; subtle hover zoom. */
const iconBtn = cn(
  'inline-flex h-11 w-11 shrink-0 items-center justify-center border-0 bg-transparent p-0 shadow-none hover:scale-[1.06] active:scale-100 motion-reduce:hover:scale-100',
  ghostNavInk,
);

/** Finalize CTA: same ink as chevrons; no border/fill/shadow; gentler hover scale than icons. */
const finalizeBtn = cn(
  'inline-flex w-full items-center justify-center border-0 bg-transparent px-6 py-3 font-sans text-[12px] font-semibold tracking-[0.02em] shadow-none hover:scale-[1.02] active:scale-100 motion-reduce:hover:scale-100 sm:w-auto sm:min-w-[min(100%,280px)] sm:shrink-0 sm:text-[13px]',
  ghostNavInk,
);

/** Stronger primary: border, fill, glow — for consent-heavy steps. */
const finalizeBtnEmphasis = cn(
  'inline-flex w-full items-center justify-center rounded-md border border-onboarding-accent/45 bg-onboarding-accent/[0.1] px-8 py-3.5 font-sans text-[12px] font-semibold tracking-[0.03em] text-white shadow-[0_0_26px_-8px_rgba(201,166,107,0.35)] transition-[color,transform,box-shadow,border-color] duration-200 ease-out hover:scale-[1.02] hover:border-onboarding-accent/65 hover:shadow-[0_0_32px_-6px_rgba(201,166,107,0.45)] active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-onboarding-accent/55 motion-reduce:hover:scale-100 sm:w-auto sm:min-w-[min(100%,300px)] sm:shrink-0 sm:text-[13px]',
);

const backBtnLabeled = cn(
  'inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-transparent bg-transparent px-2 py-2 transition-[color,transform,border-color] hover:border-white/10 hover:bg-white/[0.03]',
  ghostNavInk,
);

interface OnboardingFooterProps {
  /** Omit on step 1 when body copy carries the message (no pull-quote block). */
  tagline?: string;
  onNext: () => void;
  onBack?: () => void;
  navMode: OnboardingNavMode;
  finalizeLabel?: string;
  /** When `navMode` is `last`, disables the primary CTA (e.g. until rules accepted). */
  nextDisabled?: boolean;
  delay?: number;
  /** Large emotional anchor vs standard pull-quote (when tagline is set) */
  taglineEmphasis?: 'default' | 'hero';
  /** Show “Back” next to the chevron for clearer affordance */
  backAffordance?: 'icon' | 'labeled';
  /** Ghost (default) vs bordered/glow primary CTA when `navMode` is `last` */
  finalizeVariant?: 'ghost' | 'emphasis';
}

export function OnboardingFooter({
  tagline,
  onNext,
  onBack,
  navMode,
  finalizeLabel = 'Continue to verification',
  nextDisabled = false,
  delay = 0.75,
  taglineEmphasis = 'default',
  backAffordance = 'icon',
  finalizeVariant = 'ghost',
}: OnboardingFooterProps) {
  const m = useOnboardingMotion();
  const isHero = taglineEmphasis === 'hero';
  const hasQuote = Boolean(tagline?.trim());
  const finalizeClass =
    finalizeVariant === 'emphasis'
      ? cn(
          finalizeBtnEmphasis,
          nextDisabled && 'cursor-not-allowed opacity-35 hover:scale-100 hover:shadow-none',
        )
      : cn(
          finalizeBtn,
          nextDisabled && 'cursor-not-allowed opacity-35 hover:scale-100 hover:text-white',
        );

  return (
    <div
      className={cn(
        'border-t border-white/[0.08] shadow-onboarding-footer',
        hasQuote ? `mt-16 pt-12 ${isHero ? 'space-y-8' : 'space-y-10'}` : 'mt-10 pt-8',
      )}
    >
      {hasQuote && (
        <motion.figure
          initial={{ opacity: m.reduced ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: m.reduced ? 0 : delay, duration: m.reduced ? 0.01 : 0.45 }}
          className="mx-0"
        >
          {isHero ? (
            <blockquote className="relative border-l-[5px] border-onboarding-accent bg-gradient-to-r from-onboarding-accent/[0.1] via-onboarding-accent/[0.04] to-transparent py-6 pr-5 pl-7 md:py-8 md:pl-9 md:pr-8">
              <p className="font-heading text-2xl font-semibold tracking-tight text-white italic leading-[1.25] md:text-[1.75rem] md:leading-snug lg:text-[2rem]">
                {tagline}
              </p>
            </blockquote>
          ) : (
            <blockquote className="border-l-[4px] border-onboarding-accent py-2 pl-6">
              <p className="font-heading text-lg font-semibold text-white/95 italic leading-snug md:text-xl">
                {tagline}
              </p>
            </blockquote>
          )}
        </motion.figure>
      )}

      {navMode === 'first' && (
        <motion.div
          initial={{ opacity: m.reduced ? 1 : 0, y: m.footerY }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: m.reduced ? 0 : delay + 0.08, duration: m.reduced ? 0.01 : 0.4 }}
          className="flex justify-end"
        >
          <button type="button" onClick={onNext} className={iconBtn} aria-label="Next step">
            <ChevronRight className="size-5" strokeWidth={2} />
          </button>
        </motion.div>
      )}

      {navMode === 'middle' && onBack && (
        <motion.div
          initial={{ opacity: m.reduced ? 1 : 0, y: m.footerY }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: m.reduced ? 0 : delay + 0.08, duration: m.reduced ? 0.01 : 0.4 }}
          className="flex items-center justify-between gap-4"
        >
          <button
            type="button"
            onClick={onBack}
            className={backAffordance === 'labeled' ? backBtnLabeled : iconBtn}
            aria-label="Back to previous step"
          >
            <ChevronLeft className="size-5 shrink-0" strokeWidth={2} />
            {backAffordance === 'labeled' && (
              <span className="pr-1 font-sans text-[11px] font-semibold tracking-[0.1em] text-white/70 uppercase">
                Back
              </span>
            )}
          </button>
          <button type="button" onClick={onNext} className={iconBtn} aria-label="Next step">
            <ChevronRight className="size-5" strokeWidth={2} />
          </button>
        </motion.div>
      )}

      {navMode === 'last' && onBack && (
        <motion.div
          initial={{ opacity: m.reduced ? 1 : 0, y: m.footerY }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: m.reduced ? 0 : delay + 0.08, duration: m.reduced ? 0.01 : 0.4 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <button
            type="button"
            onClick={onBack}
            className={backAffordance === 'labeled' ? backBtnLabeled : iconBtn}
            aria-label="Back to previous step"
          >
            <ChevronLeft className="size-5 shrink-0" strokeWidth={2} />
            {backAffordance === 'labeled' && (
              <span className="pr-1 font-sans text-[11px] font-semibold tracking-[0.1em] text-white/70 uppercase">
                Back
              </span>
            )}
          </button>
          <button type="button" onClick={onNext} className={finalizeClass} disabled={nextDisabled}>
            {finalizeLabel}
          </button>
        </motion.div>
      )}
    </div>
  );
}
