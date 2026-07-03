// ============================================================
// Copy for invite validation failure states
//
// Kept in a separate module so it can be unit-tested in isolation and reused
// by both InviteAcceptancePage (inline error UI) and any future
// InviteStatusCard style rendering.
// ============================================================
import type { InviteValidationResult } from '../types/invites';

export interface InviteInvalidCopy {
  reason: NonNullable<InviteValidationResult['reason']>;
  title: string;
  body: string;
  primaryAction: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
}

const NOT_FOUND: InviteInvalidCopy = {
  reason: 'not_found',
  title: 'Invitation link not found',
  body: 'Double-check the link you were sent, or request a new invitation from your facilitator.',
  primaryAction: { label: 'Request access', href: '/request-access' },
  secondaryAction: { label: 'Back to SquadRidge', href: '/' },
};

const REVOKED: InviteInvalidCopy = {
  reason: 'revoked',
  title: 'Invitation revoked',
  body: 'The facilitator has withdrawn this invitation. Contact them for a new one if you should still be joining.',
  primaryAction: { label: 'Request access', href: '/request-access' },
  secondaryAction: { label: 'Back to SquadRidge', href: '/' },
};

const ALREADY_USED: InviteInvalidCopy = {
  reason: 'already_used',
  title: 'This invitation has already been used',
  body: 'Each invitation can only be accepted once. If you have already completed verification, sign in with the account you created.',
  primaryAction: { label: 'Sign in', href: '/sign-in' },
  secondaryAction: { label: 'Back to SquadRidge', href: '/' },
};

const EXPIRED: InviteInvalidCopy = {
  reason: 'expired',
  title: 'Invitation expired',
  body: 'This invitation is past its expiry window. Ask the facilitator to send a fresh link — invitations typically last 72 hours.',
  primaryAction: { label: 'Request access', href: '/request-access' },
  secondaryAction: { label: 'Back to SquadRidge', href: '/' },
};

/** Deterministic mapping from a validation `reason` to user-facing copy + actions. */
export function copyForInviteReason(
  reason: InviteValidationResult['reason'] | undefined,
): InviteInvalidCopy {
  switch (reason) {
    case 'revoked':
      return REVOKED;
    case 'already_used':
      return ALREADY_USED;
    case 'expired':
      return EXPIRED;
    case 'not_found':
    default:
      return NOT_FOUND;
  }
}
