import type { OnboardingStepId } from './onboardingStepsConfig';

export const TRUST_FOOTER: Record<OnboardingStepId, string> = {
  mission: 'SquadRidge is built for verified anonymity. Your legal name never enters the room.',
  identity:
    'Callsigns are the only handle shown to peers. Verification proves eligibility, not identity to other participants.',
  placement: 'Region and language help matching; they are not shown verbatim in the live room.',
  rules:
    'By continuing you accept how we process session metadata and how reporting works. You can read the full policy from Settings.',
  verification:
    'Verification protects the pool from bad actors. It does not publish who you are in dialogue.',
  dryrun: 'You can leave matching at any time. Queue state is not shared with other sites.',
};
