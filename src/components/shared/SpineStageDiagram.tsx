import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { claimsForSpineStage, type ImplementationClaim } from '../../data/implementationStatus';
import { ImplementationStatusBadge } from './ImplementationStatusBadge';

export type SpineStageId = 'configure' | 'verify' | 'facilitate' | 'release';

const STAGES: {
  id: SpineStageId;
  title: string;
  body: string;
  securityHref: string;
}[] = [
  {
    id: 'configure',
    title: 'Configure',
    body: 'Facilitator sets template, capacity, and eligibility. Invite-only — no open signup.',
    securityHref: '/security#safeguards',
  },
  {
    id: 'verify',
    title: 'Verify',
    body: 'Participants accept role-scoped invites. Facilitator approves before the room opens.',
    securityHref: '/security#safeguards',
  },
  {
    id: 'facilitate',
    title: 'Facilitate',
    body: 'Structured written rounds. Dialogue stays private. Metadata audit — no message bodies.',
    securityHref: '/security#operator-access',
  },
  {
    id: 'release',
    title: 'Release',
    body: 'Facilitator-authored instrument, hash-bound approvals, explicit release — or no public record.',
    securityHref: '/security/technical#verification-anchor',
  },
];

/**
 * Interactive Configure → Verify → Facilitate → Release diagram with registry badges
 * and deep links into Security safeguards.
 */
export function SpineStageDiagram() {
  const [active, setActive] = useState<SpineStageId>('configure');
  const stage = STAGES.find((s) => s.id === active) ?? STAGES[0];
  const claims: ImplementationClaim[] = claimsForSpineStage(stage.id);

  return (
    <div className="sr-spine-diagram" data-demo="how-it-works-spine-diagram">
      <div
        className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
        role="tablist"
        aria-label="Process spine stages"
      >
        {STAGES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={active === s.id}
            id={`spine-tab-${s.id}`}
            aria-controls={`spine-panel-${s.id}`}
            className={cn(
              'relative flex min-h-[4.5rem] flex-1 flex-col items-start justify-center rounded-[var(--sr-radius-lg)] border px-4 py-3 text-left transition-colors',
              active === s.id
                ? 'border-brand/50 bg-surface-accent shadow-sr-sm'
                : 'border-line bg-surface-elevated/80 hover:border-line-strong',
            )}
            onClick={() => setActive(s.id)}
          >
            <span className="font-mono text-[length:var(--text-label)] text-brand">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="mt-1 text-sm font-semibold text-ink">{s.title}</span>
            {i < STAGES.length - 1 ? (
              <span
                className="pointer-events-none absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-ink-faint sm:block"
                aria-hidden
              >
                →
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div
        id={`spine-panel-${stage.id}`}
        role="tabpanel"
        aria-labelledby={`spine-tab-${stage.id}`}
        className="mt-6 rounded-[var(--sr-radius-xl)] border border-line bg-surface-elevated p-5 md:p-6"
      >
        <h3 className="m-0 font-heading text-lg font-semibold text-ink">{stage.title}</h3>
        <p className="mt-2 mb-0 max-w-prose text-sm leading-relaxed text-ink-secondary">
          {stage.body}
        </p>
        <p className="mt-4 mb-2 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
          Related safeguards
        </p>
        <ul className="m-0 list-none space-y-3 p-0">
          {claims.map((c) => (
            <li key={c.id} className="flex flex-wrap items-start gap-2">
              <ImplementationStatusBadge status={c.status} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="m-0 text-sm font-medium text-ink">{c.label}</p>
                <p className="mt-1 mb-0 text-xs leading-relaxed text-ink-secondary">{c.summary}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link
          to={stage.securityHref}
          className="mt-5 inline-block text-sm font-medium text-brand underline-offset-2 hover:underline"
        >
          Open matching Security section →
        </Link>
      </div>
    </div>
  );
}
