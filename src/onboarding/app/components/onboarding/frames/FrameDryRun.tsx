import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Textarea } from '../../ui/textarea';
import { cn } from '../../ui/utils';
import { useOnboardingMotion } from '../onboardingMotion';
import { obBodyMuted } from '../OnboardingTypography';
import { COPY } from '../copy';
import { OnboardingFooter } from '../OnboardingFooter';
import { srConsolePrimary, srInputClass, srSecondaryLink } from './squadRidgeUi';

interface FrameDryRunProps {
  onNext: () => void;
  onBack: () => void;
}

function looksOperationalDetail(text: string): boolean {
  const t = text.trim();
  if (t.length < 4) return false;
  if (/\d{1,2}\.\d{4,}/.test(t)) return true;
  if (/\b(coordinates?|grid\s+ref|battalion|classified|live\s+op|unit\s+\d)\b/i.test(t)) return true;
  return false;
}

export function FrameDryRun({ onNext, onBack }: FrameDryRunProps) {
  const m = useOnboardingMotion();
  const [phase, setPhase] = useState<'running' | 'complete'>('running');
  const [seconds, setSeconds] = useState(60);
  const [draft, setDraft] = useState('');
  const flagged = looksOperationalDetail(draft);
  const room = COPY.room;

  useEffect(() => {
    if (phase !== 'running') return undefined;
    const id = window.setInterval(() => {
      setSeconds((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 'running' && seconds === 0) {
      setPhase('complete');
    }
  }, [phase, seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  if (phase === 'complete') {
    return (
      <motion.div
        initial={m.stepInitial}
        animate={m.stepAnimate}
        exit={m.stepExit}
        transition={m.stepTransition}
        className="mx-auto w-full"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mb-10 font-sans text-[16px] leading-relaxed text-white/85 sm:text-[17px] ${obBodyMuted}`}
        >
          {room.summaryLead}
        </motion.p>
        <OnboardingFooter onNext={onNext} onBack={onBack} navMode="last" finalizeLabel="Continue" delay={0.35} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={m.stepInitial}
      animate={m.stepAnimate}
      exit={m.stepExit}
      transition={m.stepTransition}
      className="mx-auto w-full"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 flex items-center justify-between gap-4 border-b border-white/[0.1] pb-4 font-sans text-[10px] font-semibold tracking-[0.12em] text-white/50 sm:text-[11px]"
      >
        <span className="text-white/48 uppercase">{room.sessionBarLeft}</span>
        <span className="tabular-nums text-onboarding-accent/95">
          {room.timerPrefix} {mm}:{ss}
        </span>
      </motion.div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
        <motion.div
          initial={{ opacity: m.reduced ? 1 : 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={m.fadeTransition(0.1)}
          className={cn(
            'lg:w-[44%] shrink-0 rounded-lg border border-onboarding-accent/45',
            'bg-gradient-to-br from-onboarding-accent/[0.14] via-onboarding-accent/[0.07] to-white/[0.02]',
            'p-5 shadow-onboarding-card sm:p-6',
            'ring-1 ring-inset ring-white/[0.06]',
          )}
        >
          <p className="mb-3 font-sans text-[10px] font-semibold leading-snug tracking-[0.06em] text-onboarding-accent sm:text-[11px]">
            {room.topicLabel}
          </p>
          <p className="whitespace-pre-line font-sans text-[15px] font-medium leading-relaxed text-white/92 sm:text-[16px]">
            {room.scenario}
          </p>
        </motion.div>

        <div className="min-w-0 flex-1 space-y-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
          <label htmlFor="dry-run-input" className="block font-sans text-[10px] font-semibold tracking-[0.12em] text-white/55">
            {room.inputLabel}
          </label>
          <Textarea
            id="dry-run-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={room.placeholder}
            rows={6}
            className={cn('min-h-[150px] resize-y text-[14px] leading-relaxed sm:text-[15px]', srInputClass)}
          />
          {flagged && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-md border border-onboarding-accent/35 bg-onboarding-accent/[0.07] px-3 py-2.5 font-sans text-[13px] leading-relaxed text-white/75"
              role="status"
            >
              This looks like operational detail. Try rephrasing at a higher level (no locations, no live movements).
            </motion.p>
          )}
        </div>
      </div>

      <div className="mt-10 border-t border-white/[0.08] pt-8 shadow-onboarding-footer">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <button type="button" onClick={onBack} className={cn(srSecondaryLink, 'order-2 text-left sm:order-1')}>
            {room.stepOut}
          </button>
          <div className="order-1 flex w-full flex-col items-stretch gap-2 sm:order-2 sm:max-w-[min(100%,320px)] sm:items-end">
            <button type="button" onClick={() => setPhase('complete')} className={srConsolePrimary}>
              {room.finishDryRun}
            </button>
            <button
              type="button"
              onClick={() => setPhase('complete')}
              className="font-sans text-[11px] font-normal leading-snug text-white/38 transition-colors hover:text-white/55"
            >
              {room.skipHint}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
