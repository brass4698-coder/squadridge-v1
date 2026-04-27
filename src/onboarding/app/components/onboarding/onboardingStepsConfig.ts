export const ONBOARDING_STEP_IDS = [
  'mission',
  'identity',
  'placement',
  'rules',
  'verification',
  'dryrun',
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEP_IDS)[number];

const STEP_SET = new Set<string>(ONBOARDING_STEP_IDS);

export function isOnboardingStepId(id: string | undefined): id is OnboardingStepId {
  return id != null && id.length > 0 && STEP_SET.has(id);
}

export const ONBOARDING_FIRST_STEP: OnboardingStepId = 'mission';
