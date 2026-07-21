export type SessionTemplateId =
  | 'city_community_safety'
  | 'community_mediation'
  | 'ngo_deliberation'
  | 'track2_dialogue';

/** Pilot wedge ranking — primary is the default create-session selection. */
export type SessionTemplatePilotFocus = 'primary' | 'secondary' | 'deferred';

export interface SessionTemplate {
  id: SessionTemplateId;
  label: string;
  audience: string;
  description: string;
  conflictType: string;
  language: string;
  maxParticipants: number;
  identityVerification: boolean;
  outcomePublic: boolean;
  eligibilityNotes: string;
  /** How this template is presented during private pilot. */
  pilotFocus: SessionTemplatePilotFocus;
  setupConfig: {
    suggestedOutcomeStructure: string;
    requiredApprovals: 'all_verified' | 'facilitator_plus_parties';
    groundRules: string[];
    resolutionWorkflow?: boolean;
    suggestedProposals?: Array<{
      title: string;
      description?: string;
      owner_org?: string;
      target_days?: number;
    }>;
  };
}

export const DEFAULT_PILOT_TEMPLATE_ID: SessionTemplateId = 'ngo_deliberation';

export const SESSION_TEMPLATES: SessionTemplate[] = [
  {
    id: 'ngo_deliberation',
    label: 'NGO internal deliberation',
    audience: 'NGOs & peacebuilding teams',
    description:
      'Sensitive staff deliberation with a funder-safe record — no transcript that could be weaponized.',
    conflictType: 'Community & civic',
    language: 'English',
    maxParticipants: 6,
    identityVerification: true,
    outcomePublic: false,
    eligibilityNotes: 'Verified staff and named partners only. No external observers in the room.',
    pilotFocus: 'primary',
    setupConfig: {
      suggestedOutcomeStructure:
        'Decision memo — context, options considered, agreed position, implementation owners.',
      requiredApprovals: 'facilitator_plus_parties',
      groundRules: [
        'Contributions visible only inside the room',
        'Released record is a private anchored decision memo by default',
        'No individual attribution on any released record',
      ],
    },
  },
  {
    id: 'community_mediation',
    label: 'Community mediation',
    audience: 'Professional mediators & facilitation teams',
    description:
      'Land-use or community disputes where parties need a protected written room and a joint statement you can release with verifiable provenance.',
    conflictType: 'Land & property',
    language: 'English',
    maxParticipants: 4,
    identityVerification: true,
    outcomePublic: true,
    eligibilityNotes:
      'Parties must have standing in the dispute. You confirm eligibility before verification.',
    pilotFocus: 'secondary',
    setupConfig: {
      suggestedOutcomeStructure:
        'Joint Statement of Principles — positions acknowledged, agreed principles, next steps.',
      requiredApprovals: 'all_verified',
      groundRules: [
        'Written contributions only in the room',
        'No attribution in the public record',
        'You moderate pace and tone as facilitator',
      ],
    },
  },
  {
    id: 'city_community_safety',
    label: 'City community safety',
    audience: 'Municipal offices & community partners',
    description:
      'Coordinate community-led violence prevention partners under facilitator oversight — rank interventions, then release an action commitments record.',
    conflictType: 'Community & civic',
    language: 'English',
    maxParticipants: 8,
    identityVerification: true,
    outcomePublic: true,
    eligibilityNotes:
      'Verified representatives from participating organizations only. City staff facilitate; community partners join via invite tokens. No public attribution of room dialogue.',
    pilotFocus: 'deferred',
    setupConfig: {
      suggestedOutcomeStructure:
        'Action Commitments Record — prioritized interventions, lead organizations, timelines, and follow-up owners.',
      requiredApprovals: 'facilitator_plus_parties',
      groundRules: [
        'Written contributions only — structured coordination, not open chat',
        'Intervention proposals may be supported; support counts are not public attribution',
        'Released record contains approved commitments only — no room transcript',
        'Facilitator moderates pace; pause available if process needs cooling',
      ],
      resolutionWorkflow: true,
      suggestedProposals: [
        {
          title: 'Expanded youth evening programming',
          description:
            'Increase supervised programming in priority neighborhoods during peak hours.',
          owner_org: 'Youth services partner',
          target_days: 90,
        },
        {
          title: 'Shared cross-agency referral protocol',
          description:
            'Standardize warm handoffs between outreach, behavioral health, and employment partners.',
          owner_org: 'Multi-party',
          target_days: 60,
        },
        {
          title: 'Neighborhood listening sessions',
          description:
            'Facilitator-led listening rounds with documented follow-up themes (not public quotes).',
          owner_org: 'Community coalition',
          target_days: 45,
        },
      ],
    },
  },
  {
    id: 'track2_dialogue',
    label: 'Track II / cross-line dialogue',
    audience: 'Cross-border & Track II dialogue',
    description:
      'Civil-society exchange across a conflict line — communiqué without exposing who said what.',
    conflictType: 'Political / governance',
    language: 'English',
    maxParticipants: 4,
    identityVerification: true,
    outcomePublic: true,
    eligibilityNotes:
      'Verified representatives only. All dialogue stays in the SquadRidge messaging room.',
    pilotFocus: 'deferred',
    setupConfig: {
      suggestedOutcomeStructure:
        'Shareable communiqué or statement of common ground — facilitator-signed release.',
      requiredApprovals: 'all_verified',
      groundRules: [
        'Facilitator-led written rounds only',
        'No video or audio on SquadRidge',
        'Release only after all parties approve',
      ],
    },
  },
];

export function getSessionTemplate(id: SessionTemplateId | ''): SessionTemplate | undefined {
  return SESSION_TEMPLATES.find((t) => t.id === id);
}

export function isDeferredPilotTemplate(id: SessionTemplateId): boolean {
  return getSessionTemplate(id)?.pilotFocus === 'deferred';
}
