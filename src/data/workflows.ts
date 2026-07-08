import type { LucideIcon } from 'lucide-react';
import { FileCheck, MessageSquare, Settings } from 'lucide-react';

export interface WorkflowStep {
  number: string;
  title: string;
  description: string;
  callout?: string;
}

export interface Workflow {
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  steps: WorkflowStep[];
}

export const workflows: Workflow[] = [
  {
    label: 'Workflow A — Facilitator setup',
    title: 'Before the session opens',
    description:
      'Configure rules, issue invites, and complete verification — in that order. The room stays closed until every required check is done.',
    icon: Settings,
    steps: [
      {
        number: '1',
        title: 'Configure',
        description:
          'Set session rules, eligibility criteria, release conditions, and participant roles. Every rule is captured and locked before invitations go out.',
      },
      {
        number: '2',
        title: 'Invite',
        description:
          "Generate unique, single-use invite tokens for each participant. Tokens carry role and expiry. Invites go out via the facilitator's own channel — SquadRidge does not send communications on their behalf.",
      },
      {
        number: '3',
        title: 'Verify',
        description:
          "Each participant completes private verification using the facilitator's chosen criteria. Verification data stays inside the room; nothing about identity reaches the public record.",
        callout: 'The room does not open until all required verifications are complete.',
      },
    ],
  },
  {
    label: 'Workflow B — Facilitation',
    title: 'Inside the session',
    description:
      'A structured, text-based room under facilitator control. Dialogue stays private; signals stay private to the facilitator.',
    icon: MessageSquare,
    steps: [
      {
        number: '1',
        title: 'Open',
        description: 'The facilitator opens the room. Participants enter via their verified token.',
      },
      {
        number: '2',
        title: 'Round management',
        description:
          'The facilitator poses prompts or opens rounds. Each party responds in writing in a structured thread. Rounds can be async or time-boxed.',
      },
      {
        number: '3',
        title: 'Signals',
        description:
          'Participants send private signals to the facilitator — request a break, flag a concern — without the signal appearing in the shared thread.',
      },
      {
        number: '4',
        title: 'Close',
        description:
          'The facilitator closes the room when dialogue is complete. No further submissions are accepted.',
      },
    ],
  },
  {
    label: 'Workflow C — Release',
    title: 'After the session closes',
    description:
      'Outcome text is authored for release — not extracted from the dialogue thread. Every required approval is recorded before anything goes public.',
    icon: FileCheck,
    steps: [
      {
        number: '1',
        title: 'Draft',
        description:
          'The facilitator co-writes outcome text with parties. The draft lives inside the room and is authored for release — it is not the dialogue thread.',
      },
      {
        number: '2',
        title: 'Approve',
        description:
          'Each required party reviews and approves the outcome text. Approvals are recorded. The platform will not proceed without all required approvals.',
      },
      {
        number: '3',
        title: 'Anchor',
        description:
          'On facilitator sign-off, SquadRidge generates a verification anchor — a cryptographic commitment to the outcome text and metadata. The anchor is the only link between the private room and the public record.',
      },
      {
        number: '4',
        title: 'Publish',
        description:
          'The record — approved outcome text, anchor, and limited metadata — is published to the public ledger. Session content is never published. The facilitator signs the release.',
        callout: 'The platform never publishes autonomously.',
      },
    ],
  },
];
