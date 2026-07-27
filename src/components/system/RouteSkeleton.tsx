import { SrLoader } from './SrLoader';

export function RouteSkeleton({ label = 'Loading page' }: { label?: string }) {
  return <SrLoader variant="route" label={label} />;
}
