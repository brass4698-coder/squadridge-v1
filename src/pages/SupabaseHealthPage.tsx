import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isSupabaseConfigured } from '../lib';
import { supabase } from '../utils/supabase';

/**
 * Minimal “query data” check using `utils/supabase` (tutorial import path).
 * Uses `squads` — this project has no `todos` table.
 */
export function SupabaseHealthPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
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
        setDetail('Connected. Queried public.squads successfully.');
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

  return (
    <div className="space-y-md">
      <h1 className="font-heading text-fluid-h2 text-gray-light">Supabase connection</h1>
      <p className="text-fluid-body text-gray-light">
        Uses <code className="rounded bg-navy-dark px-sm py-xs">src/utils/supabase.ts</code>{' '}
        (quickstart-style{' '}
        <code className="rounded bg-navy-dark px-sm py-xs">
          import {'{'} supabase {'}'}
        </code>
        ).
      </p>
      <p className="text-fluid-small text-gray-light" role="status">
        {status === 'loading' && 'Checking…'}
        {status === 'ok' && detail}
        {status === 'error' && (
          <>
            <span className="text-amber">Error: </span>
            {detail}
          </>
        )}
        {status === 'idle' && '…'}
      </p>
      <Link to="/" className="btn-primary inline-flex w-fit">
        Back home
      </Link>
    </div>
  );
}
