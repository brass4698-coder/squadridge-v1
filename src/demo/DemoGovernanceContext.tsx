import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  DEMO_PRESETS,
  mattersForPreset,
  type DemoPresetId,
  type GovernanceMatter,
} from '../data/governanceDashboard';

type DemoGovernanceContextValue = {
  presetId: DemoPresetId;
  setPresetId: (id: DemoPresetId) => void;
  presets: typeof DEMO_PRESETS;
  matters: GovernanceMatter[];
  scopeLabel: string;
};

const Ctx = createContext<DemoGovernanceContextValue | null>(null);

export function DemoGovernanceProvider({ children }: { children: ReactNode }) {
  const [presetId, setPresetIdState] = useState<DemoPresetId>('institutional');

  const setPresetId = useCallback((id: DemoPresetId) => {
    setPresetIdState(id);
    try {
      sessionStorage.setItem('squadridge:demo-preset', id);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => {
    const stored = (() => {
      try {
        return sessionStorage.getItem('squadridge:demo-preset') as DemoPresetId | null;
      } catch {
        return null;
      }
    })();
    const id = stored && DEMO_PRESETS.some((p) => p.id === stored) ? stored : presetId;
    const preset = DEMO_PRESETS.find((p) => p.id === id) ?? DEMO_PRESETS[4];
    return {
      presetId: id,
      setPresetId,
      presets: DEMO_PRESETS,
      matters: mattersForPreset(id),
      scopeLabel: preset.scope,
    };
  }, [presetId, setPresetId]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function writePresetId(id: DemoPresetId): void {
  try {
    sessionStorage.setItem('squadridge:demo-preset', id);
  } catch {
    /* ignore */
  }
}

export function useDemoGovernance() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Public demo routes may render outside AuthenticatedShell — still persist preset.
    const stored = (() => {
      try {
        return sessionStorage.getItem('squadridge:demo-preset') as DemoPresetId | null;
      } catch {
        return null;
      }
    })();
    const id =
      stored && DEMO_PRESETS.some((p) => p.id === stored)
        ? stored
        : ('institutional' as DemoPresetId);
    const preset = DEMO_PRESETS.find((p) => p.id === id) ?? DEMO_PRESETS[4];
    return {
      presetId: id,
      setPresetId: writePresetId,
      presets: DEMO_PRESETS,
      matters: mattersForPreset(id),
      scopeLabel: preset.scope,
    };
  }
  return ctx;
}
