import type { FaqItem } from './faqHome';

export const faqFull: FaqItem[] = [
  {
    question: 'Who is SquadRidge for?',
    answer:
      'Professional mediators and facilitation teams in high-stakes contexts where dialogue must stay private but an approved outcome may need to be credible in public — mediation, restorative and de-escalation processes, ombuds work, municipal community safety coordination, peacebuilding, and similar settings. It is not built for open forums, mass signup, or monitoring use cases.',
  },
  {
    question: 'Does this replace my professional judgment?',
    answer:
      'No. The platform does not make mediation decisions for you. You control eligibility, pace, and release. SquadRidge is structured facilitation infrastructure meant to complement — not replace — your craft, codes of ethics, and professional standards.',
  },
  {
    question: 'What does “not surveillance” mean in practice?',
    answer:
      'SquadRidge does not monitor communities, score individuals for risk, or provide early-warning analytics. It provides a bounded session room, facilitator-controlled process, and optional publication of approved outcome text with a verification anchor. Metadata audit logs cover lifecycle events — not message bodies used for surveillance.',
  },
  {
    question: 'Why written dialogue only — no video or audio?',
    answer:
      'Written rounds give parties time to weigh words, reduce exposure of faces and voices, and keep facilitation structured under pressure. SquadRidge deliberately excludes calls and transcripts; only facilitator-approved outcome text may be released.',
  },
  {
    question: 'Why facilitator-led rather than peer-to-peer chat?',
    answer:
      'High-stakes dialogue requires explicit eligibility, verification, pace control, and a governed path to release. As facilitator, you hold process authority — open chat or automatic publication would break the architectural line between private room and public record.',
  },
  {
    question: 'Who can see what is said in a room?',
    answer:
      'Only verified participants and the facilitator. No one else. The room content is never published, and identities never appear on the public record — what leaves the room is only the outcome you approve.',
  },
  {
    question: 'What gets published to the ledger?',
    answer:
      'Only facilitator-approved outcome text and limited metadata (organisation, date, participant count). Session dialogue, transcripts, and individual attribution are never published. See the ledger index for illustrative examples.',
  },
  {
    question: 'What is a verification anchor?',
    answer:
      'A tamper-evident integrity marker attached to every released record. Anyone can check it independently to confirm the record has not been altered since release. It proves release integrity — not room content, participant identity, or external endorsement of substance.',
  },
  {
    question: 'How is participant data handled?',
    answer:
      'Participants are verified privately by the facilitator. Identity is confirmed but never disclosed in the released record — no names, attributions, or identifying details appear in public records. This is directional anonymity: verified, but not exposed on the record.',
  },
  {
    question: 'Is the session end-to-end encrypted?',
    answer:
      'Not today. Session content is protected in transit (TLS) and access-controlled at rest, but it is not operator-proof end-to-end encryption; room-level E2EE is on our roadmap. We state the exact boundaries on the security page rather than overclaim — so you can explain limits accurately to parties and institutions.',
  },
  {
    question: 'How long does it take to set up a session?',
    answer:
      'A facilitator can configure a room in one sitting — eligibility, verification, and ground rules before invitations go out. Participant verification happens privately before the room opens. No lengthy integration work for a pilot.',
  },
  {
    question: 'Does SquadRidge host video or audio calls?',
    answer:
      'No. SquadRidge is a facilitator-led messaging room only — structured written dialogue, not video, audio, or real-time calls. Session dialogue stays in the protected room; only the facilitator-approved outcome is released, with a verification anchor.',
  },
  {
    question: 'Can participants be identified from a public outcome record?',
    answer:
      'No. Public outcome records do not identify individual participants. They identify the facilitating organisation and the approved outcome document.',
  },
  {
    question: 'What is the public ledger?',
    answer:
      "A read-only index of approved outcome records from completed sessions. Each record passed through SquadRidge's release process. The ledger is browseable and citable. It does not contain session room content.",
  },
  {
    question: 'Can a facilitator release an outcome without participant approval?',
    answer:
      'No. The release process requires positive approval from every designated approver you configure. The platform cannot bypass this. If any approver declines, the document is not released.',
  },
  {
    question: 'Is SquadRidge a legal instrument?',
    answer:
      'No. SquadRidge is a process platform. It provides structure, documentation, and verification for facilitated dialogue. It does not produce legally binding agreements unless the parties separately formalise the outcome through appropriate legal channels.',
  },
  {
    question: 'How do I get access?',
    answer:
      'Submit a pilot access application using the Request Access form. We review applications manually and respond within 5–7 business days with an honest fit assessment — including for mediators and mediation programs. Early partners are onboarded deliberately, not at volume.',
  },
];
