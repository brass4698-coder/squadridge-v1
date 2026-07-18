type Variant = 'neutral' | 'verified' | 'pending' | 'released' | 'private';

const VARIANT_CLASS: Record<Variant, string> = {
  neutral: 'border-line bg-surface-secondary text-ink-secondary',
  verified: 'border-line bg-surface-secondary text-ink',
  pending: 'border-line bg-surface-secondary text-ink-secondary',
  released: 'border-line-strong bg-surface-elevated text-ink',
  private: 'border-line bg-surface-sunken text-ink-faint',
};

export function StatusChip({ label, variant = 'neutral' }: { label: string; variant?: Variant }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[0.65rem] font-medium uppercase tracking-[0.08em] ${VARIANT_CLASS[variant]}`}
    >
      {label}
    </span>
  );
}
