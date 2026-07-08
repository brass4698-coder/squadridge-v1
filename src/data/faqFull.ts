import type { FaqItem } from './faqHome';

export const faqFull: FaqItem[] = [
  {
    question: 'Who can see what is said in a room?',
    answer:
      'Only verified participants and the facilitator. No one else. The room content is never published, and identities never appear on the public record — what leaves the room is only the outcome the facilitator approves.',
  },
  {
    question: 'What is a verification anchor?',
    answer:
      'A tamper-evident integrity marker attached to every released record. Anyone can check it independently to confirm the record has not been altered since release. It proves the record is authentic without revealing anything about who was in the room or what was said.',
  },
  {
    question: 'How is participant data handled?',
    answer:
      'Participants are verified privately by the facilitator. Identity is confirmed but never disclosed in the released record — no names, attributions, or identifying details appear in public records. This is directional anonymity: verified, but not exposed.',
  },
  {
    question: 'Is the session end-to-end encrypted?',
    answer:
      'Not today. Session content is protected in transit (TLS) and encrypted at rest, but it is not operator-proof end-to-end encryption; room-level E2EE is on our roadmap. We state the exact boundaries on the security page rather than overclaim.',
  },
  {
    question: 'How long does it take to set up a session?',
    answer:
      'A facilitator can configure a room in minutes — eligibility, verification, and ground rules are all set before invitations go out. Participant verification then happens privately before the room opens. There is no lengthy technical setup or integration work.',
  },
  {
    question: 'Does SquadRidge host video or audio calls?',
    answer:
      'No. SquadRidge is a facilitator-led messaging room only — structured written dialogue, not video, audio, or real-time calls. Session dialogue stays in the protected room; only the facilitator-approved outcome is released, with a verification anchor. See the security page for storage boundaries.',
  },
  {
    question: 'Can participants be identified from a public outcome record?',
    answer:
      'No. Public outcome records do not identify individual participants. They identify the facilitating organisation and the outcome document itself.',
  },
  {
    question: 'What is the public ledger?',
    answer:
      "The public ledger is a read-only index of approved outcome records from completed sessions. Each record was produced and approved through SquadRidge's release process. The ledger is browseable and citable. It does not contain any session room content.",
  },
  {
    question: 'Can a facilitator release an outcome without participant approval?',
    answer:
      'No. The release process requires positive approval from every designated approver configured by the facilitator. The platform cannot bypass this. If any approver declines, the document is not released.',
  },
  {
    question: 'Is SquadRidge a legal instrument?',
    answer:
      'No. SquadRidge is a process platform. It provides structure, documentation, and verification for facilitated dialogue. It does not produce legally binding agreements unless the parties separately formalise the outcome through appropriate legal channels.',
  },
  {
    question: 'How do I get access?',
    answer:
      'Submit a pilot access application using the Request Access form. We review applications manually and respond within five working days.',
  },
];
