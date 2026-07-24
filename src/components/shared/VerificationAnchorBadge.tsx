import { StatusBadge } from '../StatusBadge';

export interface VerificationAnchorBadgeProps {
  anchorId: string;
  status: 'verified' | 'withdrawn';
}

export function VerificationAnchorBadge({ anchorId, status }: VerificationAnchorBadgeProps) {
  if (status === 'verified') {
    return (
      <StatusBadge variant="anchor">
        Anchor verified
        <span className="sr-only">Record ID {anchorId}</span>
      </StatusBadge>
    );
  }

  return (
    <StatusBadge variant="illustrative">
      Withdrawn
      <span className="sr-only">Record ID {anchorId}</span>
    </StatusBadge>
  );
}

export function RecordAnchorBadge({ recordId }: { recordId: string }) {
  return (
    <span className="inline-flex items-center border border-line bg-surface-sunken px-2 py-0.5 font-mono text-[length:var(--text-label)] font-medium tracking-wider text-ink-faint">
      {recordId}
    </span>
  );
}

export function StageBadge({ stage }: { stage: string }) {
  return (
    <span className="inline-flex items-center border border-line bg-surface-secondary px-2 py-0.5 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-wider text-ink-faint">
      {stage}
    </span>
  );
}
