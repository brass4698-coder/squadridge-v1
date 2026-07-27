/**
 * App.v2.tsx — Redesign router (redesign/v2 branch)
 *
 * Route pages are lazy-loaded so the landing shell stays lean on first paint.
 * Landing + error pages stay eager for LCP / instant 404.
 */
import { lazy, Suspense, type ComponentType } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import {
  RequireAuth,
  RequireModerator,
  ScrollToTop,
  SentryNavigationListener,
  SessionAccess,
  Toaster,
} from './components';
import { AdminLayout } from './components/admin/AdminLayout';
import { SettingsLayout } from './components/settings/SettingsLayout';
import { PublicShell } from './components/layout/PublicShell';
import { AuthenticatedShell } from './components/layout/AuthenticatedShell';
import { BrandPresenceLoader } from './components/ui/BrandPresenceLoader';
import { isDemoSquadShortcutsEnabled } from './lib/env';
import { DemoWalkthroughProvider } from './demo/DemoWalkthroughContext';

// Eager: first paint + common error states
import { LandingPage } from './pages/v2/LandingPage';
import { NotFoundPage } from './pages/v2/NotFoundPage';
import { AccessDeniedPage } from './pages/v2/AccessDeniedPage';

const routeChunkFallback = (
  <BrandPresenceLoader variant="full" label="Loading…" phrase="Opening page" />
);

/** Lazy-load a named page export without forcing default-export churn. */
function lazyNamed<T extends ComponentType<unknown>>(
  factory: () => Promise<Record<string, T>>,
  exportName: string,
) {
  return lazy(async () => {
    const mod = await factory();
    const Comp = mod[exportName];
    if (!Comp) {
      throw new Error(`Missing export "${exportName}" in lazy route module`);
    }
    return { default: Comp };
  });
}

// ── Marketing / public (lazy) ────────────────────────────────────────────────
const HowItWorksPage = lazyNamed(() => import('./pages/v2/HowItWorksPage'), 'HowItWorksPage');
const RequestAccessPage = lazyNamed(
  () => import('./pages/v2/RequestAccessPage'),
  'RequestAccessPage',
);
const AboutPage = lazyNamed(() => import('./pages/v2/AboutPage'), 'AboutPage');
const FaqPage = lazyNamed(() => import('./pages/v2/FaqPage'), 'FaqPage');
const PrivacyPage = lazyNamed(() => import('./pages/v2/PrivacyPage'), 'PrivacyPage');
const TermsPage = lazyNamed(() => import('./pages/v2/TermsPage'), 'TermsPage');
const SecurityPage = lazyNamed(() => import('./pages/v2/SecurityPage'), 'SecurityPage');
const UseCasesPage = lazyNamed(() => import('./pages/v2/UseCasesPage'), 'UseCasesPage');
const LedgerIndexPage = lazyNamed(() => import('./pages/v2/LedgerIndexPage'), 'LedgerIndexPage');
const LedgerRecordPage = lazyNamed(() => import('./pages/v2/LedgerRecordPage'), 'LedgerRecordPage');

// ── Auth / account ───────────────────────────────────────────────────────────
const SignInPage = lazyNamed(() => import('./pages/SignInPage'), 'SignInPage');
const AuthCallbackPage = lazyNamed(() => import('./pages/AuthCallbackPage'), 'AuthCallbackPage');
const VerificationPage = lazyNamed(() => import('./pages/VerificationPage'), 'VerificationPage');
const InvitePage = lazyNamed(() => import('./pages/InvitePage'), 'InvitePage');
const SettingsIndexPage = lazyNamed(() => import('./pages/SettingsIndexPage'), 'SettingsIndexPage');
const SafetyCenterPage = lazyNamed(() => import('./pages/SafetyCenterPage'), 'SafetyCenterPage');
const NotificationsSettingsPage = lazyNamed(
  () => import('./pages/NotificationsSettingsPage'),
  'NotificationsSettingsPage',
);
const ProfileSettingsPage = lazyNamed(
  () => import('./pages/ProfileSettingsPage'),
  'ProfileSettingsPage',
);

