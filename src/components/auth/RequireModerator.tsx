import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsModerator } from '../../hooks';
import { BrandPresenceLoader } from '../ui/BrandPresenceLoader';

export function RequireModerator({ children }: { children: ReactNode }) {
  const { data: isMod, isPending, isError } = useIsModerator();

  if (isPending) {
    return (
      <BrandPresenceLoader variant="compact" label="Loading…" phrase="Checking operations access" />
    );
  }

  if (isError || !isMod) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
