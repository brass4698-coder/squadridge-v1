import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DEV_PARTICIPANT_DEMO_TOKEN } from '../lib/participantDemo';

/**
 * Reads the participant invite token from the URL path (`/p/:step/:token`).
 * Redirects to `/p/invalid` when the token is missing outside dev builds.
 */
export function useParticipantToken(): string {
  const { token: raw } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const token = raw?.trim() ?? '';

  useEffect(() => {
    if (token) return;
    if (import.meta.env.DEV) return;
    navigate('/p/invalid', { replace: true });
  }, [token, navigate]);

  if (token) return token;
  if (import.meta.env.DEV) return DEV_PARTICIPANT_DEMO_TOKEN;
  return '';
}
