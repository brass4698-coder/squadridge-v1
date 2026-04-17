import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsModerator } from '../../hooks';

export function RequireModerator({ children }: { children: ReactNode }) {
  const { data: isMod, isPending, isError } = useIsModerator();

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center font-sans text-[0.95rem] text-[#8892a4]">
        Loading…
      </div>
    );
  }

  if (isError || !isMod) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
