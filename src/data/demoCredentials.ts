/**
 * Demo / walkthrough credential catalog — synthetic data only, never production pilots.
 * See docs/operations/demo-account.md
 */

import { DEV_PARTICIPANT_DEMO_TOKEN } from '../lib/participantDemo';
import type { DemoPresetId } from './governanceDashboard';

/** Primary Supabase demo login (see src/lib/demoLogin.ts defaults). */
export const DEMO_SUPABASE_LOGIN = {
  email: 'demo@squadridge.com',
  password: 'SquadRidgeDemo2026!',
  note: 'Override with VITE_DEMO_EMAIL / VITE_DEMO_PASSWORD and seed via scripts/seedDemo.mjs',
} as const;

export type DemoWalkthroughRole =
  | 'facilitator'
  | 'participant'
  | 'moderator'
  | 'institution_admin'
  | 'mediator'
  | 'executive';

export const DEMO_WALKTHROUGH_ROLES: {
  id: DemoWalkthroughRole;
  label: string;
  description: string;
  dashboardPath: string;
}[] = [
  {
    id: 'facilitator',
    label: 'Facilitator',
    description: 'Configure rooms, verify participants, govern pacing, and release outcomes.',
    dashboardPath: '/app/facilitator',
  },
  {
    id: 'participant',
    label: 'Participant',
    description:
      'Accept invite, join the private written room, and review outcomes before release.',
    dashboardPath: '/app/participant',
  },
  {
    id: 'moderator',
    label: 'Moderator',
    description:
      'Oversight signals, escalation visibility, and process integrity — no auto-publish.',
    dashboardPath: '/app/moderator',
  },
  {
    id: 'institution_admin',
    label: 'Program lead',
    description:
      'Portfolio view across matters, sensitivity, and release posture for an institution.',
    dashboardPath: '/app/institution',
  },
  {
    id: 'mediator',
    label: 'Ombuds / inquiry',
    description:
      'Confidential inquiry desk — internal memos, elevated sensitivity, anonymity preserved.',
    dashboardPath: '/app/mediator',
  },
  {
    id: 'executive',
    label: 'Executive / observer',
    description:
      'Governance summary without room transcripts — release posture and risk signals only.',
    dashboardPath: '/app/executive',
  },
];

export type DemoCredentialEntry = {
  token: string;
  label: string;
  role: DemoWalkthroughRole | 'multi';
  presetId?: DemoPresetId;
  summary: {
    accessType: string;
    matterLabel: string;
    role: string;
    issuedBy: string;
    expiry: string;
    status: string;
  };
  continueHref: string;
};

