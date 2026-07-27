/**
 * App.v2.tsx — Redesign router (redesign/v2 branch)
 *
 * Phase 1: Public shell, marketing pages, error pages.
 * Phase 2: Authenticated shell, facilitator dashboard, session setup,
 *          participant invite, live room, outcome drafting, sessions list.
 * Phase 3: Extended public pages (about, faq, privacy, terms, security,
 *          use-cases, ledger index + record), facilitator sub-pages,
 *          participant flow pages.
 * Phases 5-8: All routes wired; barrel exports added; app is runnable.
 *
 * To activate the redesign, swap the import in main.tsx:
 *   import App from './App.v2';
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SessionTimeoutWarning } from './components/auth/SessionTimeoutWarning';
import {
  RequireAuth,
  RequireModerator,
  ScrollToTop,
  SentryNavigationListener,
  Toaster,
  GrainOverlay,
} from './components';
import { ScrollExtremesControl } from './components/ScrollExtremesControl';
import { AuthGate } from './components/auth/AuthGate';
import { ActiveUserGate } from './components/auth/ActiveUserGate';
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';
import { DeckAccessGate } from './components/auth/DeckAccessGate';
import { AdminLayout } from './components/admin/AdminLayout';
import { SettingsLayout } from './components/settings/SettingsLayout';
import { PublicShell } from './components/layout/PublicShell';
import { AuthenticatedShell } from './components/layout/AuthenticatedShell';
import { AppTopShell } from './components/layout/AppTopShell';
import { DemoWalkthroughProvider } from './demo/DemoWalkthroughContext';

// ── Eager critical path (first paint + auth) ─────────────────────────────────
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { SignInPage } from './pages/SignInPage';
import { SupabaseHealthPage } from './pages/SupabaseHealthPage';
import { LandingPage } from './pages/v2/LandingPage';
import { MaintenancePage } from './pages/v2/MaintenancePage';
import { isMaintenanceMode } from './lib/env';
import { LegacyAppRedirect } from './components/routing/LegacyAppRedirect';
import { appRoutes } from './lib/appRoutes';

// ── Lazy routes — keep marketing/app/participant chunks off the home bundle ──
const InvitePage = lazy(() =>
  import('./pages/InvitePage').then((m) => ({ default: m.InvitePage })),
);
const StaffInviteAcceptPage = lazy(() =>
  import('./pages/StaffInviteAcceptPage').then((m) => ({ default: m.StaffInviteAcceptPage })),
);
const InviteCompletePage = lazy(() =>
  import('./pages/InviteCompletePage').then((m) => ({ default: m.InviteCompletePage })),
);
const SettingsIndexPage = lazy(() =>
  import('./pages/SettingsIndexPage').then((m) => ({ default: m.SettingsIndexPage })),
);
const SafetyCenterPage = lazy(() =>
  import('./pages/SafetyCenterPage').then((m) => ({ default: m.SafetyCenterPage })),
);
const NotificationsSettingsPage = lazy(() =>
  import('./pages/NotificationsSettingsPage').then((m) => ({
    default: m.NotificationsSettingsPage,
  })),
);
const ProfileSettingsPage = lazy(() =>
  import('./pages/ProfileSettingsPage').then((m) => ({ default: m.ProfileSettingsPage })),
);
const AdminReportsPage = lazy(() =>
  import('./pages/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })),
);
const AdminVerificationPage = lazy(() =>
  import('./pages/admin/AdminVerificationPage').then((m) => ({
    default: m.AdminVerificationPage,
  })),
);
const AdminRoomsPage = lazy(() =>
  import('./pages/admin/AdminRoomsPage').then((m) => ({ default: m.AdminRoomsPage })),
);
const AdminLogsPage = lazy(() =>
  import('./pages/admin/AdminLogsPage').then((m) => ({ default: m.AdminLogsPage })),
);
const AdminDemoPage = lazy(() =>
  import('./pages/admin/AdminDemoPage').then((m) => ({ default: m.AdminDemoPage })),
);
const AdminCsiPage = lazy(() =>
  import('./pages/admin/AdminCsiPage').then((m) => ({ default: m.AdminCsiPage })),
);
const AdminInvitesPage = lazy(() =>
  import('./pages/admin/AdminInvitesPage').then((m) => ({ default: m.AdminInvitesPage })),
);
const SuperAdminDashboardPage = lazy(() =>
  import('./pages/dashboards/SuperAdminDashboardPage').then((m) => ({
    default: m.SuperAdminDashboardPage,
  })),
);
const InstitutionAdminDashboardPage = lazy(() =>
  import('./pages/dashboards/InstitutionAdminDashboardPage').then((m) => ({
    default: m.InstitutionAdminDashboardPage,
  })),
);
const MediatorDashboardPage = lazy(() =>
  import('./pages/dashboards/MediatorDashboardPage').then((m) => ({
    default: m.MediatorDashboardPage,
  })),
);
const AnalystDashboardPage = lazy(() =>
  import('./pages/dashboards/AnalystDashboardPage').then((m) => ({
    default: m.AnalystDashboardPage,
  })),
);
const ParticipantDashboardPage = lazy(() =>
  import('./pages/dashboards/ParticipantDashboardPage').then((m) => ({
    default: m.ParticipantDashboardPage,
  })),
);
const ModeratorDashboardPage = lazy(() =>
  import('./pages/dashboards/ModeratorDashboardPage').then((m) => ({
    default: m.ModeratorDashboardPage,
  })),
);
const ObserverDashboardPage = lazy(() =>
  import('./pages/dashboards/ObserverDashboardPage').then((m) => ({
    default: m.ObserverDashboardPage,
  })),
);
const AccessPendingPage = lazy(() =>
  import('./pages/v2/AccessPendingPage').then((m) => ({ default: m.AccessPendingPage })),
);
const DecksPage = lazy(() =>
  import('./pages/v2/DecksPage').then((m) => ({ default: m.DecksPage })),
);
const DeckViewerPage = lazy(() =>
  import('./pages/v2/DecksPage').then((m) => ({ default: m.DeckViewerPage })),
);
const HowItWorksPage = lazy(() =>
  import('./pages/v2/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage })),
);
const RequestAccessPage = lazy(() =>
  import('./pages/v2/RequestAccessPage').then((m) => ({ default: m.RequestAccessPage })),
);
const BriefingsPage = lazy(() =>
  import('./pages/v2/BriefingsPage').then((m) => ({ default: m.BriefingsPage })),
);
const AboutPage = lazy(() =>
  import('./pages/v2/AboutPage').then((m) => ({ default: m.AboutPage })),
);
const FaqPage = lazy(() => import('./pages/v2/FaqPage').then((m) => ({ default: m.FaqPage })));
const PrivacyPage = lazy(() =>
  import('./pages/v2/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
);
const TermsPage = lazy(() =>
  import('./pages/v2/TermsPage').then((m) => ({ default: m.TermsPage })),
);
const SecurityPage = lazy(() =>
  import('./pages/v2/SecurityPage').then((m) => ({ default: m.SecurityPage })),
);
const UseCasesPage = lazy(() =>
  import('./pages/v2/UseCasesPage').then((m) => ({ default: m.UseCasesPage })),
);
const LedgerIndexPage = lazy(() =>
  import('./pages/v2/LedgerIndexPage').then((m) => ({ default: m.LedgerIndexPage })),
);
const LedgerRecordPage = lazy(() =>
  import('./pages/v2/LedgerRecordPage').then((m) => ({ default: m.LedgerRecordPage })),
);
const LedgerVerifyPage = lazy(() =>
  import('./pages/v2/LedgerVerifyPage').then((m) => ({ default: m.LedgerVerifyPage })),
);
const FacilitatorDashboardPage = lazy(() =>
  import('./pages/v2/FacilitatorDashboardPage').then((m) => ({
    default: m.FacilitatorDashboardPage,
  })),
);
const SessionsListPage = lazy(() =>
  import('./pages/v2/SessionsListPage').then((m) => ({ default: m.SessionsListPage })),
);
const ParticipantInvitePage = lazy(() =>
  import('./pages/v2/ParticipantInvitePage').then((m) => ({ default: m.ParticipantInvitePage })),
);
const ReleaseGatePage = lazy(() =>
  import('./pages/v2/ReleaseGatePage').then((m) => ({ default: m.ReleaseGatePage })),
);
const EnterCredentialPage = lazy(() =>
  import('./pages/v2/EnterCredentialPage').then((m) => ({ default: m.EnterCredentialPage })),
);
const DemoHubPage = lazy(() =>
  import('./pages/demo/DemoHubPage').then((m) => ({ default: m.DemoHubPage })),
);
const DemoStartPage = lazy(() =>
  import('./pages/demo/DemoStartPage').then((m) => ({ default: m.DemoStartPage })),
);
const EnterQrPage = lazy(() =>
  import('./pages/v2/EnterQrPage').then((m) => ({ default: m.EnterQrPage })),
);
const ExecutiveGovernancePage = lazy(() =>
  import('./pages/dashboards/ExecutiveGovernancePage').then((m) => ({
    default: m.ExecutiveGovernancePage,
  })),
);
const AppLedgerDashboardPage = lazy(() =>
  import('./pages/dashboards/AppLedgerDashboardPage').then((m) => ({
    default: m.AppLedgerDashboardPage,
  })),
);
const SessionNewPage = lazy(() =>
  import('./pages/v2/facilitator/SessionNewPage').then((m) => ({ default: m.SessionNewPage })),
);
const ParticipantsReviewPage = lazy(() =>
  import('./pages/v2/facilitator/ParticipantsReviewPage').then((m) => ({
    default: m.ParticipantsReviewPage,
  })),
);
const SessionControlPage = lazy(() =>
  import('./pages/v2/facilitator/SessionControlPage').then((m) => ({
    default: m.SessionControlPage,
  })),
);
const OutcomeWorkspacePage = lazy(() =>
  import('./pages/v2/facilitator/OutcomeWorkspacePage').then((m) => ({
    default: m.OutcomeWorkspacePage,
  })),
);
const OutcomeReleasePage = lazy(() =>
  import('./pages/v2/facilitator/OutcomeReleasePage').then((m) => ({
    default: m.OutcomeReleasePage,
  })),
);
const PilotGuidePage = lazy(() =>
  import('./pages/v2/PilotGuidePage').then((m) => ({ default: m.PilotGuidePage })),
);
const InviteAcceptancePage = lazy(() =>
  import('./pages/v2/participant/InviteAcceptancePage').then((m) => ({
    default: m.InviteAcceptancePage,
  })),
);
const VerificationStepPage = lazy(() =>
  import('./pages/v2/participant/VerificationStepPage').then((m) => ({
    default: m.VerificationStepPage,
  })),
);
const ConsentPage = lazy(() =>
  import('./pages/v2/participant/ConsentPage').then((m) => ({ default: m.ConsentPage })),
);
const SessionBriefingPage = lazy(() =>
  import('./pages/v2/participant/SessionBriefingPage').then((m) => ({
    default: m.SessionBriefingPage,
  })),
);
const WaitingRoomPage = lazy(() =>
  import('./pages/v2/participant/WaitingRoomPage').then((m) => ({ default: m.WaitingRoomPage })),
);
const ParticipantRoomPage = lazy(() =>
  import('./pages/v2/participant/ParticipantRoomPage').then((m) => ({
    default: m.ParticipantRoomPage,
  })),
);
const OutcomeReviewPage = lazy(() =>
  import('./pages/v2/participant/OutcomeReviewPage').then((m) => ({
    default: m.OutcomeReviewPage,
  })),
);
const SessionEndPage = lazy(() =>
  import('./pages/v2/participant/SessionEndPage').then((m) => ({ default: m.SessionEndPage })),
);
const InviteInvalidPage = lazy(() =>
  import('./pages/v2/participant/InviteInvalidPage').then((m) => ({
    default: m.InviteInvalidPage,
  })),
);
const SessionDetailPage = lazy(() =>
  import('./pages/v2/SessionDetailPage').then((m) => ({ default: m.SessionDetailPage })),
);
const ParticipantsIndexPage = lazy(() =>
  import('./pages/v2/ParticipantsIndexPage').then((m) => ({ default: m.ParticipantsIndexPage })),
);
const InsightsPage = lazy(() =>
  import('./pages/v2/InsightsPage').then((m) => ({ default: m.InsightsPage })),
);
const ContactPage = lazy(() =>
  import('./pages/v2/ContactPage').then((m) => ({ default: m.ContactPage })),
);
const PricingPage = lazy(() =>
  import('./pages/v2/PricingPage').then((m) => ({ default: m.PricingPage })),
);
const RoadmapPage = lazy(() =>
  import('./pages/v2/RoadmapPage').then((m) => ({ default: m.RoadmapPage })),
);
const PipelinePage = lazy(() =>
  import('./pages/v2/PipelinePage').then((m) => ({ default: m.PipelinePage })),
);
const NotFoundPage = lazy(() =>
  import('./pages/v2/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);
const AccessDeniedPage = lazy(() =>
  import('./pages/v2/AccessDeniedPage').then((m) => ({ default: m.AccessDeniedPage })),
);
const routeChunkFallback = (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className="mx-auto flex w-full max-w-shell flex-col gap-4 px-gutter py-16"
  >
    <span className="sr-only">Loading page content.</span>
    <div className="h-3 w-24 rounded-sm bg-surface-sunken motion-safe:animate-pulse" aria-hidden />
    <div
      className="h-8 w-2/3 max-w-md rounded-sm bg-surface-sunken motion-safe:animate-pulse"
      aria-hidden
    />
    <div
      className="mt-2 h-32 w-full max-w-2xl rounded-[var(--sr-radius-md)] bg-surface-sunken/60 motion-safe:animate-pulse"
      aria-hidden
    />
  </div>
);

const PitchDeckHubPage = lazy(() =>
  import('./pages/PitchDeckHubPage').then((m) => ({ default: m.PitchDeckHubPage })),
);

const FinancialProjectionsPage = lazy(() =>
  import('./pages/FinancialProjectionsPage').then((m) => ({
    default: m.FinancialProjectionsPage,
  })),
);

function SessionRoomLegacyRedirect() {
  const { sessionId } = useParams<{ sessionId: string }>();
  return <Navigate to={appRoutes.sessionControl(sessionId ?? '')} replace />;
}

function OutcomesLegacyRedirect() {
  return <Navigate to={appRoutes.sessions} replace />;
}

export default function AppV2() {
  if (isMaintenanceMode()) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/health" element={<SupabaseHealthPage />} />
          <Route path="*" element={<MaintenancePage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <SentryNavigationListener />
      <ScrollToTop />
      <DemoWalkthroughProvider>
        <AuthProvider>
          <SessionTimeoutWarning />
          <Toaster position="top-center" richColors closeButton className="font-sans" />
          <AuthGate>
            <Suspense fallback={routeChunkFallback}>
              <Routes>
                {/* Legacy citizen onboarding — soft-retired; pilot funnel is request-access */}
                <Route path="/onboarding" element={<Navigate to="/request-access" replace />} />
                <Route
                  path="/onboarding/:stepId"
                  element={<Navigate to="/request-access" replace />}
                />

                {/* Legacy facilitator paths → /app namespace */}
                <Route path="/f/dashboard" element={<Navigate to="/app" replace />} />
                <Route path="/f/sessions" element={<Navigate to="/app/sessions" replace />} />
                <Route
                  path="/f/participants"
                  element={<Navigate to="/app/participants" replace />}
                />
                <Route path="/f/settings" element={<Navigate to="/app/settings" replace />} />
                <Route path="/dashboard" element={<Navigate to="/app" replace />} />
                <Route
                  path="/sessions/*"
                  element={<LegacyAppRedirect fromPrefix="/sessions" toPrefix="/app/sessions" />}
                />
                <Route path="/participants" element={<Navigate to="/app/participants" replace />} />
                <Route
                  path="/outcomes/*"
                  element={<LegacyAppRedirect fromPrefix="/outcomes" toPrefix="/app/outcomes" />}
                />

                {/* ── Participant flow (unauthenticated token-gated) ─────────── */}
                <Route path="/p/invalid" element={<InviteInvalidPage />} />
                {/* These sit outside AuthenticatedShell — participants use        */}
                {/* magic-link tokens, not full auth sessions.                    */}
                <Route path="/p/invite/:token" element={<InviteAcceptancePage />} />
                <Route path="/p/verify/:token" element={<VerificationStepPage />} />
                <Route path="/p/consent/:token" element={<ConsentPage />} />
                <Route path="/p/briefing/:token" element={<SessionBriefingPage />} />
                <Route path="/p/waiting/:token" element={<WaitingRoomPage />} />
                <Route path="/p/room/:token" element={<ParticipantRoomPage />} />
                <Route path="/p/review/:token" element={<OutcomeReviewPage />} />
                <Route path="/p/done/:token" element={<SessionEndPage />} />

                {/* ── Investor / partner briefings (invite or super_admin) ── */}
                <Route
                  element={
                    <RequireAuth>
                      <DeckAccessGate>
                        <AppTopShell>
                          <Outlet />
                        </AppTopShell>
                      </DeckAccessGate>
                    </RequireAuth>
                  }
                >
                  <Route path="/decks" element={<DecksPage />} />
                  <Route path="/decks/:deckId" element={<DeckViewerPage />} />
                  <Route
                    path="/pitch-deck-hub"
                    element={
                      <Suspense fallback={routeChunkFallback}>
                        <PitchDeckHubPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/financial-projections"
                    element={
                      <Suspense fallback={routeChunkFallback}>
                        <FinancialProjectionsPage />
                      </Suspense>
                    }
                  />
                </Route>

                {/* ── V2 Authenticated Shell ────────────────────────────────── */}
                {/* /app/* is facilitator-scoped — participants land on /app/participant */}
                {/* Phase 4: parent gate widened to ALL authenticated roles. Every  */}
                {/* facilitator-scoped route below carries its own narrower           */}
                {/* RoleProtectedRoute, and each of the 7 roles now has a landing     */}
                {/* dashboard at /app/{role} matching ROLE_DASHBOARD_MAP. Server-side */}
                {/* RLS remains authoritative. See                                    */}
                {/* docs/audit/auth-and-dashboards-audit.md.                          */}
                <Route
                  element={
                    <RequireAuth>
                      <ActiveUserGate>
                        <AuthenticatedShell>
                          <Outlet />
                        </AuthenticatedShell>
                      </ActiveUserGate>
                    </RequireAuth>
                  }
                >
                  {/* /app — historical facilitator dashboard landing */}
                  <Route
                    path="/app"
                    element={
                      <RoleProtectedRoute
                        allowed={['super_admin', 'institution_admin', 'facilitator', 'mediator']}
                      >
                        <FacilitatorDashboardPage />
                      </RoleProtectedRoute>
                    }
                  />

                  {/* Per-role landing pages — one per role, each with its own gate */}
                  <Route
                    path="/app/admin"
                    element={
                      <RoleProtectedRoute allowed={['super_admin']}>
                        <SuperAdminDashboardPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/institution"
                    element={
                      <RoleProtectedRoute allowed={['super_admin', 'institution_admin']}>
                        <InstitutionAdminDashboardPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/facilitator"
                    element={
                      <RoleProtectedRoute
                        allowed={['super_admin', 'institution_admin', 'facilitator']}
                      >
                        <FacilitatorDashboardPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/mediator"
                    element={
                      <RoleProtectedRoute allowed={['super_admin', 'mediator']}>
                        <MediatorDashboardPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/analyst"
                    element={
                      <RoleProtectedRoute allowed={['super_admin', 'analyst']}>
                        <AnalystDashboardPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/participant"
                    element={
                      <RoleProtectedRoute allowed={['super_admin', 'participant', 'facilitator']}>
                        <ParticipantDashboardPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/moderator"
                    element={
                      <RoleProtectedRoute
                        allowed={['super_admin', 'institution_admin', 'facilitator']}
                      >
                        <ModeratorDashboardPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/observer"
                    element={
                      <RoleProtectedRoute allowed={['super_admin', 'observer']}>
                        <ObserverDashboardPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/executive"
                    element={
                      <RoleProtectedRoute
                        allowed={['super_admin', 'institution_admin', 'observer']}
                      >
                        <ExecutiveGovernancePage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route path="/app/ombuds" element={<Navigate to="/app/mediator" replace />} />
                  <Route
                    path="/app/release-gate"
                    element={
                      <RoleProtectedRoute
                        allowed={['super_admin', 'institution_admin', 'facilitator', 'mediator']}
                      >
                        <ReleaseGatePage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route path="/app/ledger" element={<AppLedgerDashboardPage />} />

                  {/* Session workflow — facilitator-side roles only */}
                  <Route
                    element={
                      <RoleProtectedRoute
                        allowed={['super_admin', 'institution_admin', 'facilitator', 'mediator']}
                      >
                        <Outlet />
                      </RoleProtectedRoute>
                    }
                  >
                    <Route path="/app/sessions" element={<SessionsListPage />} />
                    <Route path="/app/pilot-guide" element={<PilotGuidePage />} />
                    <Route
                      path="/app/sessions/new"
                      element={<Navigate to="/app/sessions/new/setup" replace />}
                    />
                    <Route path="/app/sessions/new/setup" element={<SessionNewPage />} />
                    <Route path="/app/sessions/:sessionId" element={<SessionDetailPage />} />
                    <Route
                      path="/app/sessions/:sessionId/invite"
                      element={<ParticipantInvitePage />}
                    />
                    <Route
                      path="/app/sessions/:sessionId/room"
                      element={<SessionRoomLegacyRedirect />}
                    />
                    <Route
                      path="/app/sessions/:sessionId/participants"
                      element={<ParticipantsReviewPage />}
                    />
                    <Route
                      path="/app/sessions/:sessionId/control"
                      element={<SessionControlPage />}
                    />
                    <Route
                      path="/app/sessions/:sessionId/outcome"
                      element={<OutcomeWorkspacePage />}
                    />
                    <Route
                      path="/app/sessions/:sessionId/release"
                      element={<OutcomeReleasePage />}
                    />
                    <Route path="/app/participants" element={<ParticipantsIndexPage />} />
                    <Route path="/app/outcomes/new" element={<OutcomesLegacyRedirect />} />
                    <Route path="/app/outcomes/:outcomeId" element={<OutcomesLegacyRedirect />} />
                  </Route>

                  {/* Insights — facilitator-side + analyst */}
                  <Route
                    path="/app/insights"
                    element={
                      <RoleProtectedRoute
                        allowed={[
                          'super_admin',
                          'institution_admin',
                          'facilitator',
                          'mediator',
                          'analyst',
                        ]}
                      >
                        <InsightsPage />
                      </RoleProtectedRoute>
                    }
                  />

                  {/* Settings — keep chrome inside AuthenticatedShell */}
                  <Route path="/app/settings" element={<SettingsLayout />}>
                    <Route index element={<SettingsIndexPage />} />
                    <Route path="profile" element={<ProfileSettingsPage />} />
                    <Route path="safety" element={<SafetyCenterPage />} />
                    <Route path="notifications" element={<NotificationsSettingsPage />} />
                  </Route>

                  {/* Admin invites console — super_admin + institution_admin only */}
                  <Route
                    path="/app/admin/invites"
                    element={
                      <RoleProtectedRoute allowed={['super_admin', 'institution_admin']}>
                        <AdminInvitesPage />
                      </RoleProtectedRoute>
                    }
                  />
                </Route>

                {/* ── V2 Public Shell ──────────────────────────────────────── */}
                <Route
                  element={
                    <PublicShell>
                      <Outlet />
                    </PublicShell>
                  }
                >
                  {/* Public marketing */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/use-cases" element={<UseCasesPage />} />
                  <Route path="/request-access" element={<RequestAccessPage />} />
                  <Route
                    path="/request-access/confirmed"
                    element={<Navigate to="/request-access" replace />}
                  />
                  <Route path="/briefings" element={<BriefingsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/security" element={<SecurityPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/roadmap" element={<RoadmapPage />} />
                  <Route path="/pipeline" element={<PipelinePage />} />
                  {/* Diligence alias — prefer /pipeline label over "traction" */}
                  <Route path="/traction" element={<Navigate to="/pipeline" replace />} />

                  {/* Ledger (public outcome records) */}
                  <Route path="/ledger" element={<LedgerIndexPage />} />
                  <Route path="/ledger/:recordId/verify" element={<LedgerVerifyPage />} />
                  <Route path="/ledger/:recordId" element={<LedgerRecordPage />} />

                  {/* Legacy ledger routes → v2 ledger */}
                  <Route
                    path="/ledger/:proposalId/legacy"
                    element={<Navigate to="/ledger" replace />}
                  />

                  {/* Redirects for legacy paths */}
                  <Route path="/login" element={<Navigate to="/sign-in" replace />} />
                  <Route
                    path="/sign-up"
                    element={<Navigate to="/sign-in?intent=signup" replace />}
                  />
                  <Route
                    path="/forgot-password"
                    element={<Navigate to="/sign-in?reason=link" replace />}
                  />
                  {/* Legacy citizen matchmaking / ZK — soft-retired (code kept, not product story) */}
                  <Route path="/intent" element={<Navigate to="/request-access" replace />} />
                  <Route path="/match-setup" element={<Navigate to="/request-access" replace />} />
                  <Route path="/find-squad" element={<Navigate to="/request-access" replace />} />
                  <Route path="/match" element={<Navigate to="/request-access" replace />} />
                  <Route path="/verify" element={<Navigate to="/request-access" replace />} />
                  <Route path="/mod" element={<Navigate to="/admin/rooms" replace />} />

                  {/* Auth (existing pages, new shell) */}
                  <Route path="/sign-in" element={<SignInPage />} />
                  <Route path="/demo" element={<DemoHubPage />} />
                  <Route path="/demo/start" element={<DemoStartPage />} />
                  <Route path="/enter/credential" element={<EnterCredentialPage />} />
                  <Route path="/enter/qr" element={<EnterQrPage />} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route path="/invite/accept/:token" element={<StaffInviteAcceptPage />} />
                  <Route path="/invite/complete" element={<InviteCompletePage />} />
                  <Route path="/invite" element={<InvitePage />} />

                  {/* Legacy proposal ledger → v2 ledger */}
                  <Route path="/ledger-legacy" element={<Navigate to="/ledger" replace />} />
                  <Route
                    path="/ledger-legacy/:proposalId"
                    element={<Navigate to="/ledger" replace />}
                  />

                  {/* Settings — legacy URL → in-shell settings */}
                  <Route path="/settings/*" element={<Navigate to="/app/settings" replace />} />
                  <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

                  {/* Admin (existing pages, new shell) */}
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

                  {/* Legacy squad session hub — soft-retired (demo flag no longer mounts room UI) */}
                  <Route path="/session/demo-session-001" element={<Navigate to="/" replace />} />
                  <Route path="/session/demo" element={<Navigate to="/" replace />} />
                  <Route path="/session/:squadId?" element={<Navigate to="/" replace />} />

                  {/* Error pages */}
                  <Route path="/unauthorized" element={<AccessDeniedPage />} />
                  <Route path="/access-denied" element={<Navigate to="/unauthorized" replace />} />
                  {/* Phase 4: landing for signed-in users whose profile is still */}
                  {/* pending review — returned by useDashboardRoute.             */}
                  <Route
                    path="/access-pending"
                    element={
                      <RequireAuth>
                        <AccessPendingPage />
                      </RequireAuth>
                    }
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </AuthGate>
        </AuthProvider>
      </DemoWalkthroughProvider>
      <GrainOverlay />
      <ScrollExtremesControl />
    </BrowserRouter>
  );
}
