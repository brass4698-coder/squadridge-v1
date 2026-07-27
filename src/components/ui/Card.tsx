import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  glass?: boolean;
};

export function Card({ className, glass, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface-elevated shadow-sr-sm',
        glass && 'sr-glass',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-b border-line px-5 py-4', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />;
}

export function StatCard({
  label,
  value,
  footer,
  className,
}: {
  label: string;
  value: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <Card glass className={cn('p-5', className)}>
      <p className="tabular-nums text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-app-meta text-ink-secondary">{label}</p>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </Card>
  );
}
