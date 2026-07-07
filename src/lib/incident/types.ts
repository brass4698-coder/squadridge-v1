export type IncidentRoomStatus = 'active' | 'paused' | 'archived' | 'closed';
export type IncidentSeverityTier = 'monitoring' | 'escalating' | 'critical' | 'de-escalating';
export type IncidentLane =
  | 'verified_evidence'
  | 'disputed_claims'
  | 'unverified_leads'
  | 'community_impact'
  | 'official_responses';
export type IncidentVerificationStatus =
  | 'pending_review'
  | 'corroborated'
  | 'disputed'
  | 'unverified'
  | 'retracted';
export type IncidentModerationState = 'pending' | 'approved' | 'flagged' | 'removed';
export type IncidentSourceType =
  | 'document'
  | 'statement'
  | 'news'
  | 'social'
  | 'official'
  | 'other';
export type IncidentThreadStatus = 'open' | 'paused' | 'resolved';
export type IncidentParticipantRole = 'participant' | 'facilitator' | 'moderator' | 'observer';

export type IncidentRoomRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: IncidentRoomStatus;
  severity_tier: IncidentSeverityTier;
  facilitator_id: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
};

export type IncidentItemRow = {
  id: string;
  room_id: string;
  lane: IncidentLane;
  verification_status: IncidentVerificationStatus;
  moderation_state: IncidentModerationState;
  title: string;
  body: string;
  source_url: string | null;
  source_type: IncidentSourceType;
  content_warning: string | null;
  author_id: string;
  moderator_id: string | null;
  moderation_note: string | null;
  created_at: string;
  updated_at: string;
};

export type IncidentThreadRow = {
  id: string;
  room_id: string;
  item_id: string | null;
  topic: string;
  status: IncidentThreadStatus;
  created_at: string;
  updated_at: string;
};

export type IncidentMessageRow = {
  id: string;
  thread_id: string;
  author_id: string;
  body: string;
  moderation_state: IncidentModerationState;
  is_facilitator: boolean;
  created_at: string;
};

export type IncidentParticipantRow = {
  room_id: string;
  user_id: string;
  role: IncidentParticipantRole;
  joined_at: string;
};

export type IncidentRoomDetail = {
  room: IncidentRoomRow;
  items: IncidentItemRow[];
  threads: IncidentThreadRow[];
  messages: IncidentMessageRow[];
  participantRole: IncidentParticipantRole | null;
};

export const INCIDENT_LANES: readonly {
  value: IncidentLane;
  label: string;
  description: string;
}[] = [
  {
    value: 'verified_evidence',
    label: 'Verified evidence',
    description: 'Sources that have passed facilitator review.',
  },
  {
    value: 'official_responses',
    label: 'Official responses',
    description: 'Statements from verified institutional sources.',
  },
  {
    value: 'disputed_claims',
    label: 'Disputed claims',
    description: 'Claims under active review — not treated as fact.',
  },
  {
    value: 'unverified_leads',
    label: 'Unverified leads',
    description: 'Pointers that still need corroboration.',
  },
  {
    value: 'community_impact',
    label: 'Community impact',
    description: 'Documented effects on affected communities.',
  },
] as const;

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverityTier, string> = {
  monitoring: 'Monitoring',
  escalating: 'Escalating',
  critical: 'Critical',
  'de-escalating': 'De-escalating',
};

export const INCIDENT_VERIFICATION_LABELS: Record<IncidentVerificationStatus, string> = {
  pending_review: 'Pending review',
  corroborated: 'Corroborated',
  disputed: 'Disputed',
  unverified: 'Unverified',
  retracted: 'Retracted',
};

export const INCIDENT_ROOM_STATUS_LABELS: Record<IncidentRoomStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  archived: 'Archived',
  closed: 'Closed',
};
