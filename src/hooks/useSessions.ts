import { useEffect, useState, useCallback } from 'react';
// TODO(supabase-types): see useAccessRequest.
import { supabase } from '../lib/supabase';
import type { Session, SessionInsert } from '../lib/supabaseTypes';
import {
  clampMaxParticipants,
  DEFAULT_MAX_PARTICIPANTS,
  MAX_ROOM_PARTICIPANTS,
} from '../lib/roomCapacity';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setSessions((data ?? []) as Session[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  async function createSession(payload: Omit<SessionInsert, 'facilitator_id'>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const maxParticipants = clampMaxParticipants(
      payload.max_participants,
      DEFAULT_MAX_PARTICIPANTS,
    );
    const { data, error: err } = await supabase
      .from('sessions')
      .insert({ ...payload, max_participants: maxParticipants, facilitator_id: user.id })
      .select()
      .single();
    if (err) {
      if ((err.message ?? '').includes('max_participants')) {
        throw new Error(`Maximum participants must be between 2 and ${MAX_ROOM_PARTICIPANTS}.`);
      }
      throw err;
    }
    const row = data as Session;
    setSessions((prev) => [row, ...prev]);
    return row;
  }

  async function updateSessionStatus(id: string, status: Session['status']) {
    if (status === 'released') {
      throw new Error('Session release must use the outcome release flow.');
    }
    const { data, error: err } = await supabase.rpc('transition_session_status', {
      p_session_id: id,
      p_status: status,
    });
    if (err) throw err;
    const result = data as { ok?: boolean; error?: string; status?: Session['status'] };
    if (!result?.ok) {
      throw new Error(result?.error ?? 'Status transition blocked');
    }
    const nextStatus = result.status ?? status;
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s)));
  }

  return { sessions, loading, error, createSession, updateSessionStatus, refetch: fetchSessions };
}

export function useSession(sessionId: string | undefined) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setSession(data);
        setLoading(false);
      });
  }, [sessionId]);

  return { session, loading, error };
}
