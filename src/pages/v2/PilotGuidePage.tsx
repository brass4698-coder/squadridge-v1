import { FacilitatorWalkthrough } from '../../components/facilitator/FacilitatorWalkthrough';
import { PilotReadinessInstrument } from '../../components/facilitator/PilotReadinessInstrument';
import { OperationalPageHeader, StatusRail } from '../../components/shell';
import { PILOT_BEACHHEAD, PILOT_PRODUCT_PATH } from '../../data/pilotReadinessChecklist';
import { usePageTitle } from '../../hooks/usePageTitle';
import { appRoutes } from '../../lib/appRoutes';
import { isDemoLoginEnabled } from '../../lib/demoLogin';
import { useDemoWalkthrough } from '../../demo/DemoWalkthroughContext';

/**
 * In-app pilot readiness instrument for facilitators — operationalizes
 * docs/operations/v2-pilot-checklist.md under AuthenticatedShell.
 */
export function PilotGuidePage() {
  usePageTitle('Pilot readiness');
  const { startWalkthrough } = useDemoWalkthrough();

  return (
    <div className="mx-auto max-w-3xl" data-demo="pilot-guide">
      <OperationalPageHeader
        title="Pilot readiness"
        summary="Operationalize the v2 facilitator checklist before your first NGO private-release session. Confirm preflight, walk the spine, and keep abort criteria visible — without overclaiming encryption or traction."
        scope={PILOT_BEACHHEAD}
        nextAction="Complete the spine walkthrough, then confirm Before go-live"
        trustNote="v2 rooms are operator-readable today. Invite links are bearer secrets. Manual copy-link invites are the primary path unless Resend secrets are configured. Not in scope: /match, /verify, squad ZK chat, Track II as first session."
        roleLabel="Facilitator"
        stateLabel="Preflight"
        roleAccent="facilitator"
        primaryAction={{ label: 'New session', href: appRoutes.sessionNew }}
      />

      <StatusRail
        items={[
          PILOT_PRODUCT_PATH,
          'Private release default',
          'Operator-readable rooms',
          'Manual invites OK',
          'No mock data in pilot',
        ]}
      />

      <div id="pilot-walkthrough">
        <FacilitatorWalkthrough />
      </div>

      {isDemoLoginEnabled() ? (
        <p className="mb-8 -mt-4 text-sm text-ink-secondary">
          Staging only:{' '}
          <button
            type="button"
            className="text-brand underline-offset-2 hover:underline"
            onClick={() => startWalkthrough()}
          >
            Start scripted product tour
          </button>
          . Never enable demo login on pilot production hosts.
        </p>
      ) : (
        <p className="mb-8 -mt-4 text-xs leading-relaxed text-ink-faint">
          Scripted product tour is available when demo login is enabled on staging — never on pilot
          production hosts.
        </p>
      )}

      <PilotReadinessInstrument />
    </div>
  );
}
