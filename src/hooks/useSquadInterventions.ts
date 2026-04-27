import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib';

type Row = Database['public']['Tables']['interventions']['Row'];

/**
 * Recent AI/human intervention rows for a squad (members can read; drives banner in session).
 */
export function useSquadInterventions(
  supabase: SupabaseClient<Database> | null,
  squadId: string | undefined,
) {
  const queryClient = useQueryClient();
  const q = useQuery({
    queryKey: ['interventions', squadId],
    queryFn: async (): Promise<Row[]> => {
      if (!supabase || !squadId) return [];
      const { data, error } = await supabase
        .from('interventions')
        .select('id, intervention_type, triggered_at')
        .eq('squad_id', squadId)
        .order('triggered_at', { ascending: false })
        .limit(5);
      if (error) throw new Error(error.message);
      return (data ?? []) as Row[];
    },
    enabled: !!supabase && !!squadId,
  });

  useEffect(() => {
    if (!supabase || !squadId) return;
    const ch = supabase
      .channel(`interventions:${squadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interventions',
          filter: `squad_id=eq.${squadId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['interventions', squadId] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [supabase, squadId, queryClient]);

  return q;
}
