import { motion } from 'motion/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../ui/utils';
import { useOnboardingMotion } from '../onboardingMotion';
import { OnboardingFooter } from '../OnboardingFooter';
import { ACCENT_AMBER } from '../tokens';

interface FrameIdentityModelProps {
  onNext: () => void;
  onBack: () => void;
}

/** Between nodes: vertical stack on small screens, thin line + chevron + dots on md+. */
function BetweenNodes() {
  return (
    <>
      <div className="flex flex-col items-center py-1 sm:hidden" aria-hidden>
        <div className="h-4 w-px bg-gradient-to-b from-white/20 via-onboarding-accent/38 to-white/12" />
        <div className="flex items-center gap-0.5 py-1">
          <span className="size-1 rounded-full bg-onboarding-accent/45" />
          <ChevronDown className="size-3.5 text-onboarding-accent/55" strokeWidth={2} />
          <span className="size-1 rounded-full bg-onboarding-accent/30" />
        </div>
        <div className="h-4 w-px bg-gradient-to-b from-white/12 to-transparent" />
      </div>
      <div
        className="mx-1 hidden min-h-[3.75rem] min-w-0 flex-[1] items-center justify-center sm:flex sm:max-w-[5rem]"
        aria-hidden
      >
        <div className="h-px min-w-[0.25rem] flex-1 bg-gradient-to-r from-transparent via-white/16 to-onboarding-accent/28" />
        <div className="flex shrink-0 items-center gap-0.5 px-0.5">
          <span className="size-1 rounded-full bg-onboarding-accent/45" />
          <ChevronRight className="size-3.5 text-onboarding-accent/55" strokeWidth={2} />
          <span className="size-1 rounded-full bg-onboarding-accent/32" />
        </div>
        <div className="h-px min-w-[0.25rem] flex-1 bg-gradient-to-r from-onboarding-accent/28 via-white/14 to-transparent" />
      </div>
    </>
  );
}

export function FrameIdentityModel({ onNext, onBack }: FrameIdentityModelProps) {
  const m = useOnboardingMotion();

  const tileBase =
    'rounded-lg border px-3 py-2 text-center text-sm text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]';
  const micro = 'text-[10px] font-medium tracking-wide text-white/38';

  return (
    <motion.div
      initial={m.stepInitial}
      animate={m.stepAnimate}
      exit={m.stepExit}
      transition={m.stepTransition}
      className="mx-auto w-full"
    >
      <motion.h1
        initial={{ opacity: m.reduced ? 1 : 0, y: m.reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={m.titleTransition(0.08)}
        className={cn(
          'font-display text-[1.85rem] font-bold leading-[1.12] text-white sm:text-4xl md:text-5xl md:leading-[1.08] lg:text-[3.15rem]',
          'tracking-[0.01em] md:tracking-[0.024em]',
          'mb-12 md:mb-14',
        )}
      >
        Proving who you are — without exposing who you are
      </motion.h1>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.15)}
        className="mx-auto mb-12 max-w-[min(100%,22rem)] space-y-5 font-sans text-[15px] leading-relaxed sm:max-w-[24rem] sm:text-[16px] md:mb-14"
      >
        <p className="text-white/72">
          We confirm you are a real human and belong in a specific lane.
        </p>
        <p className="text-white/68">
          We do not learn your name, rank, employer, or personal identity.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0, y: m.reduced ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={m.fadeTransition(0.2)}
        className="mb-16 rounded-xl border border-white/[0.07] bg-gradient-to-b from-white/[0.045] to-white/[0.015] px-4 py-6 shadow-onboarding-card-inner sm:px-7 sm:py-8"
      >
        <div className="flex flex-col items-center sm:flex-row sm:items-end sm:justify-center sm:gap-0">
          <div className="flex w-full max-w-[9rem] flex-col items-center gap-1.5 text-center sm:w-auto">
            <span className={cn(tileBase, 'w-full border-white/14 bg-white/[0.035]')}>You</span>
            <span className={micro}>You (anonymous)</span>
          </div>

          <BetweenNodes />

          <div className="flex w-full max-w-[11rem] flex-col items-center gap-2 text-center sm:w-auto sm:max-w-[12rem]">
            <div
              className={cn(
                'flex w-full flex-col items-center gap-2 rounded-xl border border-onboarding-accent/40 bg-onboarding-accent/[0.09] px-4 py-4 shadow-[inset_0_0_28px_rgba(201,166,107,0.12),0_0_0_1px_rgba(201,166,107,0.12)]',
              )}
            >
              <span className="text-[9px] font-semibold uppercase tracking-[0.11em] text-onboarding-accent/95">
                Verification
              </span>
              <svg
                width="44"
                height="54"
                viewBox="0 0 100 125"
                fill="none"
                className="opacity-[0.98]"
                aria-hidden
              >
                <path
                  d="M 18,8 L 82,8 L 82,95 C 82,98 81,101 78,104 L 52,121 C 51,122 49,122 48,121 L 22,104 C 19,101 18,98 18,95 Z"
                  stroke={ACCENT_AMBER}
                  strokeWidth="2"
                />
              </svg>
            </div>
            <span className="text-center text-[10px] font-medium leading-snug text-white/42">
              Verification layer
            </span>
            <span className="text-center text-[11px] leading-snug text-white/48">
              Shield between you and the squad
            </span>
          </div>

          <BetweenNodes />

          <div className="flex w-full max-w-[9rem] flex-col items-center gap-1.5 text-center sm:w-auto">
            <span className={cn(tileBase, 'w-full border-white/14 bg-white/[0.035]')}>Squad</span>
            <span className={micro}>Squad access</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.28)}
        className="mb-2 mt-2"
      >
        <p className="mb-5 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
          What this verification actually does:
        </p>
        <ul className="space-y-2.5 font-sans text-[14px] leading-[1.45] text-white/68 sm:text-[15px]">
          <li className="flex gap-2.5">
            <span className="mt-[0.35em] shrink-0 text-onboarding-accent">·</span>
            <span>
              <span className="font-semibold text-white/82">Verified eligibility, not surveillance.</span>
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-[0.35em] shrink-0 text-onboarding-accent">·</span>
            <span>
              <span className="font-semibold text-white/82">Zero-knowledge checks by design.</span>
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-[0.35em] shrink-0 text-onboarding-accent">·</span>
            <span>
              <span className="font-semibold text-white/82">No dossiers, no social graph, no tracking trails.</span>
            </span>
          </li>
        </ul>
      </motion.div>

      <OnboardingFooter
        onNext={onNext}
        onBack={onBack}
        navMode="last"
        finalizeLabel="Confirm and continue"
        backAffordance="labeled"
        finalizeVariant="emphasis"
        delay={0.45}
      />
    </motion.div>
  );
}
