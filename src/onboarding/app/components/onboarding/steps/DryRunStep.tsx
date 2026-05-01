import { useEffect, useState } from 'react';
import { cn } from '../../../../../lib/cn';
import { OnboardingLayout } from '../OnboardingLayout';
import { OnboardingCard } from '../OnboardingCard';
import { COPY } from '../copy';
import { ONBOARDING_INPUT_CLASS } from '../onboardingShellStyles';
import { obBody, obH1, obH1ToDryRunLeads, obLabel, obQuote } from '../onboardingStepClasses';
import { TRUST_FOOTER } from '../onboardingTrustNotes';
import type { StepProps } from '../types';

function looksOperationalDetail(text: string): boolean {
  const t = text.trim();
  if (t.length < 4) return false;
  if (/\d{1,2}\.\d{4,}/.test(t)) return true;
  if (/\b(coordinates?|grid\s+ref|battalion|classified|live\s+op|unit\s+\d)\b/i.test(t))
    return true;
  return false;
}

export function DryRunStep({ onBack, onNext, nextDisabled }: StepProps) {
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

  const handleFooterNext = () => {
    if (phase === 'running') {
      setPhase('complete');
      return;
    }
    onNext?.();
  };

  return (
    <OnboardingLayout
      onBack={onBack}
      onNext={handleFooterNext}
      forwardControl="text"
      nextLabel="Enter squad room"
      nextDisabled={nextDisabled}
      trustNote={TRUST_FOOTER.dryrun}
    >
      <OnboardingCard>
        {phase === 'complete' ? (
          <div className="max-w-[40rem]">
            <p className={obBody}>{room.summaryLead}</p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-2.5">
            <div className={`flex flex-col ${obH1ToDryRunLeads}`}>
              <h1 className={obH1}>{room.title}</h1>

              <div className="flex flex-col gap-1.5">
                <p className={obBody}>{room.leadLine1}</p>
                <p className={obBody}>{room.leadLine2}</p>
              </div>
            </div>

            <div className={obQuote}>
              <p className={`${obBody} italic`}>{room.guidance}</p>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-amber sm:text-[0.6875rem]">
                {room.sessionBarLeft}
              </span>
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-amber tabular-nums sm:text-[0.6875rem]">
                {room.timerPrefix} {mm}:{ss}
              </span>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="flex min-h-0 flex-col rounded-lg border border-teal/30 bg-teal/[0.06] p-3">
                <p className="mb-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-teal sm:text-[0.6875rem]">
                  {room.topicLabel}
                </p>
                <p className="whitespace-pre-line text-[0.8125rem] leading-[1.45] text-ink-secondary">
                  {room.scenario}
                </p>
              </div>

              <div className="flex min-h-0 min-w-0 flex-col gap-1">
                <span className={obLabel}>{room.inputLabel}</span>
                <textarea
                  id="dry-run-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={room.placeholder}
                  rows={3}
                  className={cn(
                    'min-h-[4.5rem] flex-1 resize-none overflow-y-auto',
                    ONBOARDING_INPUT_CLASS,
                  )}
                />
                {flagged && (
                  <p
                    className="text-[0.625rem] font-semibold uppercase leading-snug tracking-[0.12em] text-amber sm:text-[0.6875rem]"
                    role="status"
                  >
                    This looks like operational detail. Try rephrasing at a higher level (no
                    locations, no live movements).
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </OnboardingCard>
    </OnboardingLayout>
  );
}
