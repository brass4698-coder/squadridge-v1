import { RouteSkeletonBlock } from '../ui/Skeleton';

export function RouteSkeleton({ label = 'Loading page' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" aria-label={label}>
      <RouteSkeletonBlock />
    </div>
  );
}
