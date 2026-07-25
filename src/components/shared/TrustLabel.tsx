import { Eye, Lock, Shield } from 'lucide-react';
import { cn } from '../../lib/cn';

export type TrustLabelVariant = 'session' | 'anonymous' | 'moderator' | 'ledger';

const COPY: Record<TrustLabelVariant, { label: string; Icon: typeof Lock; tone: string }> = {
  session: {
    label: 'Encrypted for this session',
    Icon: Lock,
    tone: 'text-ink-secondary',
  },
  anonymous: {
    label: 'Verified anonymously',
    Icon: Shield,
    tone: 'text-ink-secondary',
  },
  moderator: {
    label: 'Visible to moderators',
    Icon: Eye,
    tone: 'text-sem-warning',
  },
  ledger: {
    label: 'Recorded and tamper-evident',
    Icon: Lock,
    tone: 'sr-verify',
  },
};

export type TrustLabelProps = {
  variant: TrustLabelVariant;
  className?: string;
};

/**
 * Honest trust indicator — never overclaims E2E or full ZK for MVP chat.
 */
export function TrustLabel({ variant, className }: TrustLabelProps) {
  const { label, Icon, tone } = COPY[variant];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium leading-snug',
        tone,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export { COPY as TRUST_LABEL_COPY };
