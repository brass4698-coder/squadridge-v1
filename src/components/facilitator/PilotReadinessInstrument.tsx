import { Link } from 'react-router-dom';
import { Check, Circle } from 'lucide-react';
import { ApprovalCount, GovernedPanel } from '../motion';
import { ImplementationStatusBadge } from '../shared/ImplementationStatusBadge';
import {
  PILOT_BEACHHEAD,
  PILOT_PRODUCT_PATH,
  PILOT_READINESS_SECTIONS,
  type PilotChecklistItem,
  type PilotChecklistSection,
} from '../../data/pilotReadinessChecklist';
import { getClaim } from '../../data/implementationStatus';
import { usePilotChecklistProgress } from '../../hooks/usePilotChecklistProgress';
import { appRoutes } from '../../lib/appRoutes';
import { cn } from '../../lib/cn';

const HONESTY_CLAIMS = [
  getClaim('metadata_audit_trail'),
  getClaim('invite_only_access'),
  getClaim('sha256_anchor'),
  getClaim('operator_blind_e2e'),
] as const;

function formatUpdatedAt(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

function sectionProgress(
  section: PilotChecklistSection,
  isChecked: (id: string) => boolean,
): { done: number; total: number } {
  const checkable = section.items.filter((item) => item.checkable);
  const total = checkable.length;
  const done = checkable.filter((item) => isChecked(item.id)).length;
  return { done, total };
}

function ChecklistItemRow({
  item,
  checked,
  disabled,
  onToggle,
}: {
  item: PilotChecklistItem;
  checked: boolean;
  disabled: boolean;
  onToggle: (next: boolean) => void;
}) {
  if (!item.checkable) {
    return (
      <li
        className={cn(
          'rounded-[var(--sr-radius-lg)] bg-surface-elevated px-4 py-4 shadow-sr-sm md:px-5',
          item.kind === 'abort' && 'border-l-2 border-sem-warning/70',
          item.kind === 'deferred' && 'opacity-90',
        )}
      >
        <div className="flex gap-3">
          {item.kind === 'abort' ? (
            <span className="mt-0.5 shrink-0 font-mono text-[length:var(--text-label)] uppercase tracking-[0.1em] text-sem-warning">
              Stop
            </span>
          ) : (
            <Circle className="mt-0.5 size-3.5 shrink-0 text-ink-faint" aria-hidden />
          )}
          <div className="min-w-0">
            <p className="m-0 text-sm font-medium leading-snug text-ink">{item.label}</p>
            {item.detail ? (
              <p className="mt-1.5 mb-0 text-xs leading-relaxed text-ink-secondary">
                {item.detail}
              </p>
            ) : null}
          </div>
        </div>
      </li>
    );
  }

  const inputId = `pilot-check-${item.id}`;

  return (
    <li>
      <label
        htmlFor={inputId}
        className={cn(
          'flex min-h-[48px] cursor-pointer gap-3 rounded-[var(--sr-radius-lg)] bg-surface-elevated px-4 py-3.5 shadow-sr-sm transition-colors md:px-5',
          'hover:bg-surface-hover focus-within:ring-2 focus-within:ring-brand/35',
          checked && 'bg-brand-soft/40',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
          <input
            id={inputId}
            type="checkbox"
            className="peer absolute inset-0 size-full cursor-pointer opacity-0"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <span
            className={cn(
              'pointer-events-none flex size-5 items-center justify-center rounded-[var(--sr-radius-sm)] border border-line-strong bg-surface-sunken transition-colors',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40',
              checked && 'border-brand bg-brand text-brand-on',
            )}
            aria-hidden
          >
            {checked ? <Check className="size-3.5" strokeWidth={2.5} /> : null}
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block text-sm font-medium leading-snug text-ink',
              checked && 'text-ink-secondary',
            )}
          >
            {item.label}
          </span>
          {item.detail ? (
            <span className="mt-1.5 block text-xs leading-relaxed text-ink-secondary">
              {item.detail}
            </span>
          ) : null}
          {item.stopCondition ? (
            <span className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs leading-relaxed">
              <span className="font-mono text-[length:var(--text-label)] uppercase tracking-[0.1em] text-ink-faint">
                Stop if
              </span>
              <span className="text-ink-secondary">{item.stopCondition}</span>
            </span>
          ) : null}
          {item.href && item.hrefLabel ? (
            <Link
              to={item.href}
              className="mt-2.5 inline-flex min-h-[36px] items-center text-sm font-medium text-brand underline-offset-2 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {item.hrefLabel}
            </Link>
          ) : null}
        </span>
      </label>
    </li>
  );
}

function SectionBlock({
  section,
  index,
  ready,
  isChecked,
  setChecked,
}: {
  section: PilotChecklistSection;
  index: number;
  ready: boolean;
  isChecked: (id: string) => boolean;
  setChecked: (id: string, checked: boolean) => void;
}) {
  const { done, total } = sectionProgress(section, isChecked);
  const headingId = `pilot-section-${section.id}`;

  return (
    <GovernedPanel delay={Math.min(index * 0.03, 0.12)}>
      <section
        id={section.id}
        aria-labelledby={headingId}
        className={cn(
          'scroll-mt-24 rounded-[var(--sr-radius-xl)] bg-surface-elevated/70 p-5 shadow-sr-card md:p-7',
          section.tone === 'caution' && 'ring-1 ring-sem-warning/25',
          section.tone === 'deferred' && 'ring-1 ring-line',
        )}
      >
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-line/70 pb-4">
          <div className="min-w-0 max-w-2xl">
            <p className="m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.14em] text-brand/85">
              {section.eyebrow}
            </p>
            <h2 id={headingId} className="mt-2 m-0 text-lg font-semibold tracking-tight text-ink">
              {section.title}
            </h2>
            <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">
              {section.description}
            </p>
          </div>
          {total > 0 ? (
            <p
              className="m-0 shrink-0 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint"
              aria-label={`${done} of ${total} confirmed in ${section.title}`}
            >
              <ApprovalCount>
                {done}/{total}
              </ApprovalCount>{' '}
              confirmed
            </p>
          ) : section.tone === 'caution' ? (
            <p className="m-0 shrink-0 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-sem-warning">
              Review only
            </p>
          ) : (
            <p className="m-0 shrink-0 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
              Not blockers
            </p>
          )}
        </header>

        <ul className="m-0 flex list-none flex-col gap-2.5 p-0" aria-label={section.title}>
          {section.items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              checked={item.checkable ? isChecked(item.id) : false}
              disabled={!ready || !item.checkable}
              onToggle={(next) => setChecked(item.id, next)}
            />
          ))}
        </ul>
      </section>
    </GovernedPanel>
  );
}

