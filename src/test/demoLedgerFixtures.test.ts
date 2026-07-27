import { describe, expect, it } from 'vitest';
import { isDemoLedgerFixture, DEMO_LEDGER_SHA } from '../lib/demoLedgerFixtures';

describe('isDemoLedgerFixture', () => {
  it('flags demo SHA placeholder', () => {
    expect(isDemoLedgerFixture({ ledger_sha: DEMO_LEDGER_SHA, session_id: 'any' })).toBe(true);
  });

  it('flags known demo session ids', () => {
    expect(
      isDemoLedgerFixture({
        session_id: '33333333-3333-4333-8333-333333333333',
        ledger_sha: 'abc123',
      }),
    ).toBe(true);
  });

  it('allows real-looking published rows', () => {
    expect(
      isDemoLedgerFixture({
        session_id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        ledger_sha: '7c3ae91fdeadbeef',
      }),
    ).toBe(false);
  });
});
