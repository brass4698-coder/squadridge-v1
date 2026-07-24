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
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { SettingsLayout } from './components/settings/SettingsLayout';
import { PublicShell } from './components/layout/PublicShell';
import { RoleWorkspaceShell } from './components/layout/RoleWorkspaceShell';

// ── Existing pages (preserved) ───────────────────────────────────────────────
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { SignInPage } from './pages/SignInPage';
import { SupabaseHealthPage } from './pages/SupabaseHealthPage';
import { VerificationPage } from './pages/VerificationPage';
import { InvitePage } from './pages/InvitePage';
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
import { isDemoSquadShortcutsEnabled } from './lib';
import { DemoWalkthroughProvider } from './demo/DemoWalkthroughContext';
import { DemoSessionPage } from './pages/DemoSessionPage';

// ── New v2 pages — Phase 1 (public marketing) ────────────────────────────────
import { LandingPage } from './pages/v2/LandingPage';
import { HowItWorksPage } from './pages/v2/HowItWorksPage';
import { RequestAccessPage } from './pages/v2/RequestAccessPage';
import { AboutPage } from './pages/v2/AboutPage';
import { FaqPage } from './pages/v2/FaqPage';
import { PrivacyPage } from './pages/v2/PrivacyPage';
import { TermsPage } from './pages/v2/TermsPage';
import { SecurityPage } from './pages/v2/SecurityPage';
import { UseCasesPage } from './pages/v2/UseCasesPage';
import { LedgerIndexPage } from './pages/v2/LedgerIndexPage';
import { LedgerRecordPage } from './pages/v2/LedgerRecordPage';
import { NotFoundPage } from './pages/v2/NotFoundPage';
import { AccessDeniedPage } from './pages/v2/AccessDeniedPage';

// ── New v2 pages — Phase 2 (authenticated facilitator core) ──────────────────
import { FacilitatorDashboardPage } from './pages/v2/FacilitatorDashboardPage';
import { SessionSetupPage } from './pages/v2/SessionSetupPage';
import { SessionsListPage } from './pages/v2/SessionsListPage';
import { ParticipantInvitePage } from './pages/v2/ParticipantInvitePage';
import { LiveRoomPage } from './pages/v2/LiveRoomPage';
import { OutcomeDraftingPage } from './pages/v2/OutcomeDraftingPage';

// ── New v2 pages — Phase 3 (facilitator sub-pages) ───────────────────────────
import { SessionNewPage } from './pages/v2/facilitator/SessionNewPage';
import { ParticipantsReviewPage } from './pages/v2/facilitator/ParticipantsReviewPage';
import { SessionControlPage } from './pages/v2/facilitator/SessionControlPage';
import { OutcomeWorkspacePage } from './pages/v2/facilitator/OutcomeWorkspacePage';
import { OutcomeReleasePage } from './pages/v2/facilitator/OutcomeReleasePage';

// ── New v2 pages — Phase 4 (participant flow) ────────────────────────────────
import { InviteAcceptancePage } from './pages/v2/participant/InviteAcceptancePage';
import { VerificationStepPage } from './pages/v2/participant/VerificationStepPage';
import { ConsentPage } from './pages/v2/participant/ConsentPage';
import { SessionBriefingPage } from './pages/v2/participant/SessionBriefingPage';
import { WaitingRoomPage } from './pages/v2/participant/WaitingRoomPage';
import { ParticipantRoomPage } from './pages/v2/participant/ParticipantRoomPage';
import { SessionEndPage } from './pages/v2/participant/SessionEndPage';
import {
  AdminRoleDashboardPage,
  AnalystDashboardPage,
  FacilitatorRoleDashboardPage,
  InstitutionDashboardPage,
  MediatorDashboardPage,
  ObserverDashboardPage,
  ParticipantDashboardPage,
} from './pages/dashboards';
import { DemoCatalogPage } from './pages/demo/DemoCatalogPage';
import { DemoSimulationPage } from './pages/demo/DemoSimulationPage';

const OnboardingApp = lazy(() =>
  import('./onboarding/app/components/onboarding/Onboarding').then((m) => ({
    default: m.Onboarding,
  })),
);

const LedgerPage = lazy(() =>
  import('./pages/LedgerPage').then((m) => ({ default: m.LedgerPage })),
);

const routeChunkFallback = (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className="flex min-h-dvh items-center justify-center text-sm"
    style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}
  >
    <span className="sr-only">Loading page content.</span>
    <span aria-hidden="true">Loading…</span>
  </div>
);

