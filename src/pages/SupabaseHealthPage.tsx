import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { runHealthProbes, type ProbeResult } from '../lib/health/probes';

/**
 * Moderator health suite — auth, DB, realtime, critical tables (metadata only).
 */
export function SupabaseHealthPage() {
  const [probes, setProbes] = useState<ProbeResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const results = await runHealthProbes();
      if (!cancelled) {
        setProbes(results);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allOk = probes.length > 0 && probes.every((p) => p.ok);

  return (
    <div className="space-y-md" data-testid="health-probes">
      <h1 className="font-heading text-fluid-h2 text-gray-light">Platform health</h1>
      <p className="text-fluid-body text-gray-light">
        Probe suite for auth, database, realtime, and critical tables. Results are metadata only —
        never include dialogue bodies or PII.
      </p>

      <div className="vault-frost max-w-2xl p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="security-beacon-dot"
            data-status={loading ? 'loading' : allOk ? 'ok' : 'error'}
            aria-hidden
          />
          <span className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-teal/90">
            Live status
          </span>
        </div>

        {loading ? (
          <p className="mt-4 font-mono text-[0.8rem] text-orange-400/95" role="status">
            Running probes…
          </p>
        ) : (
          <ul className="mt-4 space-y-3" role="list">
            {probes.map((p) => (
              <li key={p.id} className="font-mono text-[0.8rem] leading-relaxed tracking-tight">
                <span className={p.ok ? 'text-teal-light/95' : 'text-amber'}>
                  {p.ok ? 'OK' : 'ERR'}
                </span>{' '}
                <span className="text-gray-light/95">
                  {p.label} · {p.detail} · {p.ms}ms
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-fluid-sm text-gray-light/80">
        Ops alerts (email/Slack) should consume these probe ids only — never attach message content.
      </p>

      <Link to="/" className="btn-primary inline-flex w-fit !rounded-[1.75rem]">
        Back home
      </Link>
    </div>
  );
}
