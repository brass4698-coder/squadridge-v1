import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '../lib/cn';

/**
 * Visible proof-generation timeline for the verification step. Animates between
 * idle → running → success states so a presenter has something to point at while
 * the actual Semaphore proof is generated. The same surface is reused in stub
 * mode (`VITE_ZK_STUB=true`) — only the labels differ, not the timing model.
 */

export type ProofTimelineStage = 'identity' | 'commitment' | 'proof' | 'submit' | 'verified';

export const PROOF_TIMELINE_STAGES: ReadonlyArray<{
  id: ProofTimelineStage;
  label: string;
  detail: string;
}> = [
  {
    id: 'identity',
    label: 'Loading identity',
    detail: 'Local Semaphore identity unsealed. Stays in the browser.',
  },
  {
    id: 'commitment',
    label: 'Computing commitment',
    detail: 'Hash of identity + nullifier. Sent to the server later, never the secret.',
  },
  {
    id: 'proof',
    label: 'Generating proof',
    detail: 'Browser-side WASM proof of group membership. No PII attached.',
  },
  {
    id: 'submit',
    label: 'Submitting to verify-zk-proof',
    detail: 'Edge Function checks the proof and writes a nullifier-bound record.',
  },
  {
    id: 'verified',
    label: 'Verified',
    detail: 'Nullifier recorded. You can match into a squad with this attribute.',
  },
];

export type ProofTimelineState = 'idle' | 'running' | 'success' | 'error';

export interface VerificationProofTimelineProps {
  state: ProofTimelineState;
  /** Index of the currently-active stage when state is `running`. */
  activeStageIndex?: number;
  className?: string;
}

export function VerificationProofTimeline({
  state,
  activeStageIndex = 0,
  className,
}: VerificationProofTimelineProps) {
  return (
    <ol
      className={cn('space-y-2', className)}
      aria-live="polite"
      aria-label="Verification proof timeline"
    >
      {PROOF_TIMELINE_STAGES.map((stage, idx) => {
        const isComplete = state === 'success' || idx < activeStageIndex;
        const isActive = state === 'running' && idx === activeStageIndex;
        const isPending = !isComplete && !isActive;

        return (
          <li
            key={stage.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border px-3 py-2 transition-colors',
              isComplete && 'border-teal-500/40 bg-teal-500/[0.05]',
              isActive && 'border-teal-500/55 bg-teal-500/[0.08]',
              isPending && 'border-slate-800/80 bg-white/[0.01] opacity-70',
            )}
          >
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center">
              {isComplete ? (
                <CheckCircle2 className="h-5 w-5 text-teal-light" aria-hidden />
              ) : isActive ? (
                <Loader2 className="h-5 w-5 animate-spin text-teal-light" aria-hidden />
              ) : (
                <span
                  className="block h-2.5 w-2.5 rounded-full border border-slate-600"
                  aria-hidden
                />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'font-heading text-[0.85rem] font-semibold leading-tight',
                  isComplete || isActive ? 'text-slate-100' : 'text-slate-400',
                )}
              >
                {stage.label}
              </p>
              <p
                className={cn(
                  'mt-0.5 font-sans text-[0.78rem] leading-snug',
                  isComplete || isActive ? 'text-slate-300' : 'text-slate-500',
                )}
              >
                {stage.detail}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
