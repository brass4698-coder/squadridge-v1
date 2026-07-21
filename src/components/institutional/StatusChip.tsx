import { StatusBadge, type StatusBadgeVariant } from '../StatusBadge';

type Variant = 'neutral' | 'verified' | 'pending' | 'released' | 'private';

const TO_BADGE: Record<Variant, StatusBadgeVariant | null> = {
  private: 'private',
  released: 'published',
  verified: 'governed',
  pending: 'illustrative',
  neutral: null,
};

/**
 * Status chip for institutional UI. Colorful variants use StatusBadge tokens.
 */
export function StatusChip({ label, variant = 'neutral' }: { label: string; variant?: Variant }) {
  const badge = TO_BADGE[variant];
  if (badge) {
    return <StatusBadge variant={badge}>{label}</StatusBadge>;
  }
  return (
    <span className="inline-flex items-center rounded-sm border border-line bg-surface-secondary px-2 py-0.5 font-mono text-[0.65rem] font-medium uppercase tracking-[0.08em] text-ink-secondary">
      {label}
    </span>
  );
}
