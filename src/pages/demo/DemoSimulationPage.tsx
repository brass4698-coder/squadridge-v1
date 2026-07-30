import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROLE_LABELS, ROLE_PRIORITY, type RoleKey } from '../../types/roles';
import { setDemoRoleOverride } from '../../demo/demoRoleSwitcher';
import { isDemoSquadShortcutsEnabled } from '../../lib/env';

type SimStep =
  | 'role'
  | 'signup'
  | 'customize'
  | 'invites'
  | 'onboarding'
  | 'discussion'
  | 'mediation'
  | 'ledger';

const STEPS: { id: SimStep; label: string }[] = [
  { id: 'role', label: 'Role' },
  { id: 'signup', label: 'Access' },
  { id: 'customize', label: 'Customize' },
  { id: 'invites', label: 'Invites' },
  { id: 'onboarding', label: 'Brief' },
  { id: 'discussion', label: 'Room' },
  { id: 'mediation', label: 'Assist' },
  { id: 'ledger', label: 'Outcome' },
];

const DEMO_LINES = [
  { who: 'Facilitator', text: 'We stay on shared facts. Take your time.' },
  { who: 'Side A (verified seat)', text: 'Our priority is water access timing, not blame.' },
  {
    who: 'Side B (verified seat)',
    text: 'We can meet on a weekly release window if monitoring is joint.',
  },
];

/**
 * Illustrative full-flow demo — role → access → room → assist → public ledger + private proposal.
 * Not production identity. No public PII. Honest about TLS / room≠record (see /security).
 */
