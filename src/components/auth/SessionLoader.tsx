// ============================================================
// SessionLoader — full-page branded presence while auth initializes
// ============================================================
import { BrandPresenceLoader } from '../ui/BrandPresenceLoader';

export function SessionLoader() {
  return (
    <BrandPresenceLoader variant="full" label="Loading…" phrase="Confirming your secure session" />
  );
}
