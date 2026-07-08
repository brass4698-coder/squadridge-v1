export interface FaqItem {
  question: string;
  answer: string;
}

export const faqHome: FaqItem[] = [
  {
    question: 'Who can see what is said in a room?',
    answer:
      'Only verified participants and the facilitator. Session dialogue is never published, and identities never appear on the public record.',
  },
  {
    question: 'What is a verification anchor?',
    answer:
      'A cryptographic hash generated when a record is released. Anyone can recompute it to confirm the record has not been altered — without seeing the underlying session. See the security page for the full explanation.',
  },
  {
    question: 'How is participant data handled?',
    answer:
      'We minimise what we collect, verify eligibility privately, and never share personal contact details between participants. The security page documents the full model.',
  },
  {
    question: 'Is the session end-to-end encrypted?',
    answer:
      'Not today. Content is protected in transit and at rest, but it is not operator-proof end-to-end encryption; room-level E2EE is on the roadmap. We state the exact boundaries on the security page.',
  },
  {
    question: 'How long does it take to set up a session?',
    answer:
      'Onboarding is lightweight. Most facilitators can set eligibility, verification, and ground rules and open a room in a single sitting — no lengthy technical setup or integration work.',
  },
  {
    question: 'Does SquadRidge support video or audio calls?',
    answer:
      'No. SquadRidge is a facilitator-led messaging room only — structured written dialogue under facilitator control. There are no video calls, audio sessions, or call integrations. Only the approved outcome may be released, with a verification anchor.',
  },
];
