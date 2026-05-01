import { useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { StatusDot } from '../ui/StatusDot';
import { publicShellInnerClass } from './publicShell';

/**
 * SystemStatusStrip — thin chrome strip below the app header on operational
 * surfaces that expose runtime state (moderation live, queue lag, last sync).
 * Public marketing and institutional pages should not mount this chrome.
 *
 * Phase 1 reads from a fixture so investors can see the surface; phase 3
 * wires this to a real heartbeat (Supabase + edge function uptime).
 */

const OPERATIONAL_PREFIXES = [
  '/find-squad',
  '/intent',
  '/match',
  '/session',
  '/settings',
  '/admin',
  '/mod',
  '/verify',
  '/insights/dashboard',
] as const;

export function SystemStatusStrip() {
  const { pathname } = useLocation();
  if (!OPERATIONAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }

  return (
    <div className="border-b border-line-divider bg-surface-sunken/80">
      <div
        className={twMerge(
          publicShellInnerClass,
          'flex flex-wrap items-center gap-x-6 gap-y-1.5 py-1.5 text-[0.72rem]',
        )}
      >
        <StatusDot state="live" srLabel="Moderation coverage active">
          Moderation live
        </StatusDot>
        <StatusDot state="live" srLabel="Realtime channel healthy">
          Realtime sync
        </StatusDot>
        <StatusDot state="stale" srLabel="Verification queue 4-minute lag">
          Verify queue 4m
        </StatusDot>
        <span className="ml-auto font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-subtle">
          Last sync just now
        </span>
      </div>
    </div>
  );
}
