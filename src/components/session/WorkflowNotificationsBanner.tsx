import { useWorkflowNotifications } from '../../hooks/useWorkflowNotifications';

export function WorkflowNotificationsBanner() {
  const { items, loading, error, markRead, refetch } = useWorkflowNotifications();

  if (loading) return null;

  if (error) {
    return (
      <div
        className="mb-6 rounded-lg border border-line bg-surface-elevated px-4 py-3 text-sm text-ink-secondary"
        role="status"
      >
        <p>{error}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-2 text-xs font-medium text-brand underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-2">
      {items.slice(0, 5).map((item) => (
        <div
          key={item.id}
          className="flex items-start justify-between gap-4 rounded-lg border border-brand/25 bg-brand-soft px-4 py-3 text-sm"
        >
          <div>
            <p className="font-medium text-ink">{item.title}</p>
            <p className="mt-0.5 text-ink-secondary">{item.body}</p>
          </div>
          <button
            type="button"
            onClick={() => void markRead(item.id)}
            className="shrink-0 text-xs font-medium text-brand underline"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
