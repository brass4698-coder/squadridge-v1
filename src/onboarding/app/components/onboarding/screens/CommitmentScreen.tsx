import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { cn } from '../../ui/utils';
import { useOnboardingMotion } from '../onboardingMotion';
import { COPY } from '../copy';
import { srSecondaryLink } from '../frames/squadRidgeUi';

interface CommitmentScreenProps {
  onEnter: () => void;
  onBack: () => void;
}

export function CommitmentScreen({ onEnter, onBack }: CommitmentScreenProps) {
  const m = useOnboardingMotion();
  const [accepted, setAccepted] = useState(false);
  const c = COPY.commitment;

  return (
    <motion.div
      initial={m.stepInitial}
      animate={m.stepAnimate}
      exit={m.stepExit}
      transition={m.stepTransition}
      className="mx-auto w-full"
    >
      {/* Tier 1 — title: controlled, not marketing-hero */}
      <motion.h1
        initial={{ opacity: m.reduced ? 1 : 0, y: m.reduced ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={m.titleTransition(0.06)}
        className="font-display text-2xl font-semibold tracking-[0.015em] text-white md:text-[1.65rem] md:tracking-[0.02em]"
      >
        {c.title}
      </motion.h1>

      {/* Tier 2 — stakes: narrow column, generous vertical rhythm */}
      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.12)}
        className="mx-auto mt-10 max-w-[min(100%,22rem)] space-y-6 font-sans text-[14px] leading-relaxed text-white/72 sm:text-[15px]"
      >
        {c.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </motion.div>

      {/* Tier 3 — console-style acknowledgment */}
      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.22)}
        className="mt-12"
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={accepted}
          onClick={() => setAccepted((v) => !v)}
          className={cn(
            'flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-[border-color,box-shadow,background-color]',
            'border-white/[0.14] bg-white/[0.06]',
            'shadow-[inset_0_2px_10px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)]',
            'hover:border-white/25',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onboarding-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06090f]',
            accepted && 'border-onboarding-accent/35 bg-onboarding-accent/[0.07]',
          )}
        >
          <span
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-[border-color,box-shadow,background-color]',
              accepted
                ? 'border-onboarding-accent/80 bg-onboarding-accent/20 shadow-[0_0_14px_rgba(201,166,107,0.35)]'
                : 'border-white/45 bg-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]',
            )}
            aria-hidden
          >
            {accepted ? <ShieldCheck className="size-3.5 text-onboarding-accent" strokeWidth={2.25} /> : null}
          </span>
          <span className="min-w-0 flex-1 text-[13px] font-medium leading-snug tracking-[0.02em] text-white/[0.94]">
            {c.checkbox}
          </span>
        </button>
      </motion.div>

      {/* Nav + CTA */}
      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0, y: m.footerY }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: m.reduced ? 0 : 0.28, duration: m.reduced ? 0.01 : 0.4 }}
        className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <button
          type="button"
          onClick={onBack}
          className={cn(
            srSecondaryLink,
            'inline-flex items-center gap-1.5 self-start font-sans text-[11px] font-semibold uppercase tracking-[0.1em]',
          )}
          aria-label="Back to previous step"
        >
          <ChevronLeft className="size-4 shrink-0 opacity-80" strokeWidth={2} />
          <span>{c.backLabel}</span>
        </button>

        <div className="flex w-full flex-col items-stretch gap-2 sm:max-w-[min(100%,280px)] sm:items-end">
          <button
            type="button"
            onClick={onEnter}
            disabled={!accepted}
            className={cn(
              'font-sans text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors',
              accepted
                ? 'cursor-pointer text-onboarding-accent hover:text-[color-mix(in_srgb,var(--color-onboarding-accent)_88%,white)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-onboarding-accent/45'
                : 'cursor-not-allowed text-white/30',
            )}
          >
            {c.cta}
          </button>
          {!accepted && (
            <p className="text-right font-sans text-[11px] leading-snug text-white/38 sm:max-w-[16rem]">
              {c.ctaDisabledHint}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
