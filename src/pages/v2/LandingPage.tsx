import {
  BoundarySection,
  LandingHero,
  MatterThroughNav,
  PilotIntakeSection,
  PrivacyByBoundary,
  ProcessStagePanel,
  ProductEvidenceCluster,
  RecordSpecimen,
  UseCaseGrid,
} from '../../components/landing';

/**
 * Homepage — category claim, audience paths, room→gate→record proof stack.
 */
export function LandingPage() {
  return (
    <div className="sr-align-content">
      <LandingHero />
      <MatterThroughNav />
      <ProcessStagePanel />
      <PrivacyByBoundary />
      <BoundarySection />
      <ProductEvidenceCluster />
      <UseCaseGrid />
      <RecordSpecimen />
      <PilotIntakeSection />
    </div>
  );
}
