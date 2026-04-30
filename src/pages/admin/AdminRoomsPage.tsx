import { ModLedgerDraftsSection } from '../../components/admin/ModLedgerDraftsSection';
import { ModDashboardPage } from '../ModDashboardPage';

/**
 * Full moderation room and message view — same as legacy `/mod` route.
 *
 * Above the room dashboard we surface pending ledger drafts so a moderator can
 * spot squads ready to publish without context-switching into each room.
 */
export function AdminRoomsPage() {
  return (
    <div className="space-y-6">
      <ModLedgerDraftsSection />
      <ModDashboardPage />
    </div>
  );
}
