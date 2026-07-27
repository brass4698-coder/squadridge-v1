import { BoundarySection } from './BoundarySection';
import { PilotIntakeSection } from './PilotIntakeSection';
import { ProcessStagePanel } from './ProcessStagePanel';
import { RecordSpecimen } from './RecordSpecimen';
import { UseCaseGrid } from './UseCaseGrid';
import { WhyOverview } from './WhyOverview';

/**
 * Below-hero landing — separate chunk so first paint stays on the hero.
 */
export function LandingBelowFold() {
  return (
    <>
      <WhyOverview />
      <ProcessStagePanel />
      <RecordSpecimen />
      <BoundarySection />
      <UseCaseGrid />
      <PilotIntakeSection />
    </>
  );
}
