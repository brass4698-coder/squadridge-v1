import { createContext, useContext } from 'react';

export type OnboardingLayoutHeightMode = 'dvh' | 'fill';

const OnboardingShellContext = createContext<OnboardingLayoutHeightMode>('dvh');

export function OnboardingShellProvider({
  heightMode,
  children,
}: {
  heightMode: OnboardingLayoutHeightMode;
  children: React.ReactNode;
}) {
  return (
    <OnboardingShellContext.Provider value={heightMode}>{children}</OnboardingShellContext.Provider>
  );
}

export function useOnboardingShell() {
  return useContext(OnboardingShellContext);
}
