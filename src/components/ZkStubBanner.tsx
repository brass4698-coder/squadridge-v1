import { useCallback, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { isZkHashStubExplicit } from '../lib';

const STORAGE_KEY = 'mendguild.zkStubToast.dismissed';

function readDismissedFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Shown when `VITE_ZK_STUB=true`: verification uses a hash demo, not Semaphore + Edge verification.
 * Dismissible terminal-style toast (session-scoped). Production builds must not ship with this flag.
 */
export function ZkStubBanner() {
  const [dismissed, setDismissed] = useState(readDismissedFromStorage);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore quota / private mode */
    }
    setDismissed(true);
  }, []);

  if (!isZkHashStubExplicit()) return null;
  if (dismissed) return null;

  return (
    <div
      className="zk-stub-toast pointer-events-none fixed left-3 right-3 top-[4.75rem] z-[60] sm:left-auto sm:right-4 sm:max-w-[26rem]"
      aria-live="polite"
    >
      <div
        role="alert"
        className="pointer-events-auto overflow-hidden rounded-md border border-amber/45 bg-[#070a0f]/95 font-mono text-[0.8rem] leading-snug text-[#e7d5b8] shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_0_1px_rgba(245,166,35,0.12)] backdrop-blur-md"
      >
        <div className="flex items-center justify-between gap-2 border-b border-amber/25 bg-[#0c1018]/90 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#fde68a]/95">
          <span className="flex min-w-0 items-center gap-2">
            <span className="text-amber/80" aria-hidden>
              ▸
            </span>
            <span className="truncate">sys · zk_stub · dev</span>
          </span>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded border border-transparent text-[#fcd9a8]/80 transition-colors hover:border-amber/35 hover:bg-amber/10 hover:text-[#fef3c7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            aria-label="Dismiss ZK stub notice"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="flex gap-2.5 px-3 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
          <p className="min-w-0 flex-1 text-[0.78rem] leading-relaxed text-[#fcd9a8]">
            <span className="block font-semibold uppercase tracking-[0.08em] text-[#fde68a]">
              Hash-only demo path
            </span>
            <span className="mt-1.5 block text-[0.76rem] font-normal text-[#e7d5b8]/95">
              Not Semaphore + Edge verification. Set{' '}
              <code className="whitespace-nowrap rounded bg-black/40 px-1 py-0.5 text-[0.72rem] text-[#fde68a]">
                VITE_ZK_STUB=false
              </code>{' '}
              and ship{' '}
              <code className="whitespace-nowrap rounded bg-black/40 px-1 py-0.5 text-[0.72rem] text-[#fde68a]">
                verify-zk-proof
              </code>
              .
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
