/** Shared persona used across all scripted demo steps. */
export const DEMO_PERSONA = {
  callsign: 'Northstar-7',
  role: 'strategist',
  eraAffiliation: 'contemporary',
  eraLens: 'Contemporary',
  language: 'English',
  region: 'Western Europe',
  timezoneWindow: 'Weekday evenings UTC',
  tags: 'dialogue, cross_border, corridor_demo',
  verificationEmail: 'presenter.demo@example.com',
  intent:
    'Strategist framing for a cross-border corridor — walkthrough only; matching the Northstar-7 demo persona.',
  sessionLine: '[Northstar-7] Acknowledged — proceeding to ledger review per demo script.',
  dryRunReply:
    'We should align on de-escalation and civilian safety framing before discussing any detailed logistics.',
} as const;
