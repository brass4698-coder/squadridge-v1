/** Shared governance dashboard fixtures and types — demo-first, metadata only. */

export type MatterType =
  | 'mediation'
  | 'restorative'
  | 'community_safety'
  | 'ombuds'
  | 'regional'
  | 'business'
  | 'university'
  | 'military'
  | 'conflict';

export type LifecycleStage =
  | 'intake'
  | 'invited'
  | 'verified'
  | 'active'
  | 'draft'
  | 'approvals'
  | 'released'
  | 'archived'
  | 'closed';

export type ReleaseMode = 'public' | 'internal' | 'none';

export type DemoPresetId =
  | 'mediation'
  | 'restorative'
  | 'community_safety'
  | 'ombuds'
  | 'institutional'
  | 'university'
  | 'business'
  | 'military'
  | 'high_stakes';

export type GovernanceMatter = {
  matter_id: string;
  room_id: string;
  label: string;
  region: string;
  institution: string;
  department: string;
  matter_type: MatterType;
  sensitivity_level: 'standard' | 'elevated' | 'high';
  verified_participant_count: number;
  stage: LifecycleStage;
  round_count: number;
  draft_status: 'none' | 'draft' | 'in_review' | 'approved';
  approvals_required: number;
  approvals_complete: number;
  release_mode: ReleaseMode;
  released_at: string | null;
  anchor_hash: string | null;
  public_record_id: string | null;
  facilitator_id: string;
  escalation_flag: boolean;
  days_in_state: number;
  stall_risk: boolean;
};

export const DEMO_PRESETS: {
  id: DemoPresetId;
  label: string;
  scope: string;
}[] = [
  { id: 'mediation', label: 'Mediation practice', scope: 'Pacific Northwest mediation pilot' },
  {
    id: 'restorative',
    label: 'Restorative / de-escalation',
    scope: 'Municipal restorative cohort',
  },
  {
    id: 'community_safety',
    label: 'City community safety',
    scope: 'City community safety partners',
  },
  { id: 'ombuds', label: 'Ombuds inquiry', scope: 'Institutional inquiry desk' },
  { id: 'institutional', label: 'Institutional review', scope: 'Multi-unit governance portfolio' },
  {
    id: 'university',
    label: 'University / campus',
    scope: 'Campus ombuds and conduct — parties anonymized in room',
  },
  {
    id: 'business',
    label: 'Business / board',
    scope: 'Executive committee and JV wind-down deliberations',
  },
  {
    id: 'military',
    label: 'Military / unit readiness',
    scope: 'Cross-unit assessment — ranks and units pseudonymous',
  },
  {
    id: 'high_stakes',
    label: 'High-stakes conflict',
    scope: 'Track II dialogue and ceasefire working groups',
  },
];

