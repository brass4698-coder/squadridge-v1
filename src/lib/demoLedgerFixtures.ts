/**
 * Demo seed fixtures that must never appear as public ledger releases.
 * Kept in sync with scripts/seedDemo.mjs session IDs.
 */

export const DEMO_LEDGER_SESSION_IDS = new Set([
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
]);

export const DEMO_LEDGER_SHA = 'demo-sha-placeholder';

export type DemoLedgerEntryLike = {
  session_id?: string | null;
  ledger_sha?: string | null;
};

/** True when the row is from local/staging demo seed — not a partner release. */
export function isDemoLedgerFixture(entry: DemoLedgerEntryLike): boolean {
  if (entry.ledger_sha === DEMO_LEDGER_SHA) return true;
  if (entry.session_id && DEMO_LEDGER_SESSION_IDS.has(entry.session_id)) return true;
  return false;
}
