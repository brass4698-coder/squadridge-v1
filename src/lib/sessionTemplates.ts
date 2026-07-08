export type SessionTemplateId = 'community_mediation' | 'ngo_deliberation' | 'track2_dialogue';

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
  setupConfig: {
    suggestedOutcomeStructure: string;
    requiredApprovals: 'all_verified' | 'facilitator_plus_parties';
    groundRules: string[];
  };
}

export const SESSION_TEMPLATES: SessionTemplate[] = [
  {
    id: 'community_mediation',
    label: 'Community mediation',
    audience: 'Civil mediators & conflict-resolution',
    description:
      'Land-use or community disputes where parties need structured written dialogue and a joint statement.',
    conflictType: 'Land & property',
    language: 'English',
    maxParticipants: 4,
    identityVerification: true,
    outcomePublic: true,
    eligibilityNotes:
      'Parties must have standing in the dispute. Facilitator confirms eligibility before verification.',
    setupConfig: {
      suggestedOutcomeStructure:
        'Joint Statement of Principles — positions acknowledged, agreed principles, next steps.',
      requiredApprovals: 'all_verified',
      groundRules: [
        'Written contributions only in the room',
        'No attribution in the public record',
        'Facilitator moderates pace and tone',
      ],
    },
  },
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
    setupConfig: {
      suggestedOutcomeStructure:
        'Decision memo — context, options considered, agreed position, implementation owners.',
      requiredApprovals: 'facilitator_plus_parties',
      groundRules: [
        'Contributions visible only inside the room',
        'Released record contains agreed position only',
        'No individual attribution on public record',
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
