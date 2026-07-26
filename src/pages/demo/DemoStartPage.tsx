import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { DemoWalkthroughRole } from '../../data/demoCredentials';
import { DEMO_WALKTHROUGH_ROLES } from '../../data/demoCredentials';
import { FormPanel } from '../../components/ui/FormPanel';
import { GovernedEntryLayout } from '../../components/shell/GovernedEntryLayout';
import { useDemoGovernance } from '../../demo/DemoGovernanceContext';
import { firstStepPathForRole, writeDemoWalkthroughRole } from '../../demo/demoRolePaths';
import type { DemoPresetId } from '../../data/governanceDashboard';
import { cn } from '../../lib/cn';
import { DEMO_WALKTHROUGH_STORAGE_KEY } from '../../demo/demoScript';
import { isDemoLoginEnabled } from '../../lib/demoLogin';
import { usePageTitle } from '../../hooks/usePageTitle';

/**
 * Role + scenario picker before the guided walkthrough begins.
 */
export function DemoStartPage() {
  usePageTitle('Start demo tour');
  const navigate = useNavigate();
  const { presets, presetId, setPresetId } = useDemoGovernance();
  const [role, setRole] = useState<DemoWalkthroughRole>('facilitator');

  if (!isDemoLoginEnabled()) {
    return (
      <GovernedEntryLayout title="Demo unavailable">
        <Link to="/demo" className="text-brand">
          Back to demo hub
        </Link>
      </GovernedEntryLayout>
    );
  }

  function beginTour() {
    writeDemoWalkthroughRole(role);
    setPresetId(presetId);
    sessionStorage.setItem(DEMO_WALKTHROUGH_STORAGE_KEY, '1');
    navigate(firstStepPathForRole(role));
  }

  return (
    <GovernedEntryLayout title="Choose your lens">
      <div className="mx-auto max-w-2xl" data-demo="demo-role-start">
        <h1 className="font-heading text-display font-semibold tracking-tight text-ink">
          Start the walkthrough
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-secondary">
          Each role sees a different workspace — dashboards, charts, and tour steps are tailored.
          Fixture data is synthetic but models real institutional, business, university, military,
          and high-stakes conflict matters where anonymity matters.
        </p>

        <FormPanel className="mt-8" eyebrow="Step 1" title="Select your role">
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="sr-only">Walkthrough role</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {DEMO_WALKTHROUGH_ROLES.map((r) => (
                <label
                  key={r.id}
                  className={cn(
                    'sr-form-tile cursor-pointer !p-4',
                    role === r.id && 'border-brand/50 bg-surface-accent',
                  )}
                >
                  <input
                    type="radio"
                    name="demo-role"
                    value={r.id}
                    checked={role === r.id}
                    onChange={() => setRole(r.id)}
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold text-ink">{r.label}</span>
                  <span className="mt-1.5 text-xs leading-relaxed text-ink-secondary">
                    {r.description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </FormPanel>

        <FormPanel className="mt-6" eyebrow="Step 2" title="Scenario preset">
          <p className="mb-4 text-sm text-ink-secondary">
            Changes fixture matters and charts on role dashboards during the tour.
          </p>
          <label className="sr-only" htmlFor="demo-scenario">
            Scenario preset
          </label>
          <select
            id="demo-scenario"
            className="sr-form-control sr-form-select h-12 w-full rounded-[var(--sr-radius-lg)] border border-line bg-[var(--sr-form-control-bg)] px-4 text-sm text-ink"
            value={presetId}
            onChange={(e) => setPresetId(e.target.value as DemoPresetId)}
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} — {p.scope}
              </option>
            ))}
          </select>
        </FormPanel>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-institutional btn-institutional--primary btn-institutional--block sm:w-auto"
            onClick={beginTour}
          >
            Begin {DEMO_WALKTHROUGH_ROLES.find((r) => r.id === role)?.label} tour
          </button>
          <Link to="/demo" className="btn-institutional btn-institutional--ghost">
            All credentials
          </Link>
          <Link to="/sign-in?demo=1" className="btn-institutional btn-institutional--ghost">
            Sign in first
          </Link>
        </div>
      </div>
    </GovernedEntryLayout>
  );
}
