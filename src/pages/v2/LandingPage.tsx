import {
  BoundarySection,
  LandingHero,
  PilotIntakeSection,
  ProcessStagePanel,
  ProductEvidenceCluster,
  RecordSpecimen,
  UseCaseGrid,
} from '../../components/landing';

/**
 * Homepage — architecture-first proof stack.
 * Hero → process → trust → evidence → contexts → instrument → pilot.
 */
export function LandingPage() {
  return (
    <div className="sr-align-content">
      <LandingHero />
      <ProcessStagePanel />
      <BoundarySection />
      <ProductEvidenceCluster />
      <UseCaseGrid />
      <RecordSpecimen />
      <PilotIntakeSection />
    </div>
  );
}
