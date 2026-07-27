// ============================================================
// Complete pending invite after passwordless sign-in
// ============================================================
import type { Session } from '@supabase/supabase-js';
import { acceptInvite } from './invites';
import { clearPendingInvite, readPendingInvite } from './pendingInvite';
import { logError, safeErrorMessage } from './log';

export type CompletePendingInviteResult =
  | { ok: true; dashboard: string }
  | { ok: false; error: string; reason?: string };

export async function completePendingInvite(
  session: Session,
): Promise<CompletePendingInviteResult> {
  const pending = readPendingInvite();
  if (!pending) {
    return { ok: false, error: 'No pending invite in session.' };
  }

  const sessionEmail = session.user.email?.toLowerCase() ?? '';
  if (sessionEmail !== pending.email.toLowerCase()) {
    return {
      ok: false,
      error: 'Signed-in email does not match the invitation.',
      reason: 'email_mismatch',
    };
  }

  const result = await acceptInvite(pending.token, session.user.id, pending.displayName);
  clearPendingInvite();

  if (!result.success) {
    logError('invite.accept_failed', {
      feature: 'invites',
      error_message: safeErrorMessage(result.error ?? 'unknown'),
    });
    return {
      ok: false,
      error: result.error ?? 'Failed to accept invitation.',
      reason: result.error,
    };
  }

  return { ok: true, dashboard: result.dashboard ?? '/app' };
}

/** Path used as magic-link `next` while finishing invite acceptance. */
export const INVITE_COMPLETE_PATH = '/invite/complete';
