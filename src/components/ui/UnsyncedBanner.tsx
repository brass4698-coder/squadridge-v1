import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface UnsyncedBannerProps {
  /** When true, show an “unsynced” state even if the browser reports online (e.g. realtime channel down). */
  realtimeUnsynced?: boolean;
  className?: string;
}

/**
 * Calm reconnect / unsynced strip for v2 rooms and control surfaces.
 * Metadata-only copy — never implies message bodies were lost to a third party.
 */
export function UnsyncedBanner({ realtimeUnsynced = false, className = '' }: UnsyncedBannerProps) {
  const online = useOnlineStatus();
  if (online && !realtimeUnsynced) return null;

  const offline = !online;
  const message = offline
    ? 'Connection paused. You can keep reading. Sending resumes when you reconnect — unsent drafts stay on this device until then.'
    : 'Live updates are catching up. Refresh if this banner stays, or wait — we will resync automatically.';

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="unsynced-banner"
      className={`border-b px-4 py-2.5 text-center text-sm ${className}`}
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-pending-strip)',
        color: 'var(--color-warning, #92710a)',
      }}
    >
      <span>{message}</span>
      {offline ? (
        <button
          type="button"
          className="ml-3 underline-offset-2 hover:underline"
          style={{ color: 'inherit' }}
          onClick={() => window.location.reload()}
        >
          Refresh now
        </button>
      ) : null}
    </div>
  );
}
