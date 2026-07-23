import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type ShellSurface = 'room' | 'gate' | 'record' | 'portfolio';

export type ShellContextValue = {
  title: string;
  roleLabel: string;
  matterLabel: string | null;
  stateLabel: string;
  nextAction: string;
  trustNote: string;
  lastUpdated: string | null;
  surface: ShellSurface;
  primaryAction: { label: string; href: string } | null;
  setContext: (patch: Partial<Omit<ShellContextValue, 'setContext'>>) => void;
};

const DEFAULT: Omit<ShellContextValue, 'setContext'> = {
  title: 'Workspace',
  roleLabel: 'Facilitator',
  matterLabel: null,
  stateLabel: 'Operational',
  nextAction: 'Review matters in your scope',
  trustNote:
    'We reduce exposure by design. We do not claim full platform zero-knowledge or Signal-grade E2E today.',
  lastUpdated: null,
  surface: 'room',
  primaryAction: null,
};

const ShellCtx = createContext<ShellContextValue | null>(null);

export function ShellContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(DEFAULT);

  const setContext = useCallback((patch: Partial<Omit<ShellContextValue, 'setContext'>>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      setContext,
    }),
    [state, setContext],
  );

  return <ShellCtx.Provider value={value}>{children}</ShellCtx.Provider>;
}

export function useShellContext(): ShellContextValue {
  const ctx = useContext(ShellCtx);
  if (!ctx) {
    return {
      ...DEFAULT,
      setContext: () => undefined,
    };
  }
  return ctx;
}
