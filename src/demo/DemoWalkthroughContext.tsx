import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { runDemoActions } from './demoAutoActions';
import { DEMO_MAIN_STEPS, DEMO_WALKTHROUGH_STORAGE_KEY, locationMatchesStep, type DemoStep } from './demoScript';
import { emitDemoPageView, emitDemoStepNav } from './demoTelemetry';

export type DemoWalkthroughContextValue = {
  demoActive: boolean;
  /** True when the URL matches a scripted step and demo is on — drives chrome + Space. */
  showDemoChrome: boolean;
  currentStepIndex: number;
  currentStep: DemoStep | null;
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

  const currentStep: DemoStep | null =
    currentStepIndex >= 0 && currentStepIndex < DEMO_MAIN_STEPS.length
      ? DEMO_MAIN_STEPS[currentStepIndex]!
      : null;

  const currentStepTitle = currentStep?.title ?? null;

  const showDemoChrome = demoActive && currentStepIndex >= 0;

  /** Onboarding uses its own footer during the tour; demo bar Next would skip substeps. */
  const onboardingDemoTour =
    location.pathname === '/onboarding' && searchParams.get('demo') === '1';

  const canGoNext =
    demoActive &&
    currentStepIndex >= 0 &&
    currentStepIndex < DEMO_MAIN_STEPS.length - 1 &&
    !onboardingDemoTour;

  const canGoBack = demoActive && currentStepIndex > 0;

  const autoAbortRef = useRef<AbortController | null>(null);
  /** True while the current step’s `actions` runner is in flight (blocks tour `goNext` / Space). */
  const actionsRunningRef = useRef(false);

  const cancelAutoActions = useCallback(() => {
    autoAbortRef.current?.abort();
    autoAbortRef.current = null;
  }, []);

  const startWalkthrough = useCallback(() => {
    sessionStorage.setItem(DEMO_WALKTHROUGH_STORAGE_KEY, '1');
    setStorageActive(true);
    const first = DEMO_MAIN_STEPS[0];
    if (first) navigate(first.path);
  }, [navigate]);

  const goNext = useCallback(() => {
    if (!demoActive || currentStepIndex < 0) return;
    if (onboardingDemoTour) return;
    if (actionsRunningRef.current) return;
    if (currentStepIndex >= DEMO_MAIN_STEPS.length - 1) return;
    const next = DEMO_MAIN_STEPS[currentStepIndex + 1];
    if (currentStep) emitDemoStepNav(currentStep.id, 'next');
    if (next) navigate(next.path);
  }, [demoActive, currentStepIndex, currentStep, navigate, onboardingDemoTour]);

  const goBack = useCallback(() => {
    if (!demoActive || currentStepIndex <= 0) return;
    const prev = DEMO_MAIN_STEPS[currentStepIndex - 1];
    if (currentStep) emitDemoStepNav(currentStep.id, 'back');
    if (prev) navigate(prev.path);
  }, [demoActive, currentStepIndex, currentStep, navigate]);

  const exitDemo = useCallback(() => {
    cancelAutoActions();
    sessionStorage.removeItem(DEMO_WALKTHROUGH_STORAGE_KEY);
    setStorageActive(false);
    navigate('/', { replace: true });
  }, [navigate, cancelAutoActions]);

  useEffect(() => {
    if (!demoActive || !currentStep) return;
    emitDemoPageView(currentStep.id);
  }, [demoActive, currentStep?.id]);

  useEffect(() => {
    cancelAutoActions();
    if (!showDemoChrome || !currentStep?.actions?.length) return;
    if (!locationMatchesStep(location.pathname, location.search, currentStep.path)) return;

    const ac = new AbortController();
    autoAbortRef.current = ac;
    actionsRunningRef.current = true;

    /** Only real user edits abort — scripted `dispatchEvent` for demo typing has `isTrusted === false`. */
    const onUserInput = (e: Event) => {
      if (!e.isTrusted) return;
      const t = e.target;
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement
      ) {
        ac.abort();
      }
    };

    const onTrustedClick = (e: MouseEvent) => {
      if (e.isTrusted) ac.abort();
    };

    document.addEventListener('input', onUserInput, true);
    document.addEventListener('change', onUserInput, true);
    document.addEventListener('click', onTrustedClick, true);

    const actions = currentStep.actions;
    void (async () => {
      try {
        await runDemoActions(actions, () => ac.signal.aborted);
      } finally {
        actionsRunningRef.current = false;
      }
    })();

    return () => {
      ac.abort();
      actionsRunningRef.current = false;
      document.removeEventListener('input', onUserInput, true);
      document.removeEventListener('change', onUserInput, true);
      document.removeEventListener('click', onTrustedClick, true);
    };
  }, [showDemoChrome, currentStep, location.pathname, location.search, cancelAutoActions]);

  const value = useMemo<DemoWalkthroughContextValue>(
    () => ({
      demoActive,
      showDemoChrome,
      currentStepIndex,
      currentStep,
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
      showDemoChrome,
      currentStepIndex,
      currentStep,
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
