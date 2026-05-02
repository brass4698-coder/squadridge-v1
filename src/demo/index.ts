export { DEMO_PERSONA } from './demoPersona';
export {
  DEMO_APPENDIX,
  DEMO_FIRST_WALKTHROUGH_PATH,
  DEMO_LAST_STEP_INDEX_STORAGE_KEY,
  DEMO_MAIN_STEPS,
  DEMO_WALKTHROUGH_STORAGE_KEY,
  demoSteps,
  locationMatchesStep,
  pathsEqual,
  readLastStepIndex,
  resolveStepActions,
  type DemoAction,
  type DemoOverlayStep,
  type DemoStep,
  type EnvMode,
} from './demoScript';
export {
  DEMO_SCENARIOS,
  DEMO_SCENARIO_STORAGE_KEY,
  DEFAULT_DEMO_SCENARIO_ID,
  getDemoScenarioById,
  persistDemoScenarioId,
  readStoredDemoScenarioId,
  type DemoScenario,
  type DemoScenarioId,
  type DemoScenarioPersona,
  type DemoScenarioSeedMessage,
  type DemoScenarioScriptedIncoming,
} from './demoScenarios';
export {
  DemoWalkthroughProvider,
  DemoWalkthroughProvider as DemoProvider,
  useDemoWalkthrough,
  useDemoWalkthrough as useDemo,
} from './DemoWalkthroughContext';
export type { DemoWalkthroughContextValue } from './DemoWalkthroughContext';
export { DemoLayout } from './DemoLayout';
export { runDemoActions, runDemoAutoActions } from './demoAutoActions';
export {
  PRESENTER_MODE_STORAGE_KEY,
  isDemoBypassAllowed,
  readPresenterMode,
  setPresenterMode,
} from './presenterMode';
