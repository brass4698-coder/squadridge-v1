export interface Stage {
  number: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
}

export const stages: Stage[] = [
  {
    number: '01',
    title: 'Configure',
    shortDescription: 'Set eligibility, verification, and ground rules before the room opens.',
    fullDescription:
      'Set session rules, eligibility criteria, release conditions, and participant roles before invitations go out. Every rule is captured and locked — nothing is improvised at session time.',
  },
  {
    number: '02',
    title: 'Verify',
    shortDescription:
      'Confirm each participant privately; identity never reaches the public record.',
    fullDescription:
      "Each participant completes private verification using the facilitator's chosen criteria. Verification data stays inside the room. The room does not open until all required verifications are complete.",
  },
  {
    number: '03',
    title: 'Facilitate',
    shortDescription:
      'Run structured dialogue in a protected room; no public transcript is generated.',
    fullDescription:
      'The facilitator opens the room and manages structured, text-based rounds. Participants respond in writing; private signals reach only the facilitator. No public transcript is generated at any point.',
  },
  {
    number: '04',
    title: 'Release',
    shortDescription:
      'Co-write the outcome, capture approvals, publish with a verification anchor.',
    fullDescription:
      'The facilitator co-writes outcome text with parties, collects required approvals, generates a verification anchor, and publishes the approved record. The platform never releases autonomously.',
  },
];
