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
 * Public ledger list columns. Keep this to fields that exist on both pre- and
 * post-provenance schemas — requesting `timestamp_*` / `authorship_*` against an
 * unmigrated project returns 400 and falsely surfaces as a load error.
 * `facilitator_notes` must never be selected (revoked after provenance migration).
 */
const LEDGER_SELECT =
  'id, session_id, summary, agreed_terms, pending_items, status, published_at, ledger_sha, ' +
  'created_at, updated_at, ' +
  'session:sessions!inner(title, conflict_type, language, outcome_public, status)';

function ledgerFetchErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = String((err as { message?: unknown }).message ?? '');
    if (/failed to fetch|networkerror|load failed|fetch/i.test(msg)) {
      return 'Could not reach the ledger service. Check your connection and try again.';
    }
    if (msg.trim()) return msg;
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return 'Could not load published records.';
}

export function useLedger(search = '') {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      // Honest empty register — specimens still render; not a fetch failure.
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
        setError(ledgerFetchErrorMessage(qErr));
        setEntries([]);
      } else {
        setEntries((data as unknown as LedgerEntry[]) ?? []);
        setError(null);
      }
    } catch (e) {
      setError(ledgerFetchErrorMessage(e));
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
          .maybeSingle();

        if (cancelled) return;
        if (qErr) {
          setError(ledgerFetchErrorMessage(qErr));
          setEntry(null);
        } else {
          setEntry((data as unknown as LedgerEntry | null) ?? null);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(ledgerFetchErrorMessage(e));
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
