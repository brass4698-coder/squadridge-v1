import { CheckCircle2 } from 'lucide-react';

export interface VerificationAnchorBadgeProps {
  anchorId: string;
  status: 'verified' | 'withdrawn';
}

export function VerificationAnchorBadge({ anchorId, status }: VerificationAnchorBadgeProps) {
  const isVerified = status === 'verified';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        isVerified
          ? 'border-brand/20 bg-brand-soft text-brand'
          : 'border-line bg-surface-secondary text-ink-faint'
      }`}
    >
      {isVerified ? <CheckCircle2 className="size-3 shrink-0" aria-hidden /> : null}
      {isVerified ? 'Anchor verified' : 'Withdrawn'}
      <span className="sr-only">Record ID {anchorId}</span>
    </span>
  );
}

/** Shorthand badge for use-case cards linking to the release stage. */
export function RecordAnchorBadge({ recordId }: { recordId: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-brand/25 bg-brand-soft px-2 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-brand">
      {recordId}
    </span>
  );
}

/** Shorthand reference to a lifecycle stage on use-case cards. */
export function StageBadge({ stage }: { stage: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-surface-secondary px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-ink-faint">
      {stage}
    </span>
  );
}
