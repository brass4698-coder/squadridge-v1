import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib';

type HealthStatus = 'idle' | 'loading' | 'ok' | 'error';

/**
 * Moderator connectivity check — live beacon + monospace telemetry (HUD-style).
 */
export function SupabaseHealthPage() {
  const [status, setStatus] = useState<HealthStatus>('idle');
  const [detail, setDetail] = useState<string>('');

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setStatus('error');
      setDetail('Missing VITE_SUPABASE_URL or public API key in .env');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    void (async () => {
      try {
        const { error } = await supabase.from('squads').select('id').limit(1);
        if (cancelled) return;
        if (error) {
          setStatus('error');
          setDetail(error.message);
          return;
        }
        setStatus('ok');
        setDetail('Connected · public.squads reachable');
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        setDetail(e instanceof Error ? e.message : 'Unknown error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const beaconStatus: HealthStatus =
    status === 'idle'
      ? 'loading'
      : status === 'loading'
        ? 'loading'
        : status === 'ok'
          ? 'ok'
          : 'error';

  return (
    <div className="space-y-md">
      <h1 className="font-heading text-fluid-h2 text-gray-light">Supabase connection</h1>
      <p className="text-fluid-body text-gray-light">
        Uses the canonical client from{' '}
        <code className="rounded bg-navy-dark px-sm py-xs font-mono text-[0.9em]">
          src/lib/supabase.ts
        </code>{' '}
        (quickstart-style{' '}
        <code className="rounded bg-navy-dark px-sm py-xs font-mono text-[0.9em]">
          import {'{'} supabase {'}'}
        </code>
        ).
      </p>

      <div className="vault-frost max-w-xl p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="security-beacon-dot" data-status={beaconStatus} aria-hidden />
          <span className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-teal/90">
            Live status
          </span>
        </div>
        <p
          className="mt-4 font-mono text-[0.8rem] leading-relaxed tracking-tight text-gray-light"
          role="status"
        >
          {status === 'loading' && <span className="text-orange-400/95">Polling datastore…</span>}
          {status === 'ok' && <span className="text-teal-light/95">{detail}</span>}
          {status === 'error' && (
            <>
              <span className="text-amber">ERR </span>
              <span className="text-gray-light/95">{detail}</span>
            </>
          )}
          {status === 'idle' && <span className="text-ink-muted">…</span>}
        </p>
      </div>

      <Link to="/" className="btn-primary inline-flex w-fit !rounded-[1.75rem]">
        Back home
      </Link>
    </div>
  );
}
