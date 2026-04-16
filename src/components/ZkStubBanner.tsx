import { AlertTriangle } from 'lucide-react';
import { isZkHashStubExplicit } from '../lib/env';

/**
 * Shown when `VITE_ZK_STUB=true`: verification uses a hash demo, not Semaphore + Edge verification.
 * Production builds must not ship with this flag (see vite.config.ts).
 */
export function ZkStubBanner() {
  if (!isZkHashStubExplicit()) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-[70] border-b border-amber/50 bg-[#2a1810] px-md py-2.5 font-sans text-[0.85rem] leading-snug text-[#fcd9a8]"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-start gap-2">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
        <p className="min-w-0 flex-1">
          <strong className="font-semibold text-[#fde68a]">ZK stub mode:</strong> verification is a fast hash-only demo, not
          a Semaphore zero-knowledge proof. Do not use for real users or partner demos. Set{' '}
          <code className="rounded bg-black/30 px-1 py-0.5 font-mono text-[0.8rem]">VITE_ZK_STUB=false</code> and deploy
          the <code className="rounded bg-black/30 px-1 py-0.5 font-mono text-[0.8rem]">verify-zk-proof</code> Edge
          Function.
        </p>
      </div>
    </div>
  );
}