// ── Facilitator / sessions ───────────────────────────────────────────────────
const FacilitatorDashboardPage = lazyNamed(
  () => import('./pages/v2/FacilitatorDashboardPage'),
  'FacilitatorDashboardPage',
);
const SessionSetupPage = lazyNamed(() => import('./pages/v2/SessionSetupPage'), 'SessionSetupPage');
const SessionsListPage = lazyNamed(() => import('./pages/v2/SessionsListPage'), 'SessionsListPage');
const ParticipantInvitePage = lazyNamed(
  () => import('./pages/v2/ParticipantInvitePage'),
  'ParticipantInvitePage',
);
const LiveRoomPage = lazyNamed(() => import('./pages/v2/LiveRoomPage'), 'LiveRoomPage');
const OutcomeDraftingPage = lazyNamed(
  () => import('./pages/v2/OutcomeDraftingPage'),
  'OutcomeDraftingPage',
);
const SessionNewPage = lazyNamed(
  () => import('./pages/v2/facilitator/SessionNewPage'),
  'SessionNewPage',
);
const ParticipantsReviewPage = lazyNamed(
  () => import('./pages/v2/facilitator/ParticipantsReviewPage'),
  'ParticipantsReviewPage',
);
const SessionControlPage = lazyNamed(
  () => import('./pages/v2/facilitator/SessionControlPage'),
  'SessionControlPage',
);
const OutcomeWorkspacePage = lazyNamed(
  () => import('./pages/v2/facilitator/OutcomeWorkspacePage'),
  'OutcomeWorkspacePage',
);
const OutcomeReleasePage = lazyNamed(
  () => import('./pages/v2/facilitator/OutcomeReleasePage'),
  'OutcomeReleasePage',
);

// ── Participant token flow ───────────────────────────────────────────────────
const InviteAcceptancePage = lazyNamed(
  () => import('./pages/v2/participant/InviteAcceptancePage'),
  'InviteAcceptancePage',
);
const VerificationStepPage = lazyNamed(
  () => import('./pages/v2/participant/VerificationStepPage'),
  'VerificationStepPage',
);
const ConsentPage = lazyNamed(() => import('./pages/v2/participant/ConsentPage'), 'ConsentPage');
const SessionBriefingPage = lazyNamed(
  () => import('./pages/v2/participant/SessionBriefingPage'),
  'SessionBriefingPage',
);
const WaitingRoomPage = lazyNamed(
  () => import('./pages/v2/participant/WaitingRoomPage'),
  'WaitingRoomPage',
);
const ParticipantRoomPage = lazyNamed(
  () => import('./pages/v2/participant/ParticipantRoomPage'),
  'ParticipantRoomPage',
);
const SessionEndPage = lazyNamed(
  () => import('./pages/v2/participant/SessionEndPage'),
  'SessionEndPage',
);

// ── Admin / ops ──────────────────────────────────────────────────────────────
const AdminReportsPage = lazyNamed(
  () => import('./pages/admin/AdminReportsPage'),
  'AdminReportsPage',
);
const AdminVerificationPage = lazyNamed(
  () => import('./pages/admin/AdminVerificationPage'),
  'AdminVerificationPage',
);
const AdminRoomsPage = lazyNamed(() => import('./pages/admin/AdminRoomsPage'), 'AdminRoomsPage');
const AdminLogsPage = lazyNamed(() => import('./pages/admin/AdminLogsPage'), 'AdminLogsPage');
const AdminDemoPage = lazyNamed(() => import('./pages/admin/AdminDemoPage'), 'AdminDemoPage');
const AdminCsiPage = lazyNamed(() => import('./pages/admin/AdminCsiPage'), 'AdminCsiPage');
const SupabaseHealthPage = lazyNamed(
  () => import('./pages/SupabaseHealthPage'),
  'SupabaseHealthPage',
);
const DemoSessionPage = lazyNamed(() => import('./pages/DemoSessionPage'), 'DemoSessionPage');

const OnboardingApp = lazy(() =>
  import('./onboarding/app/components/onboarding/Onboarding').then((m) => ({
    default: m.Onboarding,
  })),
);

const LedgerPage = lazy(() =>
  import('./pages/LedgerPage').then((m) => ({ default: m.LedgerPage })),
);

