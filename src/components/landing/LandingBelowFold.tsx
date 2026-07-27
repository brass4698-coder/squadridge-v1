import { BoundarySection } from './BoundarySection';
import { IllustrativeScenarioStrip } from './IllustrativeScenarioStrip';
import { LandingMidCta } from './LandingMidCta';
import { PilotIntakeSection } from './PilotIntakeSection';
import { ProcessStagePanel } from './ProcessStagePanel';
import { ProductEvidenceCluster } from './ProductEvidenceCluster';
import { RecordSpecimen } from './RecordSpecimen';
import { UseCaseGrid } from './UseCaseGrid';
import { WhyOverview } from './WhyOverview';

/**
 * Below-hero landing sections — separate chunk so first paint stays on the hero.
 * Keep in sync with the homepage composition in LandingPage.
 */
export function LandingBelowFold() {
  return (
    <>
      <IllustrativeScenarioStrip />
      <WhyOverview />
      <ProcessStagePanel />
      <LandingMidCta />
      <RecordSpecimen />
      <BoundarySection />
      <UseCaseGrid />
      <ProductEvidenceCluster />
      <PilotIntakeSection />
    </>
  );
}
