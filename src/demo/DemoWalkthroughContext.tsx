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
import { RouteChunkFallback } from '../components/system/SrLoader';
import { DEMO_WALKTHROUGH_STORAGE_KEY, type DemoStep, type DemoTip } from './demoScript';

export type DemoWalkthroughContextValue = {
  demoActive: boolean;
  /** True when the URL matches a scripted step and demo is on — drives chrome + Space. */
  showDemoChrome: boolean;
  currentStepIndex: number;
  currentStep: DemoStep | null;
  currentStepTitle: string | null;
  /** Linear tips for the current route step. */
  currentTips: DemoTip[];
  /** Index within `currentTips` (0-based). */
  tipIndex: number;
  currentTip: DemoTip | null;
  /** Global progress across all tips in the main script (1-based display helpers). */
  tipOrdinal: number;
  tipTotal: number;
  canGoNext: boolean;
  canGoBack: boolean;
  /** Tip callout minimized by the user (tour still advances; “Show tip” restores it). */
  sheetMinimized: boolean;
  setSheetMinimized: (value: boolean) => void;
  startWalkthrough: () => void;
  goNext: () => void;
  goBack: () => void;
  exitDemo: () => void;
};

export const DemoWalkthroughContext = createContext<DemoWalkthroughContextValue | null>(null);

export function readStorageFlag(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(DEMO_WALKTHROUGH_STORAGE_KEY) === '1';
}

function inactiveWalkthroughValue(navigate: NavigateFunction): DemoWalkthroughContextValue {
  return {
    demoActive: false,
    showDemoChrome: false,
    currentStepIndex: -1,
    currentStep: null,
    currentStepTitle: null,
    currentTips: [],
    tipIndex: 0,
    currentTip: null,
    tipOrdinal: 0,
    tipTotal: 0,
    canGoNext: false,
    canGoBack: false,
    sheetMinimized: false,
    setSheetMinimized: () => {},
    startWalkthrough: () => {
      sessionStorage.setItem(DEMO_WALKTHROUGH_STORAGE_KEY, '1');
      navigate('/demo/start?demo=1');
    },
    goNext: () => {},
    goBack: () => {},
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
    return {
      ...base,
      startWalkthrough: () => {
        sessionStorage.setItem(DEMO_WALKTHROUGH_STORAGE_KEY, '1');
        setStorageActive(true);
        navigate('/demo/start?demo=1');
      },
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
    <Suspense fallback={<RouteChunkFallback label="Loading demo" />}>
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
