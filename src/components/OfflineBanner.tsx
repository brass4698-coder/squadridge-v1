import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

/**
 * Best-effort offline indicator (`navigator.onLine`). Shown above main chrome when the browser reports no network.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-[60] flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-b border-[#5c4a1f] bg-[#2a2210] px-md py-2.5 text-center font-sans text-[0.85rem] leading-snug text-[#f5d78e]"
    >
      <WifiOff className="size-4 shrink-0 opacity-90" aria-hidden />
      <span>Offline – waiting to reconnect. Messaging and sign-in resume when your connection does.</span>
      <button
        type="button"
        className="inline-flex min-h-[36px] shrink-0 items-center justify-center rounded-[6px] border border-[#6b5a2a] bg-[#3d3318] px-3 py-1.5 font-heading text-[0.8rem] font-semibold text-[#f5d78e] transition-opacity hover:opacity-90"
        onClick={() => window.location.reload()}
      >
        Refresh now
      </button>
    </div>
  );
}
