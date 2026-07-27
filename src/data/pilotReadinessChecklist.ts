/**
 * In-app pilot readiness instrument — structured from
 * docs/operations/v2-pilot-checklist.md. Keep copy honest with the threat model.
 */

import { appRoutes } from '../lib/appRoutes';

export type PilotChecklistSectionId =
  | 'before-go-live'
  | 'session-setup'
  | 'participant-path'
  | 'during-session'
  | 'close-release'
  | 'post-session'
  | 'abort'
  | 'deferred';

export type PilotChecklistItemKind = 'check' | 'step' | 'note' | 'abort' | 'deferred';

export type PilotChecklistItem = {
  id: string;
  label: string;
  detail?: string;
  /** Present when failing the item should stop the pilot. */
  stopCondition?: string;
  href?: string;
  hrefLabel?: string;
  /** When false, item is informational (abort / deferred). */
  checkable: boolean;
  kind: PilotChecklistItemKind;
};

export type PilotChecklistSection = {
  id: PilotChecklistSectionId;
  eyebrow: string;
  title: string;
  description: string;
  items: readonly PilotChecklistItem[];
  tone: 'default' | 'caution' | 'deferred';
};

export const PILOT_PRODUCT_PATH = 'Configure → Verify → Facilitate → Release' as const;

export const PILOT_BEACHHEAD =
  'NGO internal deliberation (ngo_deliberation) — private anchored outcome by default' as const;

