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

// ── Existing pages (preserved) ───────────────────────────────────────────────
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { SignInPage } from './pages/SignInPage';
import { SupabaseHealthPage } from './pages/SupabaseHealthPage';
import { InvitePage } from './pages/InvitePage';
import { StaffInviteAcceptPage } from './pages/StaffInviteAcceptPage';
import { InviteCompletePage } from './pages/InviteCompletePage';
import { SettingsIndexPage } from './pages/SettingsIndexPage';
import { SafetyCenterPage } from './pages/SafetyCenterPage';
import { NotificationsSettingsPage } from './pages/NotificationsSettingsPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminVerificationPage } from './pages/admin/AdminVerificationPage';
import { AdminRoomsPage } from './pages/admin/AdminRoomsPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { AdminDemoPage } from './pages/admin/AdminDemoPage';
import { AdminCsiPage } from './pages/admin/AdminCsiPage';
import { AdminInvitesPage } from './pages/admin/AdminInvitesPage';
// Per-role landing pages (Phase 4 — see docs/audit/auth-and-dashboards-audit.md)
import { SuperAdminDashboardPage } from './pages/dashboards/SuperAdminDashboardPage';
import { InstitutionAdminDashboardPage } from './pages/dashboards/InstitutionAdminDashboardPage';
import { MediatorDashboardPage } from './pages/dashboards/MediatorDashboardPage';
import { AnalystDashboardPage } from './pages/dashboards/AnalystDashboardPage';
import { ParticipantDashboardPage } from './pages/dashboards/ParticipantDashboardPage';
import { ModeratorDashboardPage } from './pages/dashboards/ModeratorDashboardPage';
import { ObserverDashboardPage } from './pages/dashboards/ObserverDashboardPage';
import { AccessPendingPage } from './pages/v2/AccessPendingPage';
// Phase 5 — decks gallery + dedicated dark top-nav shell
import { DecksPage, DeckViewerPage } from './pages/v2/DecksPage';
import { AppTopShell } from './components/layout/AppTopShell';
import { DemoWalkthroughProvider } from './demo/DemoWalkthroughContext';

// ── New v2 pages — Phase 1 (public marketing) ────────────────────────────────
import { LandingPage } from './pages/v2/LandingPage';
import { HowItWorksPage } from './pages/v2/HowItWorksPage';
import { RequestAccessPage } from './pages/v2/RequestAccessPage';
import { BriefingsPage } from './pages/v2/BriefingsPage';
import { AboutPage } from './pages/v2/AboutPage';
import { FaqPage } from './pages/v2/FaqPage';
import { PrivacyPage } from './pages/v2/PrivacyPage';
import { TermsPage } from './pages/v2/TermsPage';
import { SecurityPage } from './pages/v2/SecurityPage';
import { UseCasesPage } from './pages/v2/UseCasesPage';
import { LedgerIndexPage } from './pages/v2/LedgerIndexPage';
import { LedgerRecordPage } from './pages/v2/LedgerRecordPage';
import { LedgerVerifyPage } from './pages/v2/LedgerVerifyPage';
import { NotFoundPage } from './pages/v2/NotFoundPage';
import { AccessDeniedPage } from './pages/v2/AccessDeniedPage';

// ── New v2 pages — Phase 2 (authenticated facilitator core) ──────────────────
import { FacilitatorDashboardPage } from './pages/v2/FacilitatorDashboardPage';
import { SessionsListPage } from './pages/v2/SessionsListPage';
import { ParticipantInvitePage } from './pages/v2/ParticipantInvitePage';
import { ReleaseGatePage } from './pages/v2/ReleaseGatePage';
import { EnterCredentialPage } from './pages/v2/EnterCredentialPage';
import { EnterQrPage } from './pages/v2/EnterQrPage';
import { appRoutes } from './lib/appRoutes';
import { ExecutiveGovernancePage } from './pages/dashboards/ExecutiveGovernancePage';
import { AppLedgerDashboardPage } from './pages/dashboards/AppLedgerDashboardPage';

// ── New v2 pages — Phase 3 (facilitator sub-pages) ───────────────────────────
import { SessionNewPage } from './pages/v2/facilitator/SessionNewPage';
import { ParticipantsReviewPage } from './pages/v2/facilitator/ParticipantsReviewPage';
import { SessionControlPage } from './pages/v2/facilitator/SessionControlPage';
import { OutcomeWorkspacePage } from './pages/v2/facilitator/OutcomeWorkspacePage';
import { OutcomeReleasePage } from './pages/v2/facilitator/OutcomeReleasePage';
import { PilotGuidePage } from './pages/v2/PilotGuidePage';

// ── New v2 pages — Phase 4 (participant flow) ────────────────────────────────
import { InviteAcceptancePage } from './pages/v2/participant/InviteAcceptancePage';
import { VerificationStepPage } from './pages/v2/participant/VerificationStepPage';
import { ConsentPage } from './pages/v2/participant/ConsentPage';
import { SessionBriefingPage } from './pages/v2/participant/SessionBriefingPage';
import { WaitingRoomPage } from './pages/v2/participant/WaitingRoomPage';
import { ParticipantRoomPage } from './pages/v2/participant/ParticipantRoomPage';
import { OutcomeReviewPage } from './pages/v2/participant/OutcomeReviewPage';
import { SessionEndPage } from './pages/v2/participant/SessionEndPage';
import { InviteInvalidPage } from './pages/v2/participant/InviteInvalidPage';

// ── Phase 0 routing ───────────────────────────────────────────────────────────
import { SessionDetailPage } from './pages/v2/SessionDetailPage';
import { ParticipantsIndexPage } from './pages/v2/ParticipantsIndexPage';
import { InsightsPage } from './pages/v2/InsightsPage';
import { LegacyAppRedirect } from './components/routing/LegacyAppRedirect';
import { ContactPage } from './pages/v2/ContactPage';

const routeChunkFallback = (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className="flex min-h-dvh items-center justify-center bg-surface font-sans text-sm text-ink-secondary"
  >
    <span className="sr-only">Loading page content.</span>
    <span aria-hidden="true">Loading…</span>
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
  return (
    <BrowserRouter>
      <SentryNavigationListener />
      <ScrollToTop />
      <DemoWalkthroughProvider>
        <AuthProvider>
          <SessionTimeoutWarning />
          <Toaster position="top-center" richColors closeButton className="font-sans" />
          <AuthGate>
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
              <Route path="/f/participants" element={<Navigate to="/app/participants" replace />} />
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
                    <RoleProtectedRoute allowed={['super_admin', 'institution_admin', 'observer']}>
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
                  <Route path="/app/sessions/:sessionId/control" element={<SessionControlPage />} />
                  <Route
                    path="/app/sessions/:sessionId/outcome"
                    element={<OutcomeWorkspacePage />}
                  />
                  <Route path="/app/sessions/:sessionId/release" element={<OutcomeReleasePage />} />
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
                <Route path="/sign-up" element={<Navigate to="/sign-in?intent=signup" replace />} />
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
          </AuthGate>
        </AuthProvider>
      </DemoWalkthroughProvider>
      <GrainOverlay />
      <ScrollExtremesControl />
    </BrowserRouter>
  );
}
