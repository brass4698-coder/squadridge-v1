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
 * Homepage — promise → scenario → why → process → specimen → diligence → buyer proof → intake.
 */
export function LandingPage() {
  usePageTitle('Private deliberation infrastructure');

  return (
    <div className="sr-align-content" data-page="landing">
      <LandingHero />
      <IllustrativeScenarioStrip />
      <WhyOverview />
      <ProcessStagePanel />
      <RecordSpecimen />
      <BoundarySection />
      <UseCaseGrid />
      <ProductEvidenceCluster />
      <PilotIntakeSection />
    </div>
  );
}