export const PILOT_READINESS_SECTIONS: readonly PilotChecklistSection[] = [
  {
    id: 'before-go-live',
    eyebrow: '01 · Preflight',
    title: 'Before go-live',
    description:
      'Confirm environment, people, and partner expectations before the first live room. Any stop condition below means pause — do not improvise around it.',
    tone: 'default',
    items: [
      {
        id: 'golive-commit',
        kind: 'check',
        checkable: true,
        label: 'Deployed commit recorded in the pilot kickoff doc',
        stopCondition: 'Unknown build',
      },
      {
        id: 'golive-check-all',
        kind: 'check',
        checkable: true,
        label: 'npm run check:all green on that commit',
        detail: 'Includes prod-readiness and VITE_V2_MOCK_DATA guards.',
        stopCondition: 'Any prod-readiness failure',
      },
      {
        id: 'golive-walkthrough',
        kind: 'check',
        checkable: true,
        label: 'Facilitator completes this pilot guide walkthrough (or scripted tour on staging)',
        stopCondition: 'Facilitator unfamiliar with the product spine',
        href: '#pilot-walkthrough',
        hrefLabel: 'Spine walkthrough',
      },
      {
        id: 'golive-metrics',
        kind: 'check',
        checkable: true,
        label: 'Metrics pre-registered before day one',
        detail:
          'See docs/operations/pilot-metrics-preregistration.md — do not invent closeout claims.',
        stopCondition: 'Closeout cites unregistered claims',
      },
      {
        id: 'golive-db',
        kind: 'check',
        checkable: true,
        label: 'Database migrations and pgTAP green (includes v2_session_lifecycle)',
        stopCondition: 'Migration or pgTAP failure',
      },
      {
        id: 'golive-edge',
        kind: 'check',
        checkable: true,
        label: 'Edge Functions deployed: health-check and send-session-invite',
        detail: 'Without Resend secrets, invite delivery stays manual copy-link.',
        stopCondition: 'Missing probe / invite scaffold on staging',
      },
      {
        id: 'golive-email-secrets',
        kind: 'check',
        checkable: true,
        label:
          'If using email delivery: RESEND_API_KEY, RESEND_FROM_EMAIL, SITE_URL set — otherwise MOU states in-app / manual-link alerts only',
        stopCondition: 'Partner expects automated email without secrets',
      },
      {
        id: 'golive-mou',
        kind: 'check',
        checkable: true,
        label: 'Partner MOU states operator-readable v2 room content (not Signal-grade E2E)',
        stopCondition: 'Partner expects server-blind encryption',
        href: '/security',
        hrefLabel: 'Security boundaries',
      },
      {
        id: 'golive-facilitator',
        kind: 'check',
        checkable: true,
        label: 'Facilitator account active (profile.status = active, facilitator role)',
        stopCondition: 'Pending or suspended facilitator',
      },
      {
        id: 'golive-mock-flag',
        kind: 'check',
        checkable: true,
        label: 'VITE_V2_MOCK_DATA is unset or false in the deployed frontend',
        stopCondition: 'Fixture data in pilot',
      },
      {
        id: 'golive-maintenance',
        kind: 'check',
        checkable: true,
        label: 'VITE_MAINTENANCE_MODE is unset or false',
        stopCondition: 'Accidental maintenance page in pilot',
      },
      {
        id: 'golive-ledger-banner',
        kind: 'check',
        checkable: true,
        label: 'Public /ledger banner reviewed — live records appear only after release_outcome',
        stopCondition: 'Partner cites illustrative samples as outcomes',
        href: '/ledger',
        hrefLabel: 'Public ledger',
      },
    ],
  },
  {
    id: 'session-setup',
    eyebrow: '02 · Configure',
    title: 'Session setup',
    description:
      'Prefer NGO internal deliberation. Leave public ledger publish unchecked unless the partner has consented. Invite links are bearer secrets.',
    tone: 'default',
    items: [
      {
        id: 'setup-create',
        kind: 'step',
        checkable: true,
        label: 'Create session (NGO internal deliberation; public ledger unchecked)',
        href: appRoutes.sessionNew,
        hrefLabel: 'New session setup',
      },
      {
        id: 'setup-invite',
        kind: 'step',
        checkable: true,
        label: 'Invite participants — copy /p/invite/:token links',
        detail:
          'Optional email via send-session-invite requires Resend secrets; otherwise delivery stays manual.',
        href: appRoutes.sessions,
        hrefLabel: 'Sessions list',
      },
      {
        id: 'setup-review',
        kind: 'step',
        checkable: true,
        label: 'Review verification submissions',
        href: appRoutes.participants,
        hrefLabel: 'Participants index',
      },
      {
        id: 'setup-approve',
        kind: 'step',
        checkable: true,
        label: 'Approve each participant (verified)',
        detail: 'Facilitator approval on the review screen remains the real admission gate.',
        href: appRoutes.participants,
        hrefLabel: 'Review participants',
      },
      {
        id: 'setup-open',
        kind: 'step',
        checkable: true,
        label: 'Open room (live / open) from the control surface',
        href: appRoutes.sessions,
        hrefLabel: 'Sessions → Control',
      },
    ],
  },
  {
    id: 'participant-path',
    eyebrow: '03 · Participant',
    title: 'Participant path',
    description:
      'Share this sequence with partners. Invite links are bearer secrets (72h default expiry) — do not forward on insecure channels.',
    tone: 'default',
    items: [
      {
        id: 'part-invite',
        kind: 'step',
        checkable: true,
        label: 'Open invite link → /p/invite/:token',
      },
      {
        id: 'part-verify',
        kind: 'step',
        checkable: true,
        label: 'Submit verification materials → /p/verify/:token',
      },
      {
        id: 'part-consent',
        kind: 'step',
        checkable: true,
        label: 'Consent + briefing → /p/consent/:token, /p/briefing/:token',
      },
      {
        id: 'part-wait',
        kind: 'step',
        checkable: true,
        label: 'Wait until facilitator approves and opens the session → /p/waiting/:token',
      },
      {
        id: 'part-room',
        kind: 'step',
        checkable: true,
        label: 'Enter written room → /p/room/:token',
      },
    ],
  },
  {
    id: 'during-session',
    eyebrow: '04 · Facilitate',
    title: 'During session',
    description:
      'Keep dialogue in the room. Agree an off-platform immediate-danger protocol before you start — there is no v2 in-room crisis alert.',
    tone: 'default',
    items: [
      {
        id: 'during-control',
        kind: 'note',
        checkable: true,
        label: 'Facilitator messaging on /app/sessions/:id/control (Realtime with reconnect)',
        href: appRoutes.sessions,
        hrefLabel: 'Open sessions',
      },
      {
        id: 'during-room',
        kind: 'note',
        checkable: true,
        label: 'Participant messaging on /p/room/:token (polling + visibility refresh)',
      },
      {
        id: 'during-incident',
        kind: 'note',
        checkable: true,
        label: 'Off-platform immediate-danger protocol agreed (see incidents runbook)',
        detail: 'No v2 in-room crisis alert — do not imply one exists in the pilot brief.',
      },
      {
        id: 'during-no-mock',
        kind: 'note',
        checkable: true,
        label: 'Do not demo mock pages — /app/sessions/:id/room redirects to control',
      },
    ],
  },
  {
    id: 'close-release',
    eyebrow: '05 · Release',
    title: 'Close and release',
    description:
      'Draft the outcome yourself — never import chat. Facilitator-marked approvals are process metadata, not cryptographic party signatures.',
    tone: 'default',
    items: [
      {
        id: 'close-end',
        kind: 'step',
        checkable: true,
        label: 'End session from control',
        href: appRoutes.sessions,
        hrefLabel: 'Sessions → Control',
      },
      {
        id: 'close-draft',
        kind: 'step',
        checkable: true,
        label: 'Draft outcome (no room import)',
        href: appRoutes.sessions,
        hrefLabel: 'Sessions → Outcome',
      },
      {
        id: 'close-approvals',
        kind: 'step',
        checkable: true,
        label: 'Record approvals / share participant review links (copy or optional email)',
        href: appRoutes.releaseGate,
        hrefLabel: 'Release gate',
      },
      {
        id: 'close-preflight',
        kind: 'step',
        checkable: true,
        label: 'Confirm release preflight checklist is green',
        href: appRoutes.releaseGate,
        hrefLabel: 'Release preflight',
      },
      {
        id: 'close-release',
        kind: 'step',
        checkable: true,
        label: 'Release to ledger when consented — verify ledger_sha on /ledger',
        detail: 'Default NGO pilots keep the anchored memo private.',
        href: '/ledger',
        hrefLabel: 'Public ledger',
      },
    ],
  },
  {
    id: 'post-session',
    eyebrow: '06 · Diligence',
    title: 'Post-session diligence',
    description:
      'Close the loop with metadata-only evidence. Do not claim a live public proof unless a real release_outcome row exists.',
    tone: 'default',
    items: [
      {
        id: 'post-audit',
        kind: 'check',
        checkable: true,
        label: 'Export audit trail from the session (metadata only — no message bodies)',
        href: appRoutes.sessions,
        hrefLabel: 'Sessions',
      },
      {
        id: 'post-notifications',
        kind: 'check',
        checkable: true,
        label: 'Check workflow notifications in the facilitator dashboard / settings',
        href: appRoutes.facilitator,
        hrefLabel: 'Facilitator dashboard',
      },
      {
        id: 'post-metrics',
        kind: 'check',
        checkable: true,
        label: 'Record pre-registered metrics only',
        detail: 'Align with docs/product/impact-roadmap.md — no unregistered traction claims.',
      },
      {
        id: 'post-ledger',
        kind: 'check',
        checkable: true,
        label: 'Confirm first live ledger row (not illustrative sample) if claiming public proof',
        href: '/ledger',
        hrefLabel: 'Ledger',
      },
    ],
  },
  {
    id: 'abort',
    eyebrow: 'Stop conditions',
    title: 'Abort criteria',
    description:
      'Stop the pilot if any of these occur. Brief the incident owner before go-live so the response is calm and rehearsed.',
    tone: 'caution',
    items: [
      {
        id: 'abort-token',
        kind: 'abort',
        checkable: false,
        label: 'Participant token path fails (wrong table, expired token, cannot message)',
      },
      {
        id: 'abort-verbatim',
        kind: 'abort',
        checkable: false,
        label: 'Facilitator can release outcome with verbatim room content (guard failure)',
      },
      {
        id: 'abort-mock',
        kind: 'abort',
        checkable: false,
        label: 'Partner discovers the demo ran with VITE_V2_MOCK_DATA=true or mock routes',
      },
      {
        id: 'abort-mou',
        kind: 'abort',
        checkable: false,
        label: 'Room content confidentiality assumptions differ from the MOU (operator-readable)',
      },
    ],
  },
  {
    id: 'deferred',
    eyebrow: 'Out of scope',
    title: 'Explicitly deferred',
    description:
      'Not v2 NGO pilot blockers. Document for ops — do not treat absence as a product defect in the pilot brief.',
    tone: 'deferred',
    items: [
      {
        id: 'def-greenfield',
        kind: 'deferred',
        checkable: false,
        label: 'Greenfield orgs / conflicts / QR membership product',
        detail: 'Forks product away from Configure → Verify → Facilitate → Release.',
      },
      {
        id: 'def-resend',
        kind: 'deferred',
        checkable: false,
        label: 'Live Resend without secrets',
        detail: 'Scaffolded; ops must set RESEND_* + SITE_URL.',
      },
      {
        id: 'def-tsa',
        kind: 'deferred',
        checkable: false,
        label: 'Live RFC 3161 TSA',
        detail: 'Scaffold columns only until a production TSA path exists.',
      },
      {
        id: 'def-e2e',
        kind: 'deferred',
        checkable: false,
        label: 'Operator-blind room E2E',
        detail: 'Threat model §13 — separate program. Rooms are operator-readable today.',
      },
      {
        id: 'def-pdf',
        kind: 'deferred',
        checkable: false,
        label: 'PDF report microservice',
        detail: 'Not required for a private anchored memo.',
      },
      {
        id: 'def-captcha',
        kind: 'deferred',
        checkable: false,
        label: 'CAPTCHA / SMTP dashboard',
        detail: 'Configure at Supabase Auth / Resend as needed — not product surfaces.',
      },
      {
        id: 'def-remote-push',
        kind: 'deferred',
        checkable: false,
        label: 'Remote supabase db push / production deploy from this checklist',
        detail: 'Needs human credentials — use the go-live steps above.',
      },
    ],
  },
] as const;

/** Items facilitators can check off locally (progress denominator). */
export function getCheckablePilotItemIds(
  sections: readonly PilotChecklistSection[] = PILOT_READINESS_SECTIONS,
): readonly string[] {
  return sections.flatMap((section) =>
    section.items.filter((item) => item.checkable).map((item) => item.id),
  );
}

export const PILOT_CHECKABLE_ITEM_IDS = getCheckablePilotItemIds();
