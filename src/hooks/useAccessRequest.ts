import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AccessRequestPayload {
  full_name: string;
  organisation?: string;
  email: string;
  use_case: string;
  description: string;
}

export function useAccessRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function submit(payload: AccessRequestPayload) {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.from('access_requests').insert(payload);
    if (err) {
      setError(err.message);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  return { submit, loading, error, submitted };
}
