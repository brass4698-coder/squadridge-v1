import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Skeleton } from '../ui/Skeleton';
import { ErrorState } from '../system/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { DocketEmptyGraphic } from '../system/DocketEmptyGraphic';

type ChartContainerProps = {
  title: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  height?: number;
  children: ReactNode;
  className?: string;
};

export function ChartContainer({
  title,
  description,
  loading,
  error,
  empty,
  emptyTitle = 'No data for this period',
  emptyDescription = 'Check back after your first sessions complete.',
  height = 240,
  children,
  className,
}: ChartContainerProps) {
  return (
    <div className={cn('sr-glass rounded-lg border border-line p-5', className)}>
      <div className="mb-4">
        <h3 className="text-section-title text-ink">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-app-meta text-ink-secondary">{description}</p>
        ) : null}
      </div>
      <div style={{ minHeight: height }}>
        {loading ? (
          <Skeleton className="h-full w-full" style={{ minHeight: height }} />
        ) : error ? (
          <ErrorState title="Chart unavailable" description={error} />
        ) : empty ? (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <DocketEmptyGraphic />
            <EmptyState heading={emptyTitle} body={emptyDescription} className="py-0" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
