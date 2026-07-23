import {
  AudiencePaths,
  CoreFeatures,
  DemoWalkthroughs,
  FinalCta,
  HowItWorksFlow,
  LandingHero,
  OrdinaryChannelsFail,
  PilotReadiness,
  RoomRecordModel,
  TrustProofRail,
  ZeroKnowledgeArchitecture,
} from '../../components/landing';

/**
 * Marketing homepage — institution-grade positioning for pilot review.
 * Trust claims stay aligned with /security (room ≠ record; no E2EE/anonymity overclaim).
 */
export function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg)' }}>
      <LandingHero />
      <TrustProofRail />
      <AudiencePaths />
      <OrdinaryChannelsFail />
      <ZeroKnowledgeArchitecture />
      <RoomRecordModel />
      <HowItWorksFlow />
      <CoreFeatures />
      <DemoWalkthroughs />
      <PilotReadiness />
      <FinalCta />
    </div>
  );
}