export function DemoSimulationPage() {
  const enabled = isDemoSquadShortcutsEnabled();
  const [step, setStep] = useState<SimStep>('role');
  const [role, setRole] = useState<RoleKey>('participant');
  const [callsign, setCallsign] = useState('Northstar-7');
  const [slowDownFlash, setSlowDownFlash] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    if (step !== 'discussion') return;
    const id = window.setInterval(() => {
      setLineIdx((i) => (i + 1) % DEMO_LINES.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [step]);

  if (!enabled) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16" data-testid="demo-simulation-disabled">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Demo simulation unavailable
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Enable <code>VITE_ENABLE_DEMO_SQUAD</code> in non-production, or run locally in DEV.
        </p>
        <Link to="/" className="mt-4 inline-block text-sm underline-offset-2 hover:underline">
          Back home
        </Link>
      </div>
    );
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  function next() {
    const i = STEPS.findIndex((s) => s.id === step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1].id);
  }

  function back() {
    const i = STEPS.findIndex((s) => s.id === step);
    if (i > 0) setStep(STEPS[i - 1].id);
  }

  function chooseRole(r: RoleKey) {
    setRole(r);
    setDemoRoleOverride(r);
  }

  function triggerSlowDown() {
    setSlowDownFlash(true);
    window.setTimeout(() => setSlowDownFlash(false), 2800);
  }

  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{
        background:
          'radial-gradient(ellipse at 20% 0%, color-mix(in srgb, var(--color-accent) 12%, transparent), transparent 55%), var(--color-bg)',
      }}
      data-testid="demo-simulation"
    >
      <div className="mx-auto max-w-2xl">
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-accent)' }}
        >
          Illustrative · Demo only
        </p>
        <h1
          className="mt-2 font-display text-3xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          SquadRidge
        </h1>
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Full-flow simulation for diligence: choose a role, walk access barriers, enter a calm
          room, see optional assist, then a public outcome with no PII — and a private proposal for
          decision-makers. Room ≠ record. See{' '}
          <Link to="/security" className="underline-offset-2 hover:underline">
            Security
          </Link>
          .
        </p>

        <ol className="mt-8 flex flex-wrap gap-2" aria-label="Simulation progress">
          {STEPS.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setStep(s.id)}
                className="rounded border px-2.5 py-1 text-xs transition-opacity hover:opacity-90"
                style={{
                  borderColor: i === stepIndex ? 'var(--color-accent)' : 'var(--color-border)',
                  color: i === stepIndex ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-surface)',
                }}
                aria-current={i === stepIndex ? 'step' : undefined}
              >
                {i + 1}. {s.label}
              </button>
            </li>
          ))}
        </ol>

        <section
          className="mt-8 rounded-lg border px-5 py-6 animate-step-in"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          aria-live="polite"
        >
          {step === 'role' && (
            <>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Choose your seat
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Demo role switcher only — does not mutate production identity.
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {ROLE_PRIORITY.map((r) => (
                  <li key={r}>
                    <button
                      type="button"
                      onClick={() => chooseRole(r)}
                      className="w-full rounded border px-3 py-3 text-left text-sm"
                      style={{
                        borderColor: role === r ? 'var(--color-accent)' : 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-bg)',
                      }}
                      data-testid={`sim-role-${r}`}
                    >
                      {ROLE_LABELS[r]}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === 'signup' && (
            <>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Access barrier
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Magic-link / invite gate. No public self-serve into live high-stakes rooms.
              </p>
              <div
                className="mt-4 rounded border px-4 py-3 font-mono text-xs"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                invite · verified · {ROLE_LABELS[role]} · callsign pending
              </div>
            </>
          )}

          {step === 'customize' && (
            <>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Room preferences
              </h2>
              <label
                className="mt-4 block text-xs"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Callsign (not a legal name)
                <input
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text-primary)',
                  }}
                  data-testid="sim-callsign"
                />
              </label>
              <p className="mt-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Preferences stay local to the session brief. Public ledger never shows callsigns.
              </p>
            </>
          )}

          {step === 'invites' && (
            <>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Cohort invitations
              </h2>
              <ul
                className="mt-4 space-y-2 text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <li>Side A · seat reserved · verification pending</li>
                <li>Side B · seat reserved · verified</li>
                <li>Observer · read-only after release</li>
              </ul>
              <p className="mt-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Invite emails are operational — never published on the ledger.
              </p>
            </>
          )}

          {step === 'onboarding' && (
            <>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Session brief
              </h2>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {callsign}: you will join a structured round. Facilitator authority is primary. Slow
                down is available. Nothing in the room publishes without a release gate.
              </p>
            </>
          )}

          {step === 'discussion' && (
            <>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Harmony room (illustrative)
              </h2>
              <div
                className="mt-4 min-h-[5.5rem] rounded border px-4 py-3 transition-opacity"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  opacity: slowDownFlash ? 0.55 : 1,
                }}
              >
                <p className="text-xs" style={{ color: 'var(--color-accent)' }}>
                  {DEMO_LINES[lineIdx].who}
                </p>
                <p className="mt-1 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {DEMO_LINES[lineIdx].text}
                </p>
              </div>
              {slowDownFlash ? (
                <p className="mt-3 text-sm" style={{ color: 'var(--color-accent)' }} role="status">
                  Slow down — breath, then send resumes. No mood score. No body logged.
                </p>
              ) : (
                <button
                  type="button"
                  data-testid="sim-slow-down"
                  onClick={triggerSlowDown}
                  className="mt-4 rounded border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  Demonstrate Slow down
                </button>
              )}
            </>
          )}

          {step === 'mediation' && (
            <>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Optional assist
              </h2>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                When enabled and consented, local tone/assist may <em>suggest</em> Slow down or
                clearer phrasing. It is never marketed as truth and never auto-punishes. Facilitator
                judgment stays primary.
              </p>
              <div
                className="mt-4 rounded border px-4 py-3 text-sm"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
              >
                Suggest: “Written-only round for 10 minutes” · Accept / Dismiss
              </div>
            </>
          )}

          {step === 'ledger' && (
            <>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Public outcome · private proposal
              </h2>
              <article
                className="mt-4 rounded border px-4 py-4"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
              >
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Public ledger (no PII)
                </p>
                <h3
                  className="mt-2 text-base font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Joint weekly monitoring window
                </h3>
                <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Parties agreed to a shared release cadence and joint observation. Dialogue text is
                  not published.
                </p>
              </article>
              <article
                className="mt-3 rounded border px-4 py-4"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
              >
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Behind the scenes · decision-makers
                </p>
                <p className="mt-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  Draft proposal packet (access-gated): implementation options, open risks, approval
                  chips. Not on the public ledger until released.
                </p>
              </article>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <Link
                  to="/ledger"
                  className="underline-offset-2 hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Open ledger
                </Link>
                <Link
                  to="/app/demo/catalog"
                  className="underline-offset-2 hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Demo catalog
                </Link>
              </div>
            </>
          )}
        </section>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={back}
            disabled={stepIndex === 0}
            className="rounded border px-4 py-2 text-sm disabled:opacity-40"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Back
          </button>
          {stepIndex < STEPS.length - 1 ? (
            <button
              type="button"
              data-testid="sim-next"
              onClick={next}
              className="rounded px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Continue
            </button>
          ) : (
            <Link
              to="/"
              className="rounded px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Done
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