export const DEMO_GOVERNED_CREDENTIALS: DemoCredentialEntry[] = [
  {
    token: 'demo-facilitator-watershed',
    label: 'Facilitator · watershed consultation',
    role: 'facilitator',
    presetId: 'institutional',
    summary: {
      accessType: 'Facilitator room',
      matterLabel: 'North Watershed Consultation',
      role: 'Facilitator',
      issuedBy: 'SquadRidge demo',
      expiry: 'Resets on seed',
      status: 'Valid (demo)',
    },
    continueHref: '/sign-in?demo=1&next=%2Fapp%2Ffacilitator',
  },
  {
    token: 'demo-participant-harbor',
    label: 'Participant · restorative circle',
    role: 'participant',
    presetId: 'restorative',
    summary: {
      accessType: 'Participant invite',
      matterLabel: 'Harbor District Restorative Circle',
      role: 'Participant (codename)',
      issuedBy: 'City Safety Office demo',
      expiry: 'Resets on seed',
      status: 'Valid (demo)',
    },
    continueHref: '/sign-in?demo=1&next=%2Fapp%2Fparticipant',
  },
  {
    token: 'demo-university-ombuds',
    label: 'Ombuds · campus inquiry',
    role: 'mediator',
    presetId: 'university',
    summary: {
      accessType: 'Inquiry desk',
      matterLabel: 'Campus Conduct Review — anonymized parties',
      role: 'Ombuds investigator',
      issuedBy: 'State University demo',
      expiry: 'Resets on seed',
      status: 'Valid (demo)',
    },
    continueHref: '/sign-in?demo=1&next=%2Fapp%2Fmediator',
  },
  {
    token: 'demo-business-board',
    label: 'Program lead · board deliberation',
    role: 'institution_admin',
    presetId: 'business',
    summary: {
      accessType: 'Institutional portfolio',
      matterLabel: 'Joint Venture Wind-Down — executive committee',
      role: 'Program lead',
      issuedBy: 'Corporate governance demo',
      expiry: 'Resets on seed',
      status: 'Valid (demo)',
    },
    continueHref: '/sign-in?demo=1&next=%2Fapp%2Finstitution',
  },
  {
    token: 'demo-military-unit',
    label: 'Facilitator · unit readiness review',
    role: 'facilitator',
    presetId: 'military',
    summary: {
      accessType: 'Facilitator room',
      matterLabel: 'Cross-Unit Readiness Assessment (anonymized ranks)',
      role: 'Facilitator',
      issuedBy: 'Defense liaison demo',
      expiry: 'Resets on seed',
      status: 'Valid (demo)',
    },
    continueHref: '/sign-in?demo=1&next=%2Fapp%2Ffacilitator',
  },
  {
    token: 'demo-conflict-track2',
    label: 'Facilitator · Track II dialogue',
    role: 'facilitator',
    presetId: 'high_stakes',
    summary: {
      accessType: 'High-sensitivity room',
      matterLabel: 'Cross-Border Ceasefire Working Group',
      role: 'Facilitator',
      issuedBy: 'Peacebuilding institute demo',
      expiry: 'Resets on seed',
      status: 'Valid (demo)',
    },
    continueHref: '/sign-in?demo=1&next=%2Fapp%2Ffacilitator',
  },
  {
    token: 'demo-moderator-oversight',
    label: 'Moderator · safety oversight',
    role: 'moderator',
    presetId: 'high_stakes',
    summary: {
      accessType: 'Moderation oversight',
      matterLabel: 'Portfolio safety signals (no transcript access)',
      role: 'Moderator',
      issuedBy: 'SquadRidge demo',
      expiry: 'Resets on seed',
      status: 'Valid (demo)',
    },
    continueHref: '/sign-in?demo=1&next=%2Fapp%2Fmoderator',
  },
  {
    token: 'demo-executive-brief',
    label: 'Executive · governance brief',
    role: 'executive',
    presetId: 'business',
    summary: {
      accessType: 'Observer brief',
      matterLabel: 'Executive governance summary — no room content',
      role: 'Executive observer',
      issuedBy: 'Board office demo',
      expiry: 'Resets on seed',
      status: 'Valid (demo)',
    },
    continueHref: '/sign-in?demo=1&next=%2Fapp%2Fexecutive',
  },
];

/** Bearer token for participant spine without DB (see participantToken.ts). */
export const DEMO_PARTICIPANT_INVITE = {
  token: DEV_PARTICIPANT_DEMO_TOKEN,
  invitePath: `/p/invite/${DEV_PARTICIPANT_DEMO_TOKEN}`,
  roomPath: `/p/room/${DEV_PARTICIPANT_DEMO_TOKEN}`,
  reviewPath: `/p/review/${DEV_PARTICIPANT_DEMO_TOKEN}`,
  label: 'Anonymous participant · watershed room',
  matter: 'Northern Watershed Consultation',
} as const;

export const DEMO_SEEDED_SESSION_ID = '11111111-1111-4111-8111-111111111111';

export const DEMO_QUICK_LINKS = [
  { label: 'Demo hub', href: '/demo' },
  { label: 'Sign in (demo)', href: '/sign-in?demo=1' },
  { label: 'Facilitator dashboard', href: '/app/facilitator' },
  { label: 'Participant dashboard', href: '/app/participant' },
  { label: 'Moderator dashboard', href: '/app/moderator' },
  { label: 'Program lead dashboard', href: '/app/institution' },
  { label: 'Ombuds dashboard', href: '/app/mediator' },
  { label: 'Executive dashboard', href: '/app/executive' },
  { label: 'Participant invite (demo)', href: DEMO_PARTICIPANT_INVITE.invitePath },
  { label: 'Participant room (demo)', href: DEMO_PARTICIPANT_INVITE.roomPath },
  { label: 'Enter credential', href: '/enter/credential' },
  { label: 'Pilot guide', href: '/app/pilot-guide' },
] as const;
