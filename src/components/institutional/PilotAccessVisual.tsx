import { InstitutionalVisualFrame } from './InstitutionalVisualFrame';

/**
 * Calm pilot-access visual — selective process, not growth-hacking urgency.
 */
export function PilotAccessVisual({ className = '' }: { className?: string }) {
  return (
    <InstitutionalVisualFrame
      ariaLabel="Pilot access process: application review, fit assessment, and considered onboarding"
      className={className}
      aspect="auto"
    >
      <div className="w-full max-w-sm space-y-4">
        {[
          { step: '01', label: 'Application received', state: 'Metadata only — no auto-approval' },
          { step: '02', label: 'Fit assessment', state: 'Manual review against use case' },
          { step: '03', label: 'Pilot onboarding', state: 'Facilitator setup + security briefing' },
        ].map((item) => (
          <div key={item.step} className="border-l-2 border-line-strong pl-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-faint">
              {item.step}
            </p>
            <p className="mt-1 text-sm font-medium text-ink">{item.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{item.state}</p>
          </div>
        ))}
        <p className="border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
          Early access is invite-oriented. We respond with an honest fit assessment — not a sales
          funnel.
        </p>
      </div>
    </InstitutionalVisualFrame>
  );
}
