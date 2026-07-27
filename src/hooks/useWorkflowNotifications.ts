import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type WorkflowNotification = {
  id: string;
  session_id: string | null;
  event_type: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export function useWorkflowNotifications() {
  const { session } = useAuth();
  const [items, setItems] = useState<WorkflowNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!session) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from('workflow_notifications')
      .select('*')
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .limit(20);
    if (queryError) {
      setError('Could not load session alerts. Try refreshing.');
      setItems([]);
    } else {
      setError(null);
      setItems((data as WorkflowNotification[]) ?? []);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  useEffect(() => {
    if (!session) return;
    const channel = supabase
      .channel(`workflow-notifications:${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workflow_notifications',
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          void fetch();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, fetch]);

  async function markRead(id: string) {
    await supabase
      .from('workflow_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  return { items, loading, error, markRead, refetch: fetch };
}
