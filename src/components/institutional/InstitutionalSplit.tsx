import { PrivatePublicSplit } from '../shared/PrivatePublicSplit';
import { privatePublicItems } from '../../data/privatePublicItems';

/**
 * Default room ↔ record comparison for process pages.
 * Thin wrapper over the shared signature module.
 */
export function InstitutionalSplit() {
  return (
    <PrivatePublicSplit
      privateHeading="Inside the room"
      publicHeading="Approved record"
      bridgeLabel="Facilitator release gate"
      privateFooter="Room content never auto-publishes"
      publicFooter="Independently verifiable integrity anchor"
      privateItems={privatePublicItems.private}
      publicItems={privatePublicItems.public}
      aria-label="Private mediation room separated from released public record by facilitator-controlled release"
    />
  );
}
