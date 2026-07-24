import { useParams, useSearchParams } from 'react-router-dom';

/**
 * Participant invite token from path (`/p/.../:token`) with query fallback for
 * legacy links (`?token=`). Prefer path tokens going forward.
 */
export function useParticipantToken(fallback = 'demo-token'): string {
  const { token: pathToken } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const queryToken = searchParams.get('token');
  return (pathToken || queryToken || fallback).trim() || fallback;
}
