import { useMemo } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useAuth, type AuthContextValue } from '../contexts/AuthContext';
import {
  useDemoWalkthrough,
  type DemoWalkthroughContextValue,
} from '../demo/DemoWalkthroughContext';

/**
 * Single hook for trees that need auth, demo tour state, and the shared QueryClient without prop drilling.
 * Must be used under `QueryClientProvider`, `DemoWalkthroughProvider`, and `AuthProvider` (see `App.tsx`).
 */
export type AppContextValue = AuthContextValue &
  DemoWalkthroughContextValue & {
    queryClient: QueryClient;
  };

export function useAppContext(): AppContextValue {
  const queryClient = useQueryClient();
  const auth = useAuth();
  const demo = useDemoWalkthrough();

  return useMemo(
    () => ({
      ...auth,
      ...demo,
      queryClient,
    }),
    [auth, demo, queryClient],
  );
}
