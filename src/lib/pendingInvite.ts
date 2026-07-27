// ============================================================
// Pending invite handshake (passwordless sign-in → accept_invite RPC)
// ============================================================

const STORAGE_KEY = 'sr_pending_invite';

export interface PendingInvite {
  token: string;
  displayName: string;
  email: string;
}

export function savePendingInvite(pending: PendingInvite): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
}

export function readPendingInvite(): PendingInvite | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingInvite;
    if (parsed?.token && parsed?.email && parsed?.displayName) return parsed;
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

export function clearPendingInvite(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

/** Public path operators share with invitees. */
export function staffInviteAcceptPath(token: string): string {
  return `/invite/accept/${encodeURIComponent(token)}`;
}
