/**
 * Single source of truth for scripted demo values so onboarding, placement, verification,
 * and the profile step show the same callsign, role, routing hints, and tags.
 */
export const DEMO_PERSONA = {
  callsign: 'Northstar-7',
  /** Matches onboarding radio + profile `<select>` value. */
  role: 'strategist',
  /** Onboarding era `<Select>` value (`IdentityStep` ERAS). */
  eraAffiliation: 'contemporary',
  /** Profile “Era lens” free text — same era story as onboarding. */
  eraLens: 'Contemporary',
  language: 'English',
  region: 'Western Europe',
  timezoneWindow: 'Weekday evenings UTC',
  /** Comma-separated tags for profile settings. */
  tags: 'dialogue, cross_border, corridor_demo',
  verificationEmail: 'presenter.demo@example.com',
  /** Intent narrative — aligned with strategist / corridor framing. */
  intent:
    'Strategist framing for a cross-border corridor — walkthrough only; matching the Northstar-7 demo persona.',
  /** Offline session line — same voice. */
  sessionLine: '[Northstar-7] Acknowledged — proceeding to ledger review per demo script.',
  /** Room dry-run reply — high-level, non-operational. */
  dryRunReply:
    'We should align on de-escalation and civilian safety framing before discussing any detailed logistics.',
} as const;