const BASE_MATTERS: GovernanceMatter[] = [
  {
    matter_id: 'm-watershed',
    room_id: 'r-watershed',
    label: 'North Watershed Consultation',
    region: 'PNW',
    institution: 'Cascade Mediation',
    department: 'Natural resources',
    matter_type: 'regional',
    sensitivity_level: 'elevated',
    verified_participant_count: 8,
    stage: 'approvals',
    round_count: 4,
    draft_status: 'in_review',
    approvals_required: 2,
    approvals_complete: 1,
    release_mode: 'public',
    released_at: null,
    anchor_hash: null,
    public_record_id: null,
    facilitator_id: 'fac-1',
    escalation_flag: false,
    days_in_state: 3,
    stall_risk: false,
  },
  {
    matter_id: 'm-harbor',
    room_id: 'r-harbor',
    label: 'Harbor District Restorative Circle',
    region: 'Coast',
    institution: 'City Safety Office',
    department: 'Community safety',
    matter_type: 'restorative',
    sensitivity_level: 'high',
    verified_participant_count: 6,
    stage: 'active',
    round_count: 2,
    draft_status: 'none',
    approvals_required: 0,
    approvals_complete: 0,
    release_mode: 'internal',
    released_at: null,
    anchor_hash: null,
    public_record_id: null,
    facilitator_id: 'fac-2',
    escalation_flag: true,
    days_in_state: 9,
    stall_risk: true,
  },
  {
    matter_id: 'm-ombuds-a',
    room_id: 'r-ombuds-a',
    label: 'Campus Ombuds Inquiry A',
    region: 'Metro',
    institution: 'State University',
    department: 'Ombuds',
    matter_type: 'ombuds',
    sensitivity_level: 'high',
    verified_participant_count: 5,
    stage: 'draft',
    round_count: 5,
    draft_status: 'draft',
    approvals_required: 1,
    approvals_complete: 0,
    release_mode: 'internal',
    released_at: null,
    anchor_hash: null,
    public_record_id: null,
    facilitator_id: 'fac-3',
    escalation_flag: false,
    days_in_state: 4,
    stall_risk: false,
  },
  {
    matter_id: 'm-mediate-1',
    room_id: 'r-mediate-1',
    label: 'Supply Chain Dispute Mediation',
    region: 'PNW',
    institution: 'Cascade Mediation',
    department: 'Commercial',
    matter_type: 'mediation',
    sensitivity_level: 'standard',
    verified_participant_count: 4,
    stage: 'verified',
    round_count: 0,
    draft_status: 'none',
    approvals_required: 0,
    approvals_complete: 0,
    release_mode: 'none',
    released_at: null,
    anchor_hash: null,
    public_record_id: null,
    facilitator_id: 'fac-1',
    escalation_flag: false,
    days_in_state: 2,
    stall_risk: false,
  },
  {
    matter_id: 'm-safety-2',
    room_id: 'r-safety-2',
    label: 'Neighborhood Safety Partnership',
    region: 'Metro',
    institution: 'City Safety Office',
    department: 'Community safety',
    matter_type: 'community_safety',
    sensitivity_level: 'elevated',
    verified_participant_count: 12,
    stage: 'released',
    round_count: 6,
    draft_status: 'approved',
    approvals_required: 2,
    approvals_complete: 2,
    release_mode: 'public',
    released_at: '2026-07-10T16:00:00Z',
    anchor_hash: '0x7a3f…c91e',
    public_record_id: 'led-2026-041',
    facilitator_id: 'fac-2',
    escalation_flag: false,
    days_in_state: 12,
    stall_risk: false,
  },
  {
    matter_id: 'm-closed-1',
    room_id: 'r-closed-1',
    label: 'Internal Workplace Facilitation',
    region: 'PNW',
    institution: 'Cascade Mediation',
    department: 'Workplace',
    matter_type: 'mediation',
    sensitivity_level: 'elevated',
    verified_participant_count: 3,
    stage: 'closed',
    round_count: 3,
    draft_status: 'approved',
    approvals_required: 1,
    approvals_complete: 1,
    release_mode: 'none',
    released_at: null,
    anchor_hash: null,
    public_record_id: null,
    facilitator_id: 'fac-1',
    escalation_flag: false,
    days_in_state: 20,
    stall_risk: false,
  },
  {
    matter_id: 'm-univ-conduct',
    room_id: 'r-univ-conduct',
    label: 'Campus Conduct Review — anonymized parties',
    region: 'Metro',
    institution: 'State University',
    department: 'Student conduct',
    matter_type: 'university',
    sensitivity_level: 'high',
    verified_participant_count: 7,
    stage: 'active',
    round_count: 3,
    draft_status: 'none',
    approvals_required: 0,
    approvals_complete: 0,
    release_mode: 'internal',
    released_at: null,
    anchor_hash: null,
    public_record_id: null,
    facilitator_id: 'fac-4',
    escalation_flag: false,
    days_in_state: 5,
    stall_risk: false,
  },
  {
    matter_id: 'm-jv-winddown',
    room_id: 'r-jv-winddown',
    label: 'Joint Venture Wind-Down — executive committee',
    region: 'National',
    institution: 'Meridian Holdings',
    department: 'Board governance',
    matter_type: 'business',
    sensitivity_level: 'elevated',
    verified_participant_count: 9,
    stage: 'approvals',
    round_count: 5,
    draft_status: 'in_review',
    approvals_required: 3,
    approvals_complete: 2,
    release_mode: 'internal',
    released_at: null,
    anchor_hash: null,
    public_record_id: null,
    facilitator_id: 'fac-5',
    escalation_flag: false,
    days_in_state: 6,
    stall_risk: true,
  },
  {
    matter_id: 'm-unit-readiness',
    room_id: 'r-unit-readiness',
    label: 'Cross-Unit Readiness Assessment',
    region: 'Theater East',
    institution: 'Defense Liaison Office',
    department: 'Readiness review',
    matter_type: 'military',
    sensitivity_level: 'high',
    verified_participant_count: 11,
    stage: 'verified',
    round_count: 1,
    draft_status: 'none',
    approvals_required: 0,
    approvals_complete: 0,
    release_mode: 'none',
    released_at: null,
    anchor_hash: null,
    public_record_id: null,
    facilitator_id: 'fac-6',
    escalation_flag: true,
    days_in_state: 2,
    stall_risk: false,
  },
  {
    matter_id: 'm-ceasefire-wg',
    room_id: 'r-ceasefire-wg',
    label: 'Cross-Border Ceasefire Working Group',
    region: 'Border corridor',
    institution: 'Peacebuilding Institute',
    department: 'Track II dialogue',
    matter_type: 'conflict',
    sensitivity_level: 'high',
    verified_participant_count: 8,
    stage: 'active',
    round_count: 4,
    draft_status: 'draft',
    approvals_required: 2,
    approvals_complete: 0,
    release_mode: 'public',
    released_at: null,
    anchor_hash: null,
    public_record_id: null,
    facilitator_id: 'fac-7',
    escalation_flag: true,
    days_in_state: 11,
    stall_risk: true,
  },
];

