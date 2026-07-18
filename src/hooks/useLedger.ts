import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { OutcomeRecord, Session } from '../lib/supabaseTypes';

export type LedgerEntry = OutcomeRecord & {
  session: Pick<Session, 'title' | 'conflict_type' | 'language'> | null;
};

export function useLedger(search = '') {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('outcome_records')
      .select('*, session:sessions(title, conflict_type, language)')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (search.trim()) {
      query = query.ilike('summary', `%${search.trim()}%`);
    }

    const { data } = await query;
    setEntries((data as LedgerEntry[]) ?? []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { entries, loading, refetch: fetch };
}

export function useLedgerRecord(outcomeId: string | undefined) {
  const [entry, setEntry] = useState<LedgerEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!outcomeId) return;
    supabase
      .from('outcome_records')
      .select('*, session:sessions(title, conflict_type, language)')
      .eq('id', outcomeId)
      .eq('status', 'published')
      .single()
      .then(({ data }) => {
        setEntry(data as LedgerEntry | null);
        setLoading(false);
      });
  }, [outcomeId]);

  return { entry, loading };
}
