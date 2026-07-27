import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface VerificationRequestRow {
  id: string;
  participant_id: string;
  document_type: string | null;
  storage_path: string | null;
  submitted_at: string;
}

export function useVerificationRequests(participantIds: string[]) {
  const [rows, setRows] = useState<VerificationRequestRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRows = useCallback(async () => {
    if (participantIds.length === 0) {
      setRows([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('verification_requests')
      .select('id, participant_id, document_type, storage_path, submitted_at')
      .in('participant_id', participantIds)
      .order('submitted_at', { ascending: false });
    if (!error && data) {
      setRows(data as VerificationRequestRow[]);
    }
    setLoading(false);
  }, [participantIds]);

  useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  function latestForParticipant(participantId: string): VerificationRequestRow | undefined {
    return rows.find((r) => r.participant_id === participantId);
  }

  async function openDocument(storagePath: string): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from('participant-verification')
      .createSignedUrl(storagePath, 300);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  }

  return { rows, loading, latestForParticipant, openDocument, refetch: fetchRows };
}