const PRESET_FILTER: Record<DemoPresetId, (m: GovernanceMatter) => boolean> = {
  mediation: (m) => m.matter_type === 'mediation' || m.matter_type === 'regional',
  restorative: (m) => m.matter_type === 'restorative',
  community_safety: (m) => m.matter_type === 'community_safety',
  ombuds: (m) => m.matter_type === 'ombuds',
  institutional: () => true,
  university: (m) => m.matter_type === 'university' || m.matter_type === 'ombuds',
  business: (m) => m.matter_type === 'business' || m.matter_type === 'mediation',
  military: (m) => m.matter_type === 'military',
  high_stakes: (m) => m.matter_type === 'conflict' || m.matter_type === 'restorative',
};

export function mattersForPreset(preset: DemoPresetId): GovernanceMatter[] {
  const filtered = BASE_MATTERS.filter(PRESET_FILTER[preset]);
  return filtered.length > 0 ? filtered : BASE_MATTERS;
}

export function funnelFromMatters(matters: GovernanceMatter[]) {
  const stages: { key: LifecycleStage; label: string }[] = [
    { key: 'invited', label: 'Invited' },
    { key: 'verified', label: 'Verified' },
    { key: 'active', label: 'Active' },
    { key: 'draft', label: 'Draft ready' },
    { key: 'approvals', label: 'Approvals' },
    { key: 'released', label: 'Released' },
  ];
  const order: LifecycleStage[] = [
    'intake',
    'invited',
    'verified',
    'active',
    'draft',
    'approvals',
    'released',
    'archived',
    'closed',
  ];
  return stages.map(({ key, label }) => {
    const idx = order.indexOf(key);
    const value = matters.filter((m) => order.indexOf(m.stage) >= idx).length;
    return { label, value };
  });
}

export function releaseModeDistribution(matters: GovernanceMatter[]) {
  const counts = { public: 0, internal: 0, none: 0 };
  for (const m of matters) {
    if (m.stage === 'released' || m.stage === 'closed') counts[m.release_mode] += 1;
  }
  return [
    { label: 'Public', value: counts.public },
    { label: 'Internal', value: counts.internal },
    { label: 'No release', value: counts.none },
  ];
}

export function weeklyResolutionTrend() {
  return [
    { label: 'W1', value: 1 },
    { label: 'W2', value: 2 },
    { label: 'W3', value: 1 },
    { label: 'W4', value: 3 },
    { label: 'W5', value: 2 },
    { label: 'W6', value: 4 },
  ];
}

export function approvalTurnaround() {
  return [
    { label: 'Watershed', value: 48 },
    { label: 'Harbor', value: 72 },
    { label: 'Ombuds A', value: 36 },
    { label: 'Safety', value: 24 },
  ];
}

export function useCaseBreakdown(matters: GovernanceMatter[]) {
  const map: Record<string, number> = {};
  for (const m of matters) {
    map[m.matter_type] = (map[m.matter_type] ?? 0) + 1;
  }
  const labels: Record<MatterType, string> = {
    mediation: 'Mediation',
    restorative: 'Restorative',
    community_safety: 'Community safety',
    ombuds: 'Ombuds',
    regional: 'Regional',
    business: 'Business / board',
    university: 'University',
    military: 'Military',
    conflict: 'High-stakes conflict',
  };
  return Object.entries(map).map(([k, value]) => ({
    label: labels[k as MatterType] ?? k,
    value,
  }));
}

export function portfolioHeatmap(matters: GovernanceMatter[]) {
  const regions = Array.from(new Set(matters.map((m) => m.region)));
  const depts = Array.from(new Set(matters.map((m) => m.department)));
  const max = Math.max(matters.length, 1);
  const cells = regions.map((region) =>
    depts.map((dept) => {
      const n = matters.filter((m) => m.region === region && m.department === dept).length;
      return n / max;
    }),
  );
  return { rows: regions, cols: depts.map((d) => d.slice(0, 12)), cells };
}

export function formatUpdated(iso = new Date().toISOString()) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}
