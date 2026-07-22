import type { UseCaseCardProps } from '../components/shared/UseCaseCard';

export const flagshipUseCaseId = 'civil-mediation';

export const useCases: UseCaseCardProps[] = [
  {
    sector: 'Civil mediators & conflict resolution · Flagship',
    title: 'Community land-use mediation',
    context:
      'Parties to a contested land-use question need structured dialogue without a discoverable trail — while institutions still need a credible outcome they can cite.',
    inTheRoom:
      'Structured written rounds under facilitator control. Each party states its position and responds at its own pace. No faces, voices, or transcripts leave the room.',
    releasedRecord:
      'A Joint Statement of Principles, approved by every party, published to the ledger with a verification anchor.',
    whySquadridge:
      'A protected room for parties and a verifiable record for institutions — without exposing who said what, and without replacing your professional judgment.',
    recordSampleId: 'SQR-2024-0147',
    ctaLabel: 'Request access as a mediator',
    ctaHref: '/request-access',
  },
  {
    sector: 'Restorative & de-escalation processes',
    title: 'Facilitated strategy session with a releasable agreement',
    context:
      'A restorative or de-escalation process needs a protected written room — tensions are high, attribution is sensitive, and agreed next steps may need to exist outside the room.',
    inTheRoom:
      'Structured written rounds under a trained facilitator. Parties engage without real-time confrontation; dialogue stays private.',
    releasedRecord:
      'A facilitator-approved agreement summary or action plan on the ledger — verifiable integrity, no transcript, no participant attribution.',
    whySquadridge:
      'Supports de-escalation through structure and time-bound written dialogue — not monitoring, scoring, or surveillance of communities.',
    ctaLabel: 'See how it works',
    ctaHref: '/how-it-works',
  },
  {
    sector: 'City community safety',
    title: 'Municipal coordination — action commitments record',
    context:
      'A city community safety office convenes verified partners from violence interruption, youth services, and neighborhood coalitions. They need a protected room to negotiate priorities, then a record funders and council can verify.',
    inTheRoom:
      'Structured written coordination under facilitator oversight. Partners propose interventions and signal support privately — no transcript, no surveillance analytics, no public attribution.',
    releasedRecord:
      'An Action Commitments Record: prioritized interventions, lead organizations, timelines, and org count — with a verification anchor. Room dialogue never publishes.',
    whySquadridge:
      'Traceable institutional decisions without turning dialogue into monitoring. Partners coordinate safely; the city releases only what everyone approved.',
    recordSampleId: 'SQR-2026-0312',
    ctaLabel: 'Request a municipal briefing',
    ctaHref: '/request-access',
  },
  {
    sector: 'NGOs & peacebuilding teams',
    title: 'Sensitive internal deliberation',
    context:
      'A contested advocacy position must be worked through without putting staff or community members at risk. Contributors argue freely; the organisation still needs a record funders can trust.',
    inTheRoom:
      'Structured written deliberation among verified staff and partners. Contributions stay inside the room; identities are never disclosed publicly.',
    releasedRecord:
      'A verifiable record of the agreed position — evidence of process for funders, with no transcript that could be turned against the room.',
    whySquadridge:
      'Staff are not put at risk by participation; the funder gets evidence of process without a weaponizable transcript.',
    ctaLabel: 'Talk to us',
    ctaHref: '/request-access',
  },
  {
    sector: 'Cross-border & Track II dialogue',
    title: 'Civil-society dialogue across a conflict line',
    context:
      'Civil-society groups from parties in conflict need a facilitated exchange where meeting in person or on camera is unsafe or impossible.',
    inTheRoom:
      'Facilitator-led written exchange between verified representatives — structured rounds, facilitator control, no calls.',
    releasedRecord:
      'A shareable communiqué or statement of common ground, released only on facilitator sign-off and anchored so readers can confirm it is unaltered.',
    whySquadridge:
      'Parties speak freely knowing nothing is recorded for public release; the communiqué is verifiable without revealing who said what.',
    ctaLabel: 'Request pilot access',
    ctaHref: '/request-access',
  },
  {
    sector: 'Implementation & monitoring',
    title: 'Post-agreement implementation check-ins',
    context:
      'After an agreement is reached, parties need accountability without exposing internal reporting. Periodic check-ins must produce a credible public checkpoint.',
    inTheRoom:
      'Periodic written progress reports from verified parties, organised into a protected thread the facilitator moderates.',
    releasedRecord:
      "A verified implementation-status update on the ledger — a credible, tamper-evident checkpoint — without exposing the parties' internal reporting.",
    whySquadridge:
      'Creates a tamper-evident record of implementation without exposing which party reported what.',
    ctaLabel: 'See how it works',
    ctaHref: '/how-it-works',
  },
  {
    sector: 'Ombuds, HR & internal investigations',
    title: 'Sensitive workplace or institutional inquiry',
    context:
      'A workplace complaint or institutional inquiry requires structured fact-finding — and a defensible anonymized record — without exposing contributors or creating a discoverable transcript.',
    inTheRoom:
      'Verified contributors submit written accounts in structured rounds. The ombuds or investigator facilitates; contributors are verified by role, not exposed by name.',
    releasedRecord:
      "A verified findings summary — the ombuds' approved conclusions, anchored and tamper-evident — without any individual's account attached.",
    whySquadridge:
      'Contributors speak without creating a discoverable transcript; investigators release only approved conclusions.',
    ctaLabel: 'Request pilot access',
    ctaHref: '/request-access',
  },
];

/** Secondary contexts — shown after the flagship on marketing pages. */
export const secondaryUseCases = useCases.slice(1);
