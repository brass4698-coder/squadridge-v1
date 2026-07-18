import { useMemo, useState } from 'react';
import { useSessionResolutions } from '../../hooks/useSessionResolutions';
import {
  formatResolutionShortlistForOutcome,
  parseSessionSetupConfig,
} from '../../lib/sessionResolutions';

interface SessionResolutionPanelProps {
  sessionId: string;
  setupConfig: unknown;
  roomActive: boolean;
  onShortlistReady?: (formatted: string) => void;
}

export function SessionResolutionPanel({
  sessionId,
  setupConfig,
  roomActive,
  onShortlistReady,
}: SessionResolutionPanelProps) {
  const config = parseSessionSetupConfig(setupConfig);
  const suggested = config.suggestedProposals ?? [];
  const {
    items,
    loading,
    error,
    createItem,
    createMany,
    shortlistItem,
    removeFromShortlist,
    archiveItem,
  } = useSessionResolutions(sessionId);

  const [title, setTitle] = useState('');
  const [ownerOrg, setOwnerOrg] = useState('');
  const [targetDays, setTargetDays] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const shortlistedCount = useMemo(
    () => items.filter((i) => i.status === 'shortlisted').length,
    [items],
  );

  const nextRank = shortlistedCount + 1;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setActionError(null);
    try {
      await createItem({
        title,
        description,
        owner_org: ownerOrg || undefined,
        target_days: targetDays ? Number(targetDays) : undefined,
        proposed_by_label: 'Facilitator',
      });
      setTitle('');
      setOwnerOrg('');
      setTargetDays('');
      setDescription('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not add intervention');
    }
    setBusy(false);
  }

  async function loadSuggested() {
    if (suggested.length === 0) return;
    setBusy(true);
    setActionError(null);
    try {
      await createMany(suggested);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not load template interventions');
    }
    setBusy(false);
  }

  async function handleShortlist(itemId: string) {
    setBusy(true);
    setActionError(null);
    try {
      await shortlistItem(itemId, nextRank);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not shortlist');
    }
    setBusy(false);
  }

  function handleCopyToOutcome() {
    const formatted = formatResolutionShortlistForOutcome(items);
    if (formatted && onShortlistReady) onShortlistReady(formatted);
  }

  return (
    <section
      aria-labelledby="session-resolutions-heading"
      className="mt-6 rounded-lg border border-line bg-surface-elevated"
    >
      <div className="border-b border-line px-5 py-4">
        <h2
          id="session-resolutions-heading"
          className="text-xs font-semibold uppercase tracking-widest text-ink-secondary"
        >
          Intervention proposals
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Collect proposed actions, tally participant support, and rank a shortlist for the action
          commitments record.
        </p>
      </div>

      <div className="flex flex-col gap-4 p-5">
        {loading ? (
          <p className="text-sm text-ink-secondary" role="status">
            Loading proposals…
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-sem-danger" role="alert">
            {error}
          </p>
        ) : null}
        {actionError ? (
          <p className="text-sm text-sem-danger" role="alert">
            {actionError}
          </p>
        ) : null}

        {items.length === 0 && suggested.length > 0 ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void loadSuggested()}
            className="rounded border border-line px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-surface-sunken disabled:opacity-50"
          >
            Load template starter interventions ({suggested.length})
          </button>
        ) : null}

        {items.length === 0 && !loading ? (
          <p className="text-sm text-ink-faint">
            No interventions yet. Add proposals below or load template starters when configured.
          </p>
        ) : null}

        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id} className="rounded border border-line bg-surface px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">
                    {item.status === 'shortlisted' && item.rank_order ? (
                      <span className="mr-2 font-mono text-xs text-brand">#{item.rank_order}</span>
                    ) : null}
                    {item.title}
                  </p>
                  {item.description ? (
                    <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                      {item.description}
                    </p>
                  ) : null}
                  <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-wide text-ink-faint">
                    {item.owner_org ? `${item.owner_org}` : 'Owner TBD'}
                    {item.target_days ? ` · ${item.target_days} days` : ''}
                    {` · ${item.support_count} support${item.support_count === 1 ? '' : 's'}`}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {item.status === 'proposed' ? (
                    <button
                      type="button"
                      disabled={busy || !roomActive}
                      onClick={() => void handleShortlist(item.id)}
                      className="rounded border border-line px-3 py-1.5 text-xs font-medium text-ink disabled:opacity-40"
                    >
                      Shortlist #{nextRank}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void removeFromShortlist(item.id)}
                      className="rounded border border-line px-3 py-1.5 text-xs text-ink-secondary disabled:opacity-40"
                    >
                      Unrank
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void archiveItem(item.id)}
                    className="rounded px-3 py-1.5 text-xs text-ink-faint hover:text-sem-danger disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {roomActive ? (
          <form
            onSubmit={(e) => void handleAdd(e)}
            className="flex flex-col gap-3 border-t border-line pt-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
              Add intervention
            </p>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Intervention title"
              className="rounded border border-line bg-surface px-3 py-2 text-sm text-ink"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={ownerOrg}
                onChange={(e) => setOwnerOrg(e.target.value)}
                placeholder="Lead organization (optional)"
                className="rounded border border-line bg-surface px-3 py-2 text-sm text-ink"
              />
              <input
                type="number"
                min={1}
                value={targetDays}
                onChange={(e) => setTargetDays(e.target.value)}
                placeholder="Target days (optional)"
                className="rounded border border-line bg-surface px-3 py-2 text-sm text-ink"
              />
            </div>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope or notes (optional, stays in room metadata)"
              className="resize-none rounded border border-line bg-surface px-3 py-2 text-sm text-ink"
            />
            <button
              type="submit"
              disabled={busy || !title.trim()}
              className="self-start rounded border border-line px-4 py-2 text-sm font-medium text-ink disabled:opacity-40"
            >
              Add proposal
            </button>
          </form>
        ) : (
          <p className="border-t border-line pt-4 text-xs text-ink-faint">
            Session ended — finalize the shortlist, then copy commitments to the outcome workspace.
          </p>
        )}

        {items.length > 0 && onShortlistReady ? (
          <button
            type="button"
            disabled={busy}
            onClick={handleCopyToOutcome}
            className="btn-pill btn-pill--primary text-sm disabled:opacity-40"
          >
            Copy ranked commitments to outcome draft
          </button>
        ) : null}
      </div>
    </section>
  );
}
