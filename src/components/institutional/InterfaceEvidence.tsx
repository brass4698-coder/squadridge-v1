import { StatusChip } from './StatusChip';

export function InterfaceEvidence() {
  return (
    <div className="overflow-hidden border border-line bg-surface-sunken">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-elevated px-5 py-3">
        <p className="font-mono text-xs text-ink-faint">Session control · Live</p>
        <div className="flex flex-wrap gap-2">
          <StatusChip label="Verified ×4" variant="verified" />
          <StatusChip label="Live" variant="released" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2">
        <div className="border-b border-line p-5 lg:border-b-0 lg:border-r">
          <p className="section-label mb-3">Facilitator panel</p>
          <div className="space-y-2">
            {['Open room', 'Pause session', 'End & draft outcome'].map((action) => (
              <div
                key={action}
                className="border border-line bg-surface-elevated px-3 py-2 text-xs text-ink-secondary"
              >
                {action}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink-faint">
            Process authority remains with the facilitator. Approvals are recorded before release.
          </p>
        </div>

        <div className="p-5">
          <p className="section-label mb-3">Release preview</p>
          <div className="border border-line bg-surface-elevated p-4">
            <p className="text-xs font-semibold text-ink">Outcome record — pending release</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
              Summary drafted by facilitator. No room transcript included.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-xs">
              <div>
                <dt className="text-ink-faint">Approvals</dt>
                <dd className="mt-0.5 font-mono text-ink">3 / 3</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Anchor</dt>
                <dd className="mt-0.5 font-mono text-ink">Pending</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
