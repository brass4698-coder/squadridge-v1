import type { FaqItem } from './faqHome';

export const faqFull: FaqItem[] = [
  {
    question: 'Who is SquadRidge for?',
    answer:
      'Facilitation teams in high-stakes contexts where dialogue must stay private but an approved outcome may need to be credible outside the room — mediation, restorative and de-escalation processes, ombuds work, boards and foundations, HR/compliance inquiries, and peacebuilding. Not open forums, mass signup, or monitoring products.',
  },
  {
    question: 'Does this replace my professional judgment?',
    answer:
      'No. You control eligibility, pace, and release. SquadRidge is structured facilitation infrastructure — it complements your craft and codes of ethics; it does not decide outcomes for you.',
  },
  {
    question: 'What does “not surveillance” mean in practice?',
    answer:
      'SquadRidge does not monitor communities, score individuals for risk, or provide early-warning analytics. It provides a bounded session room, facilitator-controlled process, and optional publication of approved outcome text with a verification anchor. Audit logs cover lifecycle events — not message bodies used for surveillance.',
  },
  {
    question: 'Why written dialogue only — no video or audio?',
    answer:
      'Written rounds give parties time to weigh words, keep faces and voices out of scope, and preserve a clear line between the private room and the releasable record. SquadRidge does not host calls or publish transcripts.',
  },
  {
    question: 'Why facilitator-led rather than peer-to-peer chat?',
    answer:
      'High-stakes dialogue needs explicit eligibility, verification, pace control, and a governed path to release. Open chat or automatic publication would blur the line between private room and public record.',
  },
  {
    question: 'Who can see what is said in a room?',
    answer:
      'Verified participants and the facilitator. Message bodies are encrypted at the application layer before storage and never published as a transcript. Platform operators with database access can still decrypt using stored room keys — this is not Signal-grade operator-blind encryption. Identities never appear on a released record.',
  },
  {
    question: 'What gets published to the ledger?',
    answer:
      'Only when you choose a public release: facilitator-approved outcome text and limited metadata (organisation, date, participant count). Many pilot sessions use a private anchored decision memo instead — still integrity-checked, not listed on the public ledger. Session dialogue and individual attribution are never published either way.',
  },
  {
    question: 'What is a verification anchor?',
    answer:
      'A tamper-evident integrity marker on every released record. Anyone with the record can check that the text has not been altered since release. It proves release integrity — not room content, participant identity, or endorsement of substance. RFC 3161 trusted timestamping is scaffolded only and not live in the current pilot.',
  },
  {
    question: 'How is participant data handled?',
    answer:
      'Participants are verified privately by the facilitator for eligibility. Names and attributions do not appear on public or partner-facing outcome text.',
  },
  {
    question: 'Is the session end-to-end encrypted?',
    answer:
      'Not operator-blind today. Session content is protected in transit (TLS) and stored as AES-GCM ciphertext with keys held for the facilitator and admitted participants — operators with database access can still decrypt. Operator-blind room E2EE is on the roadmap (ADR 005). Exact boundaries are on the security page.',
  },
  {
    question: 'Can participants be identified from a public outcome record?',
    answer:
      'No. Public outcome records identify the facilitating organisation and the approved outcome document — not individual participants.',
  },
  {
    question: 'Can a facilitator release an outcome without participant approval?',
    answer:
      'No. Release requires positive approval from every designated approver you configure. If any approver declines, the document is not released.',
  },
  {
    question: 'Is SquadRidge a legal instrument?',
    answer:
      'No. It provides structure, documentation, and verification for facilitated dialogue. It does not produce legally binding agreements unless the parties separately formalise the outcome through appropriate legal channels.',
  },
  {
    question: 'How do I get access?',
    answer:
      'Submit a pilot access application. We review applications manually and aim to reply within about one week with an honest fit assessment. Early partners are onboarded deliberately, not at volume.',
  },
];
