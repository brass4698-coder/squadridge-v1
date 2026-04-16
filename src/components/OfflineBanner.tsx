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
      className="sticky top-0 z-[60] flex items-center justify-center gap-2 border-b border-[#5c4a1f] bg-[#2a2210] px-md py-2.5 text-center font-sans text-[0.85rem] leading-snug text-[#f5d78e]"
    >
      <WifiOff className="size-4 shrink-0 opacity-90" aria-hidden />
      <span>You are offline. Messaging and sign-in need a connection when they resume.</span>
    </div>
  );
}
