import { Link } from 'react-router-dom';
import { FormPanel } from '../../components/ui/FormPanel';
import { FacilitatorWalkthrough } from '../../components/facilitator/FacilitatorWalkthrough';
import { appRoutes } from '../../lib/appRoutes';
import { isDemoLoginEnabled } from '../../lib/demoLogin';
import { useDemoWalkthrough } from '../../demo/DemoWalkthroughContext';

const PREFLIGHT = [
  {
    title: 'Environment',
    items: [
      'Deployed commit recorded in the kickoff doc',
      'VITE_V2_MOCK_DATA is unset or false',
      'Demo login disabled on the pilot host',
      'Migrations through institutional spine applied; Edge Functions deployed',
      'participant-verification storage bucket provisioned',
    ],
  },
  {
    title: 'People & process',
    items: [
      'Facilitator account active with facilitator role',
      'Incident owner assigned (off-platform immediate-danger protocol)',
      'Partner MOU states operator-readable room content',
      'Pre-registered metrics filled before day one',
    ],
  },
  {
    title: 'Success path',
    items: [
      'Template: NGO internal deliberation; public ledger unchecked unless consented',
      'Participant invite links treated as bearer secrets',
      'First success = private anchored release (not public ledger)',
      'Export audit trail after close',
    ],
  },
] as const;

/**
 * In-app pilot readiness guide for facilitators — complements docs/operations/v2-pilot-checklist.md.
 * Mounted under AuthenticatedShell via App.v2 Outlet.
 */
export function PilotGuidePage() {
  const { startWalkthrough } = useDemoWalkthrough();

  return (
    <div className="mx-auto max-w-3xl" data-demo="pilot-guide">
      <p className="mb-1 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.14em] text-ink-faint">
        Pilot ops
      </p>
      <h1 className="text-xl font-semibold tracking-tight text-ink">Pilot readiness guide</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
        Use this page before your first NGO private-release session. Walk the spine below, then
        confirm preflight. Full checklist lives in{' '}
        <span className="font-mono text-xs text-ink-faint">
          docs/operations/v2-pilot-checklist.md
        </span>
        .
      </p>

      <div className="mt-8">
        <FacilitatorWalkthrough />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PREFLIGHT.map((block) => (
          <FormPanel key={block.title} eyebrow="Preflight" title={block.title}>
            <ul className="m-0 list-disc space-y-2 pl-4 text-sm text-ink-secondary">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </FormPanel>
        ))}
      </div>

      <FormPanel
        className="mt-8"
        eyebrow="Links"
        title="Open operational surfaces"
        description="Deep links for the live path — not mock routes."
      >
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
          <li>
            <Link to={appRoutes.sessionNew} className="text-brand">
              Configure — new session
            </Link>
          </li>
          <li>
            <Link to={appRoutes.sessions} className="text-brand">
              Sessions list
            </Link>
          </li>
          <li>
            <Link to={appRoutes.participants} className="text-brand">
              Participants index
            </Link>
          </li>
          <li>
            <Link to={appRoutes.releaseGate} className="text-brand">
              Release gate
            </Link>
          </li>
          <li>
            <Link to="/security" className="text-brand">
              Security boundaries (partner-facing)
            </Link>
          </li>
          <li>
            <Link to="/how-it-works" className="text-brand">
              How it works
            </Link>
          </li>
        </ul>
        {isDemoLoginEnabled() ? (
          <button
            type="button"
            className="btn-institutional btn-institutional--primary mt-6"
            onClick={() => startWalkthrough()}
          >
            Start scripted product tour
          </button>
        ) : (
          <p className="mt-4 mb-0 text-xs text-ink-faint">
            Scripted product tour is available when demo login is enabled (staging only — never on
            pilot production hosts).
          </p>
        )}
      </FormPanel>

      <p className="mt-8 text-xs leading-relaxed text-ink-faint">
        Abort if the participant token path fails, release can include verbatim room content, mock
        data flags are on, or confidentiality assumptions diverge from the MOU.
      </p>
    </div>
  );
}
