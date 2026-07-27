// ============================================================
// SessionLoader — branded shell while auth initializes (app routes)
// ============================================================

import { AppShellSkeleton } from '../system/SrLoader';

/**
 * Shown while auth initializes on gated app routes.
 * Public marketing bypasses AuthGate so this is not a full-site blank frame.
 */
export function SessionLoader() {
  return <AppShellSkeleton label="Loading session…" />;
}
