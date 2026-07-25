import {
  BoundarySection,
  IllustrativeScenarioStrip,
  LandingHero,
  PilotIntakeSection,
  ProcessStagePanel,
  ProductEvidenceCluster,
  RecordSpecimen,
  UseCaseGrid,
  WhyOverview,
} from '../../components/landing';

/**
 * Homepage — promise → scenario → boundary → process → diligence → buyer proof → intake.
 */
export function LandingPage() {
  return (
    <div className="sr-align-content">
      <LandingHero />
      <IllustrativeScenarioStrip />
      <WhyOverview />
      <ProcessStagePanel />
      <BoundarySection />
      <UseCaseGrid />
      <ProductEvidenceCluster />
      <RecordSpecimen />
      <PilotIntakeSection />
    </div>
  );
}
