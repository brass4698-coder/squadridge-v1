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
  WhyOverview,
} from '../../components/landing';

/**
 * Homepage — what it is → who → privacy → facilitator governance → ledger → intake.
 */
export function LandingPage() {
  return (
    <div className="sr-align-content">
      <LandingHero />
      <WhyOverview />
      <PrivacyByBoundary />
      <BoundarySection />
      <MatterThroughNav />
      <ProcessStagePanel />
      <ProductEvidenceCluster />
      <UseCaseGrid />
      <RecordSpecimen />
      <PilotIntakeSection />
    </div>
  );
}
