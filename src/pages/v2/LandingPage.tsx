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
import { usePageTitle } from '../../hooks/usePageTitle';

/**
 * Homepage — promise → scenario → boundary → process → diligence → buyer proof → intake.
 */
export function LandingPage() {
  usePageTitle('Private deliberation infrastructure');

  return (
    <div className="sr-align-content" data-page="landing">
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
