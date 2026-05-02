import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  DemoWalkthroughContext,
  readStorageFlag,
  type DemoWalkthroughContextValue,
} from './DemoWalkthroughContext';
import { runDemoActions } from './demoAutoActions';
import {
  DEMO_LAST_STEP_INDEX_STORAGE_KEY,
  DEMO_MAIN_STEPS,
  DEMO_WALKTHROUGH_STORAGE_KEY,
  locationMatchesStep,
  resolveStepActions,
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
import { emitDemoPageView, emitDemoStepNav } from './demoTelemetry';

function persistLastStepIndex(index: number): void {
  if (typeof window === 'undefined') return;
  if (index < 0) return;
  try {
    window.sessionStorage.setItem(DEMO_LAST_STEP_INDEX_STORAGE_KEY, String(index));
  } catch {
    /* ignore */
  }
}

/**
 * Full demo walkthrough: scripted steps, auto-actions, telemetry.
 * Loaded only when `?demo=1` or session tour flag is active (see `DemoWalkthroughProvider`).
 */
export function DemoWalkthroughProviderImpl({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [storageActive, setStorageActive] = useState(readStorageFlag);
  const [scenarioId, setScenarioIdState] = useState<DemoScenarioId>(() =>
    readStoredDemoScenarioId(),
  );

  const demoQuery = searchParams.get('demo') === '1';
  const presenterNotesActive = searchParams.get('notes') === '1';

  useEffect(() => {
    if (!demoQuery) return;
    sessionStorage.setItem(DEMO_WALKTHROUGH_STORAGE_KEY, '1');
    setStorageActive(true);
  }, [demoQuery]);

  const demoActive = demoQuery || storageActive;

  const scenario: DemoScenario = useMemo(() => getDemoScenarioById(scenarioId), [scenarioId]);

  const setScenarioId = useCallback((id: DemoScenarioId) => {
    setScenarioIdState(id);
    persistDemoScenarioId(id);
  }, []);

  const currentStepIndex = useMemo(() => {
    return DEMO_MAIN_STEPS.findIndex((s) =>
      locationMatchesStep(location.pathname, location.search, s.path),
    );
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (currentStepIndex < 0) return;
    persistLastStepIndex(currentStepIndex);
  }, [currentStepIndex]);

  const currentStep: DemoStep | null =
    currentStepIndex >= 0 && currentStepIndex < DEMO_MAIN_STEPS.length
      ? DEMO_MAIN_STEPS[currentStepIndex]!
      : null;

  const currentStepTitle = currentStep?.title ?? null;

  /** Keep landing/ledger/security polished: show guided chrome on those paths only when `?demo=1` is in the URL. */
  const marketingPublicPath =
    location.pathname === '/' ||
    location.pathname.startsWith('/ledger') ||
    location.pathname.startsWith('/security');

  /** Single published ledger records should read as artifacts, not a guided tour step. */
  const isLedgerProposalDetail = /^\/ledger\/[^/]+$/.test(location.pathname);

  const showDemoChrome =
    demoActive &&
    currentStepIndex >= 0 &&
    !(marketingPublicPath && !demoQuery) &&
    !isLedgerProposalDetail;

  const onboardingDemoTour =
    location.pathname.startsWith('/onboarding/') && searchParams.get('demo') === '1';

  const canGoNext =
    demoActive &&
    currentStepIndex >= 0 &&
    currentStepIndex < DEMO_MAIN_STEPS.length - 1 &&
    !onboardingDemoTour;

  const canGoBack = demoActive && currentStepIndex > 0;

  const autoAbortRef = useRef<AbortController | null>(null);
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

  const restartWalkthrough = useCallback(() => {
    sessionStorage.setItem(DEMO_WALKTHROUGH_STORAGE_KEY, '1');
    setStorageActive(true);
    persistLastStepIndex(0);
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

  const goToStepIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= DEMO_MAIN_STEPS.length) return;
      const target = DEMO_MAIN_STEPS[index];
      if (!target) return;
      sessionStorage.setItem(DEMO_WALKTHROUGH_STORAGE_KEY, '1');
      setStorageActive(true);
      persistLastStepIndex(index);
      navigate(target.path);
    },
    [navigate],
  );

  const exitDemo = useCallback(() => {
    cancelAutoActions();
    sessionStorage.removeItem(DEMO_WALKTHROUGH_STORAGE_KEY);
    setStorageActive(false);
    navigate('/', { replace: true });
  }, [navigate, cancelAutoActions]);

  useEffect(() => {
    if (!demoActive || !currentStep) return;
    emitDemoPageView(currentStep.id);
  }, [demoActive, currentStep]);

  useEffect(() => {
    cancelAutoActions();
    if (!showDemoChrome || !currentStep) return;
    if (!locationMatchesStep(location.pathname, location.search, currentStep.path)) return;

    const actions = resolveStepActions(currentStep, scenario);
    if (actions.length === 0) return;

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
  }, [
    showDemoChrome,
    currentStep,
    scenario,
    location.pathname,
    location.search,
    cancelAutoActions,
  ]);

  const value = useMemo<DemoWalkthroughContextValue>(
    () => ({
      demoActive,
      showDemoChrome,
      currentStepIndex,
      currentStep,
      currentStepTitle,
      canGoNext,
      canGoBack,
      presenterNotesActive,
      scenario,
      setScenarioId,
      startWalkthrough,
      goNext,
      goBack,
      goToStepIndex,
      restartWalkthrough,
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
      presenterNotesActive,
      scenario,
      setScenarioId,
      startWalkthrough,
      goNext,
      goBack,
      goToStepIndex,
      restartWalkthrough,
      exitDemo,
    ],
  );

  return (
    <DemoWalkthroughContext.Provider value={value}>{children}</DemoWalkthroughContext.Provider>
  );
}

export { DEFAULT_DEMO_SCENARIO_ID };
