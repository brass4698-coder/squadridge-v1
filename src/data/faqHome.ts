export interface FaqItem {
  question: string;
  answer: string;
}

/** Homepage FAQ — highest-friction mediator and facilitator questions first. */
export const faqHome: FaqItem[] = [
  {
    question: 'Who is SquadRidge for?',
    answer:
      'Professional mediators and facilitation teams working high-stakes matters where dialogue must stay private but an approved outcome may need public credibility — mediation, restorative processes, ombuds work, community safety coordination, and peacebuilding. Not open forums or monitoring products.',
  },
  {
    question: 'Does this replace my professional judgment?',
    answer:
      'No. SquadRidge is infrastructure for your process — not automated decisions. You control who is in the room, the pace of dialogue, and whether an outcome is released. It is meant to complement your codes of ethics and professional standards.',
  },
  {
    question: 'Who can see what is said in a room?',
    answer:
      'Only verified participants and the facilitator. Session dialogue is never published, and identities never appear on the public record.',
  },
  {
    question: 'Why written dialogue only?',
    answer:
      'Written rounds reduce exposure, support de-escalation under your control, and keep a clear line between the private room and the releasable record. No video, audio, or published transcripts.',
  },
  {
    question: 'What is a verification anchor?',
    answer:
      'A cryptographic hash generated when a record is released. Anyone can recompute it to confirm the record has not been altered — without seeing the underlying session. See the security page for limits.',
  },
  {
    question: 'Is the session end-to-end encrypted?',
    answer:
      'Not today. Content is protected in transit and access-controlled at rest, but it is not operator-proof end-to-end encryption; room-level E2EE is on the roadmap. We state exact boundaries on the security page so you can set accurate expectations with parties.',
  },
];