export default function AppV2() {
  return (
    <BrowserRouter>
      <SentryNavigationListener />
      <ScrollToTop />
      <DemoWalkthroughProvider>
        <AuthProvider>
          <Toaster position="top-center" richColors closeButton className="font-sans" />
          <Suspense fallback={routeChunkFallback}>
            <Routes>
              <Route path="/onboarding" element={<Navigate to="/onboarding/mission" replace />} />
              <Route path="/onboarding/:stepId" element={<OnboardingApp />} />

              {/* Participant flow (token-gated) */}
              <Route path="/p/invite/:token" element={<InviteAcceptancePage />} />
              <Route path="/p/verify/:token" element={<VerificationStepPage />} />
              <Route path="/p/consent/:token" element={<ConsentPage />} />
              <Route path="/p/briefing/:token" element={<SessionBriefingPage />} />
              <Route path="/p/waiting/:token" element={<WaitingRoomPage />} />
              <Route path="/p/room/:token" element={<ParticipantRoomPage />} />
              <Route path="/p/done/:token" element={<SessionEndPage />} />

              {/* Authenticated facilitator shell */}
              <Route
                element={
                  <RequireAuth>
                    <AuthenticatedShell />
                  </RequireAuth>
                }
              >
                <Route path="/dashboard" element={<FacilitatorDashboardPage />} />
                <Route path="/sessions" element={<SessionsListPage />} />
                <Route path="/sessions/new" element={<SessionSetupPage />} />
                <Route path="/sessions/:sessionId/invite" element={<ParticipantInvitePage />} />
                <Route path="/sessions/:sessionId/room" element={<LiveRoomPage />} />
                <Route
                  path="/sessions/:sessionId/participants"
                  element={<ParticipantsReviewPage />}
                />
                <Route path="/sessions/:sessionId/control" element={<SessionControlPage />} />
                <Route path="/sessions/:sessionId/outcome" element={<OutcomeWorkspacePage />} />
                <Route path="/sessions/:sessionId/release" element={<OutcomeReleasePage />} />
                <Route path="/sessions/new/setup" element={<SessionNewPage />} />
                <Route path="/outcomes/new" element={<OutcomeDraftingPage />} />
                <Route path="/outcomes/:outcomeId" element={<OutcomeDraftingPage />} />
              </Route>

              {/* Public shell */}
              <Route element={<PublicShell />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/use-cases" element={<UseCasesPage />} />
                <Route path="/request-access" element={<RequestAccessPage />} />
                <Route
                  path="/request-access/confirmed"
                  element={<Navigate to="/request-access" replace />}
                />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/ledger" element={<LedgerIndexPage />} />
                <Route path="/ledger/:recordId" element={<LedgerRecordPage />} />
                <Route
                  path="/ledger/:proposalId/legacy"
                  element={<Navigate to="/ledger" replace />}
                />
                <Route path="/login" element={<Navigate to="/sign-in" replace />} />
                <Route path="/sign-up" element={<Navigate to="/sign-in" replace />} />
                <Route
                  path="/forgot-password"
                  element={<Navigate to="/sign-in?reason=link" replace />}
                />
                <Route path="/intent" element={<Navigate to="/find-squad" replace />} />
                <Route path="/match-setup" element={<Navigate to="/find-squad" replace />} />
                <Route path="/mod" element={<Navigate to="/admin/rooms" replace />} />
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/verify" element={<VerificationPage />} />
                <Route path="/invite" element={<InvitePage />} />
                <Route path="/ledger-legacy" element={<LedgerPage />} />
                <Route path="/ledger-legacy/:proposalId" element={<LedgerPage />} />
                <Route
                  path="/settings"
                  element={
                    <RequireAuth>
                      <SettingsLayout />
                    </RequireAuth>
                  }
                >
                  <Route index element={<SettingsIndexPage />} />
                  <Route path="profile" element={<ProfileSettingsPage />} />
                  <Route path="safety" element={<SafetyCenterPage />} />
                  <Route path="notifications" element={<NotificationsSettingsPage />} />
                </Route>
                <Route
                  path="/admin"
                  element={
                    <RequireAuth>
                      <RequireModerator>
                        <AdminLayout />
                      </RequireModerator>
                    </RequireAuth>
                  }
                >
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="verification" element={<AdminVerificationPage />} />
                  <Route path="rooms" element={<AdminRoomsPage />} />
                  <Route path="logs" element={<AdminLogsPage />} />
                  <Route path="demo" element={<AdminDemoPage />} />
                  <Route path="health" element={<SupabaseHealthPage />} />
                  <Route path="csi" element={<AdminCsiPage />} />
                  <Route index element={<Navigate to="rooms" replace />} />
                </Route>
                {isDemoSquadShortcutsEnabled() ? (
                  <>
                    <Route path="/session/demo-session-001" element={<DemoSessionPage />} />
                    <Route
                      path="/session/demo"
                      element={<Navigate to="/session/demo-session-001" replace />}
                    />
                  </>
                ) : (
                  <>
                    <Route path="/session/demo-session-001" element={<Navigate to="/" replace />} />
                    <Route path="/session/demo" element={<Navigate to="/" replace />} />
                  </>
                )}
                <Route path="/session/:squadId?" element={<SessionAccess />} />
                <Route path="/access-denied" element={<AccessDeniedPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </DemoWalkthroughProvider>
    </BrowserRouter>
  );
}
