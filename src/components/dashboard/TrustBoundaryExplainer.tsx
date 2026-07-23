/**
 * Trust boundary explainer — room vs gate vs record visibility.
 */
export function TrustBoundaryExplainer({ className }: { className?: string }) {
  const stages = [
    {
      label: 'Inside the room',
      body: 'Verified parties and facilitators work in a private written session. Dialogue stays here.',
    },
    {
      label: 'At the gate',
      body: 'Only approved outcome text may leave the room — facilitator-governed, never automatic.',
    },
    {
      label: 'On the record',
      body: 'Outsiders can verify integrity of released outcomes without seeing the session itself.',
    },
  ] as const;

  return (
    <aside
      className={`rounded-lg border border-line bg-surface-sunken/50 p-5 ${className ?? ''}`}
      aria-labelledby="trust-boundary-h"
    >
      <h3 id="trust-boundary-h" className="m-0 font-display text-base font-medium text-ink">
        Privacy by boundary, not by broadcast
      </h3>
      <ol className="mt-4 m-0 list-none space-y-4 p-0">
        {stages.map((s, i) => (
          <li key={s.label} className="border-t border-line pt-3 first:border-0 first:pt-0">
            <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
              {String(i + 1).padStart(2, '0')} · {s.label}
            </p>
            <p className="mt-1 mb-0 text-sm leading-relaxed text-ink-secondary">{s.body}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 mb-0 text-xs leading-relaxed text-ink-faint">
        Boundaries over broadcast — see Security for documented limits.
      </p>
    </aside>
  );
}
