import { cn } from '../../lib/cn';

type ChipProps = {
  children: string;
  className?: string;
  tone?: 'default' | 'brand' | 'muted' | 'warning';
};

const TONE: Record<NonNullable<ChipProps['tone']>, string> = {
  default: 'border-line bg-surface-elevated text-ink-secondary',
  brand: 'border-brand/30 bg-brand-soft text-brand',
  muted: 'border-line bg-surface-sunken text-ink-faint',
  warning: 'border-sem-warning/40 bg-sem-warning-soft text-sem-warning',
};

function Chip({ children, className, tone = 'default' }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full truncate rounded-sm border px-2 py-0.5 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)]',
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function RoleChip({ label }: { label: string }) {
  return <Chip tone="brand">{label}</Chip>;
}

export function MatterChip({ label }: { label: string }) {
  return <Chip tone="default">{label}</Chip>;
}

export function StateChip({ label }: { label: string }) {
  return <Chip tone="muted">{label}</Chip>;
}

export function DemoModePill() {
  return <Chip tone="warning">Demo mode</Chip>;
}