/**
 * Structured v2 pilot checklist UI — local check-offs, abort criteria, deferred scope.
 */
export function PilotReadinessInstrument() {
  const { ready, checkedCount, totalCheckable, updatedAt, isChecked, setChecked, reset } =
    usePilotChecklistProgress();

  const pct = totalCheckable === 0 ? 0 : Math.round((checkedCount / totalCheckable) * 100);
  const updatedLabel = formatUpdatedAt(updatedAt);
  const allClear = ready && checkedCount === totalCheckable && totalCheckable > 0;

  return (
    <div className="flex flex-col gap-8" data-demo="pilot-readiness-instrument">
      <GovernedPanel>
        <aside
          className="rounded-[var(--sr-radius-xl)] bg-surface-elevated p-5 shadow-sr-card md:p-6"
          aria-labelledby="pilot-progress-heading"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                id="pilot-progress-heading"
                className="m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.14em] text-ink-faint"
              >
                Local readiness
              </p>
              <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">
                {ready ? (
                  allClear ? (
                    <>
                      All checkable items confirmed on this device. Re-verify stop conditions before
                      go-live — local marks are not a substitute for ops sign-off.
                    </>
                  ) : checkedCount === 0 ? (
                    <>
                      Mark items as you confirm them. Progress stays on this browser (
                      {PILOT_PRODUCT_PATH}).
                    </>
                  ) : (
                    <>
                      <ApprovalCount>{checkedCount}</ApprovalCount> of {totalCheckable} checkable
                      items confirmed. Beachhead: {PILOT_BEACHHEAD}.
                    </>
                  )
                ) : (
                  <>Loading saved check-offs…</>
                )}
              </p>
              {updatedLabel ? (
                <p className="mt-2 mb-0 font-mono text-[length:var(--text-label)] text-ink-faint">
                  Last updated {updatedLabel}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn-institutional btn-institutional--ghost min-h-[44px] text-sm"
                disabled={!ready || checkedCount === 0}
                onClick={() => reset()}
              >
                Clear check-offs
              </button>
              <Link
                to={appRoutes.sessionNew}
                className="btn-institutional btn-institutional--primary min-h-[44px] text-sm no-underline"
              >
                New session
              </Link>
            </div>
          </div>

          <div
            className="mt-5 h-1.5 overflow-hidden rounded-full bg-surface-sunken"
            role="progressbar"
            aria-valuenow={checkedCount}
            aria-valuemin={0}
            aria-valuemax={totalCheckable}
            aria-label="Pilot checklist progress"
            aria-busy={!ready}
          >
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-[var(--sr-duration-governed)] ease-[var(--sr-ease-governed)] motion-reduce:transition-none"
              style={{ width: ready ? `${pct}%` : '0%' }}
            />
          </div>
        </aside>
      </GovernedPanel>

      <nav aria-label="Checklist sections" className="overflow-x-auto">
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {PILOT_READINESS_SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={cn(
                  'inline-flex min-h-[36px] items-center rounded-[var(--sr-radius-sm)] border border-line px-2.5 py-1.5',
                  'font-mono text-[length:var(--text-label)] uppercase tracking-[0.1em] text-ink-secondary',
                  'transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                )}
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-6">
        {PILOT_READINESS_SECTIONS.map((section, index) => (
          <SectionBlock
            key={section.id}
            section={section}
            index={index}
            ready={ready}
            isChecked={isChecked}
            setChecked={setChecked}
          />
        ))}
      </div>

      <GovernedPanel delay={0.08}>
        <section
          className="rounded-[var(--sr-radius-xl)] bg-surface-elevated p-5 shadow-sr-card md:p-6"
          aria-labelledby="pilot-honesty-heading"
        >
          <p
            id="pilot-honesty-heading"
            className="m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.14em] text-ink-faint"
          >
            Implementation honesty
          </p>
          <p className="mt-2 mb-4 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            Status badges reflect the engineering registry — not pilot traction. Rooms remain
            operator-readable until a separate E2E program ships.
          </p>
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
            {HONESTY_CLAIMS.map((claim) => (
              <li
                key={claim.id}
                className="rounded-[var(--sr-radius-lg)] bg-surface-sunken/50 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="m-0 text-sm font-medium text-ink">{claim.label}</p>
                  <ImplementationStatusBadge status={claim.status} size="sm" />
                </div>
                <p className="mt-1.5 mb-0 text-xs leading-relaxed text-ink-secondary">
                  {claim.summary}
                </p>
                {claim.securityHref ? (
                  <Link
                    to={claim.securityHref}
                    className="mt-2 inline-flex text-xs font-medium text-brand underline-offset-2 hover:underline"
                  >
                    Details
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </GovernedPanel>

      <GovernedPanel delay={0.1}>
        <section
          className="rounded-[var(--sr-radius-xl)] bg-surface-elevated p-5 shadow-sr-card md:p-6"
          aria-labelledby="pilot-links-heading"
        >
          <p
            id="pilot-links-heading"
            className="m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.14em] text-ink-faint"
          >
            Operational surfaces
          </p>
          <p className="mt-2 mb-4 text-sm leading-relaxed text-ink-secondary">
            Deep links for the live path — not mock routes. Full prose checklist remains in{' '}
            <span className="font-mono text-xs text-ink-faint">
              docs/operations/v2-pilot-checklist.md
            </span>
            .
          </p>
          <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
            {(
              [
                { to: appRoutes.sessionNew, label: 'Configure — new session' },
                { to: appRoutes.sessions, label: 'Sessions list' },
                { to: appRoutes.participants, label: 'Participants index' },
                { to: appRoutes.releaseGate, label: 'Release gate' },
                { to: appRoutes.facilitator, label: 'Facilitator dashboard' },
                { to: appRoutes.appLedger, label: 'App ledger' },
                { to: '/security', label: 'Security boundaries' },
                { to: '/how-it-works', label: 'How it works' },
              ] as const
            ).map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-flex min-h-[40px] items-center text-sm font-medium text-brand underline-offset-2 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </GovernedPanel>
    </div>
  );
}
