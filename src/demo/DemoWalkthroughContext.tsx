import {
  createContext,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate, useSearchParams, type NavigateFunction } from 'react-router-dom';
import {
  DEMO_FIRST_WALKTHROUGH_PATH,
  DEMO_MAIN_STEPS,
  DEMO_WALKTHROUGH_STORAGE_KEY,
  readLastStepIndex,
  type DemoStep,
} from './demoScript';
import {
  DEFAULT_DEMO_SCENARIO_ID,
  getDemoScenarioById,
  persistDemoScenarioId,
  readStoredDemoScenarioId,
  type DemoScenario,
  type DemoScenarioId,
} from './demoScenarios';

export type DemoWalkthroughContextValue = {
  demoActive: boolean;
  /** True when the URL matches a scripted step and demo is on — drives chrome + Space. */
  showDemoChrome: boolean;
  currentStepIndex: number;
  currentStep: DemoStep | null;
  currentStepTitle: string | null;
  canGoNext: boolean;
  canGoBack: boolean;
  /** True when `?notes=1` is in the URL — DemoLayout shows the talk-track sidebar. */
  presenterNotesActive: boolean;
  /** Active scenario (default `cross-border-corridor`). */
  scenario: DemoScenario;
  /** Switch the active scenario; resets last-step pointer on change. */
  setScenarioId: (id: DemoScenarioId) => void;
  startWalkthrough: () => void;
  goNext: () => void;
  goBack: () => void;
  /** Jump to a specific step (used by the presenter hub step picker). */
  goToStepIndex: (index: number) => void;
  /** Restart from the first step. */
  restartWalkthrough: () => void;
  /**
   * Last visible step index persisted in session storage, or `null` if
   * nothing has been recorded yet. Hub uses this to offer "resume here".
   */
  lastStepIndex: number | null;
  /** Resume the tour at {@link lastStepIndex} when present, else start at step 1. */
  resumeWalkthrough: () => void;
  exitDemo: () => void;
};

export const DemoWalkthroughContext = createContext<DemoWalkthroughContextValue | null>(null);

export function readStorageFlag(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(DEMO_WALKTHROUGH_STORAGE_KEY) === '1';
}

function inactiveWalkthroughValue(navigate: NavigateFunction): DemoWalkthroughContextValue {
  const inactiveScenario = getDemoScenarioById(DEFAULT_DEMO_SCENARIO_ID);
  const lastStepIndex = readLastStepIndex(DEMO_MAIN_STEPS.length - 1);
  const startAtFirst = () => {
    sessionStorage.setItem(DEMO_WALKTHROUGH_STORAGE_KEY, '1');
    navigate(DEMO_FIRST_WALKTHROUGH_PATH);
  };
  return {
    demoActive: false,
    showDemoChrome: false,
    currentStepIndex: -1,
    currentStep: null,
    currentStepTitle: null,
    canGoNext: false,
    canGoBack: false,
    presenterNotesActive: false,
    scenario: inactiveScenario,
    setScenarioId: () => {},
    startWalkthrough: startAtFirst,
    goNext: () => {},
    goBack: () => {},
    goToStepIndex: () => {},
    restartWalkthrough: startAtFirst,
    lastStepIndex,
    resumeWalkthrough: () => {
      const idx = lastStepIndex ?? 0;
      const target = DEMO_MAIN_STEPS[idx] ?? DEMO_MAIN_STEPS[0];
      if (!target) return;
      sessionStorage.setItem(DEMO_WALKTHROUGH_STORAGE_KEY, '1');
      navigate(target.path);
    },
    exitDemo: () => {},
  };
}

const DemoWalkthroughProviderImpl = lazy(() =>
  import('./DemoWalkthroughProviderImpl').then((m) => ({ default: m.DemoWalkthroughProviderImpl })),
);

/**
 * Demo tour context. When the tour is off, exposes a minimal value (no demo script / auto-actions chunk).
 * When `?demo=1` or the session tour flag is set, loads the full provider asynchronously.
 */
export function DemoWalkthroughProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [storageActive, setStorageActive] = useState(readStorageFlag);

  const demoQuery = searchParams.get('demo') === '1';

  useEffect(() => {
    if (!demoQuery) return;
    sessionStorage.setItem(DEMO_WALKTHROUGH_STORAGE_KEY, '1');
    setStorageActive(true);
  }, [demoQuery]);

  const demoActive = demoQuery || storageActive;

  const inactiveValue = useMemo(() => {
    const base = inactiveWalkthroughValue(navigate);
    const start = () => {
      sessionStorage.setItem(DEMO_WALKTHROUGH_STORAGE_KEY, '1');
      setStorageActive(true);
      navigate(DEMO_FIRST_WALKTHROUGH_PATH);
    };
    const resume = () => {
      const idx = base.lastStepIndex ?? 0;
      const target = DEMO_MAIN_STEPS[idx] ?? DEMO_MAIN_STEPS[0];
      if (!target) return;
      sessionStorage.setItem(DEMO_WALKTHROUGH_STORAGE_KEY, '1');
      setStorageActive(true);
      navigate(target.path);
    };
    return {
      ...base,
      setScenarioId: (id: DemoScenarioId) => {
        persistDemoScenarioId(id);
      },
      startWalkthrough: start,
      restartWalkthrough: start,
      resumeWalkthrough: resume,
    };
  }, [navigate]);

  if (!demoActive) {
    return (
      <DemoWalkthroughContext.Provider value={inactiveValue}>
        {children}
      </DemoWalkthroughContext.Provider>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#0a0f1a] font-sans text-sm text-slate-500">
          Loading demo…
        </div>
      }
    >
      <DemoWalkthroughProviderImpl>{children}</DemoWalkthroughProviderImpl>
    </Suspense>
  );
}

export function useDemoWalkthrough(): DemoWalkthroughContextValue {
  const ctx = useContext(DemoWalkthroughContext);
  if (!ctx) {
    throw new Error('useDemoWalkthrough must be used within DemoWalkthroughProvider');
  }
  return ctx;
}

export { readStoredDemoScenarioId };
