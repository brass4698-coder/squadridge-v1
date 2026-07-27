import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/env';
import { classifyClientError } from '../lib/appErrors';

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

    if (!isSupabaseConfigured()) {
      setError(
        'Pilot intake is temporarily unavailable. Email contact via /contact, or try again later.',
      );
      setLoading(false);
      return;
    }

    try {
      const { data, error: err } = await supabase.rpc('submit_access_request', {
        p_full_name: payload.full_name,
        p_email: payload.email,
        p_use_case: payload.use_case,
        p_description: payload.description,
        p_organisation: payload.organisation ?? null,
      });
      if (err) {
        setError(classifyClientError(err).userMessage);
      } else {
        const result = data as { ok?: boolean; error?: string };
        if (!result?.ok) {
          const msg =
            result?.error === 'RATE_LIMIT'
              ? 'Too many requests from this email. Try again in an hour.'
              : (result?.error ?? 'Submission failed');
          setError(msg);
        } else {
          setSubmitted(true);
        }
      }
    } catch (e) {
      setError(classifyClientError(e).userMessage);
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error, submitted, configured: isSupabaseConfigured() };
}
