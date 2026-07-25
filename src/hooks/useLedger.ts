import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/env';
import type { OutcomeRecordClient, Session } from '../lib/supabaseTypes';

export type LedgerEntry = OutcomeRecordClient & {
  session: Pick<
    Session,
    'title' | 'conflict_type' | 'language' | 'outcome_public' | 'status'
  > | null;
};

/**
 * Public ledger reads name their columns: `facilitator_notes` is not granted to API
 * roles, and `select *` would be refused. See the release-provenance migration.
 */
const LEDGER_SELECT =
  'id, session_id, summary, agreed_terms, pending_items, status, published_at, ledger_sha, ' +
  'timestamp_status, authorship_attested_at, authorship_statement, created_at, updated_at, ' +
  'session:sessions!inner(title, conflict_type, language, outcome_public, status)';

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
        .select(LEDGER_SELECT)
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
        setEntries((data as unknown as LedgerEntry[]) ?? []);
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
          .select(LEDGER_SELECT)
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
          setEntry(data as unknown as LedgerEntry | null);
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
