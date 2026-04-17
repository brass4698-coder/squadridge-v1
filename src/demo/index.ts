export { DEMO_PERSONA } from './demoPersona';
export {
  DEMO_APPENDIX,
  DEMO_FIRST_WALKTHROUGH_PATH,
  DEMO_MAIN_STEPS,
  DEMO_WALKTHROUGH_STORAGE_KEY,
  demoSteps,
  locationMatchesStep,
  pathsEqual,
  type DemoAction,
  type DemoOverlayStep,
  type DemoStep,
  type EnvMode,
} from './demoScript';
export {
  DemoWalkthroughProvider,
  DemoWalkthroughProvider as DemoProvider,
  useDemoWalkthrough,
  useDemoWalkthrough as useDemo,
} from './DemoWalkthroughContext';
export type { DemoWalkthroughContextValue } from './DemoWalkthroughContext';
export { DemoLayout } from './DemoLayout';
export { runDemoActions, runDemoAutoActions } from './demoAutoActions';
