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
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import {
  RequireAuth,
  RequireModerator,
  ScrollToTop,
  SentryNavigationListener,
  SessionAccess,
  Toaster,
  GrainOverlay,
} from './components';
import { AuthGate } from './components/auth/AuthGate';
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { SettingsLayout } from './components/settings/SettingsLayout';
import { PublicShell } from './components/layout/PublicShell';
import { AuthenticatedShell } from './components/layout/AuthenticatedShell';

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
import { AdminInvitesPage } from './pages/admin/AdminInvitesPage';
import { isDemoSquadShortcutsEnabled } from './lib';
import { DemoWalkthroughProvider } from './demo/DemoWalkthroughContext';
import { DemoSessionPage } from './pages/DemoSessionPage';
import { Match } from './pages/Match';

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
import { InviteInvalidPage } from './pages/v2/participant/InviteInvalidPage';

// ── Phase 0 routing ───────────────────────────────────────────────────────────
import { SessionDetailPage } from './pages/v2/SessionDetailPage';
import { ParticipantsIndexPage } from './pages/v2/ParticipantsIndexPage';
import { InsightsPage } from './pages/v2/InsightsPage';
import { LegacyAppRedirect } from './components/routing/LegacyAppRedirect';
import { ContactPage } from './pages/v2/ContactPage';

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
    className="flex min-h-dvh items-center justify-center bg-surface text-sm text-ink-secondary"
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
          <AuthGate>
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
              <Route path="/p/done/:token" element={<SessionEndPage />} />

              {/* ── V2 Authenticated Shell ────────────────────────────────── */}
              {/* /app/* is facilitator-scoped — participants land on /app/participant */}
              {/* via ROLE_DASHBOARD_MAP. RoleProtectedRoute redirects non-eligible    */}
              {/* signed-in users to /unauthorized (AccessDeniedPage). RLS is still    */}
              {/* the authoritative gate on the backend.                               */}
              <Route
                element={
                  <RequireAuth>
                    <RoleProtectedRoute
                      allowed={['super_admin', 'institution_admin', 'facilitator', 'mediator']}
                    >
                      <AuthenticatedShell role="facilitator">
                        <Outlet />
                      </AuthenticatedShell>
                    </RoleProtectedRoute>
                  </RequireAuth>
                }
              >
                {/* Facilitator app (/app/*) */}
                <Route path="/app" element={<FacilitatorDashboardPage />} />
                <Route path="/app/sessions" element={<SessionsListPage />} />
                <Route path="/app/sessions/new" element={<SessionSetupPage />} />
                <Route path="/app/sessions/new/setup" element={<SessionNewPage />} />
                <Route path="/app/sessions/:sessionId" element={<SessionDetailPage />} />
                <Route path="/app/sessions/:sessionId/invite" element={<ParticipantInvitePage />} />
                <Route path="/app/sessions/:sessionId/room" element={<LiveRoomPage />} />
                <Route
                  path="/app/sessions/:sessionId/participants"
                  element={<ParticipantsReviewPage />}
                />
                <Route path="/app/sessions/:sessionId/control" element={<SessionControlPage />} />
                <Route path="/app/sessions/:sessionId/outcome" element={<OutcomeWorkspacePage />} />
                <Route path="/app/sessions/:sessionId/release" element={<OutcomeReleasePage />} />
                <Route path="/app/participants" element={<ParticipantsIndexPage />} />
                <Route path="/app/insights" element={<InsightsPage />} />
                <Route path="/app/outcomes/new" element={<OutcomeDraftingPage />} />
                <Route path="/app/outcomes/:outcomeId" element={<OutcomeDraftingPage />} />
                <Route path="/app/settings" element={<Navigate to="/settings" replace />} />
                {/* Admin invites console — narrower role gate than the parent shell. */}
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
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/contact" element={<ContactPage />} />

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
                <Route path="/sign-up" element={<Navigate to="/sign-in?intent=signup" replace />} />
                <Route
                  path="/forgot-password"
                  element={<Navigate to="/sign-in?reason=link" replace />}
                />
                <Route path="/intent" element={<Navigate to="/invite" replace />} />
                <Route path="/match-setup" element={<Navigate to="/invite" replace />} />
                <Route path="/find-squad" element={<Navigate to="/invite" replace />} />
                <Route path="/match" element={<Match />} />
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

                {/* Demo session */}
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

                {/* Error pages */}
                <Route path="/unauthorized" element={<AccessDeniedPage />} />
                <Route path="/access-denied" element={<Navigate to="/unauthorized" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </AuthGate>
        </AuthProvider>
      </DemoWalkthroughProvider>
      <GrainOverlay />
    </BrowserRouter>
  );
}
