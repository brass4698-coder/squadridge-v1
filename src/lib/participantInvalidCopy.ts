// Copy for participant invite token validation failures (v2 participant path).

export type ParticipantTokenError = 'NOT_FOUND' | 'INVALID_TOKEN' | 'EXPIRED' | 'DECLINED' | string;

export interface ParticipantInvalidCopy {
  error: ParticipantTokenError;
  title: string;
  body: string;
  primaryAction: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
}

const NOT_FOUND: ParticipantInvalidCopy = {
  error: 'NOT_FOUND',
  title: 'Invitation link not found',
  body: 'Double-check the link you were sent, or ask your facilitator to generate a new one.',
  primaryAction: { label: 'Request access', href: '/request-access' },
  secondaryAction: { label: 'Back to SquadRidge', href: '/' },
};

const EXPIRED: ParticipantInvalidCopy = {
  error: 'EXPIRED',
  title: 'Invitation expired',
  body: 'This invitation is past its expiry window. Ask your facilitator to send a fresh link — invitations typically last 72 hours.',
  primaryAction: { label: 'Request access', href: '/request-access' },
  secondaryAction: { label: 'Back to SquadRidge', href: '/' },
};

const DECLINED: ParticipantInvalidCopy = {
  error: 'DECLINED',
  title: 'Invitation no longer available',
  body: 'Your participation request was declined by the facilitator. Contact them if you believe this is an error.',
  primaryAction: { label: 'Request access', href: '/request-access' },
  secondaryAction: { label: 'Back to SquadRidge', href: '/' },
};

/** Deterministic mapping from participant token RPC `error` to user-facing copy. */
export function copyForParticipantTokenError(
  error: ParticipantTokenError | undefined,
): ParticipantInvalidCopy {
  switch (error) {
    case 'EXPIRED':
      return EXPIRED;
    case 'DECLINED':
      return DECLINED;
    case 'NOT_FOUND':
    case 'INVALID_TOKEN':
    default:
      return NOT_FOUND;
  }
}