export default function AppV2() {
  return (
    <BrowserRouter>
      <SentryNavigationListener />
      <ScrollToTop />
      <DemoWalkthroughProvider>
        <AuthProvider>
          <Toaster position="top-center" richColors closeButton className="font-sans" />
          <Routes>
            {/* Onboarding (unchanged) */}
            <Route path="/onboarding" element={<Navigate to="/onboarding/mission" replace />} />
            <Route
              path="/onboarding/:stepId"
              element={
                <Suspense fallback={routeChunkFallback}>
                  <OnboardingApp />
                </Suspense>
              }
            />

            {/* ── Participant flow (unauthenticated token-gated) ─────────── */}
            {/* These sit outside AuthenticatedShell — participants use        */}
            {/* magic-link tokens, not full auth sessions.                    */}
            <Route path="/p/invite/:token" element={<InviteAcceptancePage />} />
            <Route path="/p/verify/:token" element={<VerificationStepPage />} />
            <Route path="/p/consent/:token" element={<ConsentPage />} />
            <Route path="/p/briefing/:token" element={<SessionBriefingPage />} />
            <Route path="/p/waiting/:token" element={<WaitingRoomPage />} />
            <Route path="/p/room/:token" element={<ParticipantRoomPage />} />
            <Route path="/p/done/:token" element={<SessionEndPage />} />

            {/* ── V2 Authenticated Shell (role-aware) ───────────────────── */}
            <Route
              element={
                <RequireAuth>
                  <RoleWorkspaceShell />
                </RequireAuth>
              }
            >
              {/* Facilitator Dashboard (legacy path) */}
              <Route
                element={
                  <RoleProtectedRoute allowedRoles={['facilitator', 'super_admin', 'mediator']} />
                }
              >
                <Route path="/dashboard" element={<FacilitatorDashboardPage />} />
              </Route>

              {/* Role workspaces — ROLE_DASHBOARD_MAP (distinct products, not one shell) */}
              <Route
                element={
                  <RoleProtectedRoute allowedRoles={['facilitator', 'super_admin', 'mediator']} />
                }
              >
                <Route path="/app/facilitator" element={<FacilitatorRoleDashboardPage />} />
              </Route>
              <Route element={<RoleProtectedRoute allowedRoles={['mediator', 'super_admin']} />}>
                <Route path="/app/mediator" element={<MediatorDashboardPage />} />
              </Route>
              <Route element={<RoleProtectedRoute allowedRoles={['participant', 'super_admin']} />}>
                <Route path="/app/participant" element={<ParticipantDashboardPage />} />
              </Route>
              <Route element={<RoleProtectedRoute allowedRoles={['observer', 'super_admin']} />}>
                <Route path="/app/observer" element={<ObserverDashboardPage />} />
              </Route>
              <Route element={<RoleProtectedRoute allowedRoles={['analyst', 'super_admin']} />}>
                <Route path="/app/analyst" element={<AnalystDashboardPage />} />
              </Route>
              <Route
                element={<RoleProtectedRoute allowedRoles={['institution_admin', 'super_admin']} />}
              >
                <Route path="/app/institution" element={<InstitutionDashboardPage />} />
              </Route>
              <Route element={<RoleProtectedRoute allowedRoles={['super_admin']} />}>
                <Route path="/app/admin" element={<AdminRoleDashboardPage />} />
                <Route path="/app/demo/catalog" element={<DemoCatalogPage />} />
              </Route>
              <Route path="/app/settings" element={<Navigate to="/settings" replace />} />
              <Route path="/app/profile" element={<Navigate to="/settings/profile" replace />} />

              {/* Sessions (legacy + v2 setup pages) */}
              <Route
                element={
                  <RoleProtectedRoute
                    allowedRoles={['facilitator', 'mediator', 'super_admin', 'institution_admin']}
                  />
                }
              >
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
            </Route>

            {/* ── V2 Public Shell ──────────────────────────────────────── */}
            <Route element={<PublicShell />}>
              {/* Public marketing */}
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

              {/* Ledger (public outcome records) */}
              <Route path="/ledger" element={<LedgerIndexPage />} />
              <Route path="/ledger/:recordId" element={<LedgerRecordPage />} />

              {/* Legacy ledger routes → v2 ledger */}
              <Route
                path="/ledger/:proposalId/legacy"
                element={<Navigate to="/ledger" replace />}
              />

              {/* Redirects for legacy paths */}
              <Route path="/login" element={<Navigate to="/sign-in" replace />} />
              <Route path="/sign-up" element={<Navigate to="/sign-in" replace />} />
              <Route
                path="/forgot-password"
                element={<Navigate to="/sign-in?reason=link" replace />}
              />
              <Route path="/intent" element={<Navigate to="/find-squad" replace />} />
              <Route path="/match-setup" element={<Navigate to="/find-squad" replace />} />
              <Route path="/mod" element={<Navigate to="/admin/rooms" replace />} />

              {/* Auth (existing pages, new shell) */}
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/verify" element={<VerificationPage />} />
              <Route path="/invite" element={<InvitePage />} />

              {/* Legacy ledger (existing page, new shell) */}
              <Route
                path="/ledger-legacy"
                element={
                  <Suspense fallback={routeChunkFallback}>
                    <LedgerPage />
                  </Suspense>
                }
              />
              <Route
                path="/ledger-legacy/:proposalId"
                element={
                  <Suspense fallback={routeChunkFallback}>
                    <LedgerPage />
                  </Suspense>
                }
              />

              {/* Settings (existing pages, new shell) */}
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

              {/* Demo session + cinematic simulation (flag-gated; not production identity) */}
              {isDemoSquadShortcutsEnabled() ? (
                <>
                  <Route path="/session/demo-session-001" element={<DemoSessionPage />} />
                  <Route
                    path="/session/demo"
                    element={<Navigate to="/session/demo-session-001" replace />}
                  />
                  <Route path="/demo/simulation" element={<DemoSimulationPage />} />
                  <Route path="/demo" element={<Navigate to="/demo/simulation" replace />} />
                </>
              ) : (
                <>
                  <Route path="/session/demo-session-001" element={<Navigate to="/" replace />} />
                  <Route path="/session/demo" element={<Navigate to="/" replace />} />
                  <Route path="/demo/simulation" element={<Navigate to="/" replace />} />
                  <Route path="/demo" element={<Navigate to="/" replace />} />
                </>
              )}

              <Route path="/session/:squadId?" element={<SessionAccess />} />

              {/* Error pages */}
              <Route path="/access-denied" element={<AccessDeniedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </DemoWalkthroughProvider>
    </BrowserRouter>
  );
}
