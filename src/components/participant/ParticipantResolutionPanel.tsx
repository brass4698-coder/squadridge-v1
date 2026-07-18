import { useState } from 'react';
import { useParticipantResolutions } from '../../hooks/useParticipantResolutions';

export function ParticipantResolutionPanel({ token }: { token: string }) {
  const { items, loading, error, supportItem } = useParticipantResolutions(token);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading) {
    return (
      <div
        className="border-b px-6 py-3 text-xs"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        role="status"
      >
        Loading intervention proposals…
      </div>
    );
  }

  if (items.length === 0) return null;

  async function handleSupport(itemId: string) {
    setBusyId(itemId);
    setActionError(null);
    const result = await supportItem(itemId);
    if (!result.ok) setActionError(result.error);
    setBusyId(null);
  }

  return (
    <aside
      className="border-b px-6 py-4"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      aria-labelledby="participant-resolutions-heading"
    >
      <h2
        id="participant-resolutions-heading"
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Proposed interventions
      </h2>
      <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        Support the actions your organization can stand behind. Support counts are visible to the
        facilitator only — not attribution on the public record.
      </p>
      {actionError ? (
        <p className="mt-2 text-xs text-sem-danger" role="alert">
          {actionError}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-xs text-sem-danger" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded border px-3 py-2.5"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p className="text-sm font-medium text-ink">{item.title}</p>
            {item.description ? (
              <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{item.description}</p>
            ) : null}
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs text-ink-faint">
                {item.owner_org ?? 'Lead org TBD'}
                {item.target_days ? ` · ${item.target_days} days` : ''}
              </span>
              <button
                type="button"
                disabled={item.supported || busyId === item.id}
                onClick={() => void handleSupport(item.id)}
                className="rounded border px-3 py-1 text-xs font-medium disabled:opacity-40"
                style={{
                  borderColor: item.supported ? 'var(--color-accent)' : 'var(--color-border)',
                  color: item.supported ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }}
              >
                {item.supported ? 'Supported' : 'Support'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
