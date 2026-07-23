import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/env';
import type { OutcomeRecord, Session } from '../lib/supabaseTypes';

export type LedgerEntry = OutcomeRecord & {
  session: Pick<
    Session,
    'title' | 'conflict_type' | 'language' | 'outcome_public' | 'status'
  > | null;
};

export function useLedger(search = '') {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setEntries([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('outcome_records')
        .select('*, session:sessions!inner(title, conflict_type, language, outcome_public, status)')
        .eq('status', 'published')
        .eq('session.outcome_public', true)
        .eq('session.status', 'released')
        .order('published_at', { ascending: false });

      if (search.trim()) {
        query = query.ilike('summary', `%${search.trim()}%`);
      }

      const { data, error: qErr } = await query;
      if (qErr) {
        setError(qErr.message);
        setEntries([]);
      } else {
        setEntries((data as LedgerEntry[]) ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load ledger');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { entries, loading, error, refetch: fetch };
}

export function useLedgerRecord(outcomeId: string | undefined) {
  const [entry, setEntry] = useState<LedgerEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!outcomeId) {
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      setEntry(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const { data, error: qErr } = await supabase
          .from('outcome_records')
          .select(
            '*, session:sessions!inner(title, conflict_type, language, outcome_public, status)',
          )
          .eq('id', outcomeId)
          .eq('status', 'published')
          .eq('session.outcome_public', true)
          .eq('session.status', 'released')
          .single();

        if (cancelled) return;
        if (qErr) {
          setError(qErr.message);
          setEntry(null);
        } else {
          setEntry(data as LedgerEntry | null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load record');
          setEntry(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [outcomeId]);

  return { entry, loading, error };
}
