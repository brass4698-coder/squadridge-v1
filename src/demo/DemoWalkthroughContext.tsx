import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  DEMO_MAIN_STEPS,
  DEMO_WALKTHROUGH_STORAGE_KEY,
  locationMatchesStep,
} from './demoScript';

export type DemoWalkthroughContextValue = {
  /** Tour is active: `?demo=1` and/or session storage flag. */
  demoActive: boolean;
  /** Index into {@link DEMO_MAIN_STEPS}, or `-1` if not on a scripted step. */
  currentStepIndex: number;
  currentStepTitle: string | null;
  canGoNext: boolean;
  canGoBack: boolean;
  startWalkthrough: () => void;
  goNext: () => void;
  goBack: () => void;
  exitDemo: () => void;
};

const DemoWalkthroughContext = createContext<DemoWalkthroughContextValue | null>(null);

function readStorageFlag(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(DEMO_WALKTHROUGH_STORAGE_KEY) === '1';
}

export function DemoWalkthroughProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [storageActive, setStorageActive] = useState(readStorageFlag);

  const demoQuery = searchParams.get('demo') === '1';

  useEffect(() => {
    if (!demoQuery) return;
    sessionStorage.setItem(DEMO_WALKTHROUGH_STORAGE_KEY, '1');
    setStorageActive(true);
  }, [demoQuery]);

  const demoActive = demoQuery || storageActive;

  const currentStepIndex = useMemo(() => {
    return DEMO_MAIN_STEPS.findIndex((s) =>
      locationMatchesStep(location.pathname, location.search, s.path),
    );
  }, [location.pathname, location.search]);

  const currentStepTitle =
    currentStepIndex >= 0 && currentStepIndex < DEMO_MAIN_STEPS.length
      ? DEMO_MAIN_STEPS[currentStepIndex].title
      : null;

  const canGoNext = demoActive && currentStepIndex >= 0 && currentStepIndex < DEMO_MAIN_STEPS.length - 1;
  const canGoBack = demoActive && currentStepIndex > 0;

  const startWalkthrough = useCallback(() => {
    sessionStorage.setItem(DEMO_WALKTHROUGH_STORAGE_KEY, '1');
    setStorageActive(true);
    navigate('/?demo=1', { replace: false });
  }, [navigate]);

  const goNext = useCallback(() => {
    if (!demoActive || currentStepIndex < 0 || currentStepIndex >= DEMO_MAIN_STEPS.length - 1) return;
    const next = DEMO_MAIN_STEPS[currentStepIndex + 1];
    navigate(next.path);
  }, [demoActive, currentStepIndex, navigate]);

  const goBack = useCallback(() => {
    if (!demoActive || currentStepIndex <= 0) return;
    const prev = DEMO_MAIN_STEPS[currentStepIndex - 1];
    navigate(prev.path);
  }, [demoActive, currentStepIndex, navigate]);

  const exitDemo = useCallback(() => {
    sessionStorage.removeItem(DEMO_WALKTHROUGH_STORAGE_KEY);
    setStorageActive(false);
    navigate('/', { replace: true });
  }, [navigate]);

  const value = useMemo<DemoWalkthroughContextValue>(
    () => ({
      demoActive,
      currentStepIndex,
      currentStepTitle,
      canGoNext,
      canGoBack,
      startWalkthrough,
      goNext,
      goBack,
      exitDemo,
    }),
    [
      demoActive,
      currentStepIndex,
      currentStepTitle,
      canGoNext,
      canGoBack,
      startWalkthrough,
      goNext,
      goBack,
      exitDemo,
    ],
  );

  return <DemoWalkthroughContext.Provider value={value}>{children}</DemoWalkthroughContext.Provider>;
}

export function useDemoWalkthrough(): DemoWalkthroughContextValue {
  const ctx = useContext(DemoWalkthroughContext);
  if (!ctx) {
    throw new Error('useDemoWalkthrough must be used within DemoWalkthroughProvider');
  }
  return ctx;
}
