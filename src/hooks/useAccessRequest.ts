import { useState } from 'react';
// TODO(supabase-types): switch back to `../lib/supabaseClient` once
// `supabaseTypes.ts` is regenerated to match supabase-js 2.103's typed
// Database contract. See RFC follow-up.
import { supabase } from '../lib/supabase';

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
