import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsModerator } from '../../hooks';
import { RouteSkeleton } from '../system/RouteSkeleton';

export function RequireModerator({ children }: { children: ReactNode }) {
  const { data: isMod, isPending, isError } = useIsModerator();

  if (isPending) {
    return <RouteSkeleton label="Checking permissions" />;
  }

  if (isError || !isMod) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
