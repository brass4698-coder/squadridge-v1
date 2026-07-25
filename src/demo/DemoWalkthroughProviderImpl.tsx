import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  DemoWalkthroughContext,
  readStorageFlag,
  type DemoWalkthroughContextValue,
} from './DemoWalkthroughContext';
import { runDemoActions } from './demoAutoActions';
import {
  clearPersistedTipState,
  DEMO_MAIN_STEPS,
  DEMO_WALKTHROUGH_STORAGE_KEY,
  locationMatchesStep,
  readPersistedTipState,
  resolveStepTips,
  writePersistedTipState,
  type DemoStep,
  type DemoTip,
} from './demoScript';
import { emitDemoPageView, emitDemoStepNav } from './demoTelemetry';

function totalTipCount(steps: DemoStep[]): number {
  return steps.reduce((n, s) => n + Math.max(1, resolveStepTips(s).length), 0);
}

function tipOrdinalFor(steps: DemoStep[], stepIndex: number, tipIndex: number): number {
  if (stepIndex < 0) return 0;
  let ordinal = 0;
  for (let i = 0; i < stepIndex; i++) {
    ordinal += Math.max(1, resolveStepTips(steps[i]).length);
  }
  return ordinal + tipIndex + 1;
}

/**
 * Full demo walkthrough: scripted steps, linear tips, auto-actions, telemetry.
 * Loaded only when `?demo=1` or session tour flag is active (see `DemoWalkthroughProvider`).
 */
export function DemoWalkthroughProviderImpl({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [storageActive, setStorageActive] = useState(readStorageFlag);
  const [tipIndex, setTipIndex] = useState(0);
  const [sheetMinimized, setSheetMinimized] = useState(false);

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

  const currentTips: DemoTip[] = useMemo(() => resolveStepTips(currentStep), [currentStep]);

  const currentStepTitle = currentStep?.title ?? null;

  /** Show chrome whenever the URL matches a scripted tour step. */
  const showDemoChrome = demoActive && currentStepIndex >= 0;

  const onboardingDemoTour =
    location.pathname.startsWith('/onboarding/') && searchParams.get('demo') === '1';

  const clampedTipIndex =
    currentTips.length === 0 ? 0 : Math.min(Math.max(tipIndex, 0), currentTips.length - 1);

  const currentTip: DemoTip | null =
    currentTips.length > 0 ? (currentTips[clampedTipIndex] ?? null) : null;

  const tipTotal = useMemo(() => totalTipCount(DEMO_MAIN_STEPS), []);
  const tipOrdinal = tipOrdinalFor(DEMO_MAIN_STEPS, currentStepIndex, clampedTipIndex);

  const atLastTipOfStep = clampedTipIndex >= Math.max(0, currentTips.length - 1);
  const atLastStep = currentStepIndex >= DEMO_MAIN_STEPS.length - 1;

  const canGoNext =
    demoActive && currentStepIndex >= 0 && !onboardingDemoTour && !(atLastStep && atLastTipOfStep);

  const canGoBack =
    demoActive && currentStepIndex >= 0 && !(currentStepIndex === 0 && clampedTipIndex === 0);

  const autoAbortRef = useRef<AbortController | null>(null);
  const actionsRunningRef = useRef(false);

  const cancelAutoActions = useCallback(() => {
    autoAbortRef.current?.abort();
    autoAbortRef.current = null;
  }, []);

  // Sync tip index when the route step changes; restore resume state when possible.
  useEffect(() => {
    if (!currentStep) {
      setTipIndex(0);
      return;
    }
    const persisted = readPersistedTipState();
    if (persisted?.stepId === currentStep.id) {
      const max = Math.max(0, resolveStepTips(currentStep).length - 1);
      setTipIndex(Math.min(Math.max(0, persisted.tipIndex), max));
    } else {
      setTipIndex(0);
      writePersistedTipState(currentStep.id, 0);
    }
    setSheetMinimized(false);
  }, [currentStep?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- only on step id change

  useEffect(() => {
    if (!currentStep) return;
    writePersistedTipState(currentStep.id, clampedTipIndex);
  }, [currentStep, clampedTipIndex]);

  const startWalkthrough = useCallback(() => {
    sessionStorage.setItem(DEMO_WALKTHROUGH_STORAGE_KEY, '1');
    setStorageActive(true);
    const first = DEMO_MAIN_STEPS[0];
    if (first) {
      writePersistedTipState(first.id, 0);
      navigate(first.path);
    }
  }, [navigate]);

  const goNext = useCallback(() => {
    if (!demoActive || currentStepIndex < 0) return;
    if (onboardingDemoTour) return;
    if (actionsRunningRef.current) return;
    if (!canGoNext) return;

    if (!atLastTipOfStep) {
      setTipIndex((i) => i + 1);
      setSheetMinimized(false);
      if (currentStep) emitDemoStepNav(currentStep.id, 'next');
      return;
    }

    const next = DEMO_MAIN_STEPS[currentStepIndex + 1];
    if (currentStep) emitDemoStepNav(currentStep.id, 'next');
    if (next) {
      writePersistedTipState(next.id, 0);
      navigate(next.path);
    }
  }, [
    demoActive,
    currentStepIndex,
    currentStep,
    navigate,
    onboardingDemoTour,
    canGoNext,
    atLastTipOfStep,
  ]);

  const goBack = useCallback(() => {
    if (!demoActive || currentStepIndex < 0) return;
    if (!canGoBack) return;

    if (clampedTipIndex > 0) {
      setTipIndex((i) => Math.max(0, i - 1));
      setSheetMinimized(false);
      if (currentStep) emitDemoStepNav(currentStep.id, 'back');
      return;
    }

    const prev = DEMO_MAIN_STEPS[currentStepIndex - 1];
    if (currentStep) emitDemoStepNav(currentStep.id, 'back');
    if (prev) {
      const prevTips = resolveStepTips(prev);
      const lastTip = Math.max(0, prevTips.length - 1);
      writePersistedTipState(prev.id, lastTip);
      navigate(prev.path);
    }
  }, [demoActive, currentStepIndex, currentStep, navigate, canGoBack, clampedTipIndex]);

  const exitDemo = useCallback(() => {
    cancelAutoActions();
    sessionStorage.removeItem(DEMO_WALKTHROUGH_STORAGE_KEY);
    clearPersistedTipState();
    setStorageActive(false);
    setTipIndex(0);
    setSheetMinimized(false);
    navigate('/', { replace: true });
  }, [navigate, cancelAutoActions]);

  useEffect(() => {
    if (!demoActive || !currentStep) return;
    emitDemoPageView(currentStep.id);
  }, [demoActive, currentStep]);

  useEffect(() => {
    cancelAutoActions();
    if (!showDemoChrome || !currentStep?.actions?.length) return;
    if (!locationMatchesStep(location.pathname, location.search, currentStep.path)) return;

    const ac = new AbortController();
    autoAbortRef.current = ac;
    actionsRunningRef.current = true;

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
      currentTips,
      tipIndex: clampedTipIndex,
      currentTip,
      tipOrdinal,
      tipTotal,
      canGoNext,
      canGoBack,
      sheetMinimized,
      setSheetMinimized,
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
      currentTips,
      clampedTipIndex,
      currentTip,
      tipOrdinal,
      tipTotal,
      canGoNext,
      canGoBack,
      sheetMinimized,
      startWalkthrough,
      goNext,
      goBack,
      exitDemo,
    ],
  );

  return (
    <DemoWalkthroughContext.Provider value={value}>{children}</DemoWalkthroughContext.Provider>
  );
}
