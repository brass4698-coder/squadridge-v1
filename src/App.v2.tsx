/**
 * App.v2.tsx — Redesign router (redesign/v2 branch)
 *
 * Phase 1: Public shell, marketing pages, error pages.
 * Phase 2: Authenticated shell, facilitator dashboard, session setup,
 *          participant invite, live room, outcome drafting, sessions list.
 *
 * To activate the redesign, swap the import in main.tsx:
 *   import App from './App.v2';
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import {
  GrainOverlay,
  RequireAuth,
  RequireModerator,
  ScrollToTop,
  SentryNavigationListener,
  SessionAccess,
  Toaster,
} from './components';
import { AdminLayout } from './components/admin/AdminLayout';
import { SettingsLayout } from './components/settings/SettingsLayout';
import { PageShell } from './components/layout/PageShell';
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
import { isDemoSquadShortcutsEnabled } from './lib';
import { DemoWalkthroughProvider } from './demo/DemoWalkthroughContext';
import { DemoSessionPage } from './pages/DemoSessionPage';

// ── New v2 pages — Phase 1 (public) ──────────────────────────────────────────
import { LandingPage } from './pages/v2/LandingPage';
import { HowItWorksPage } from './pages/v2/HowItWorksPage';
import { RequestAccessPage } from './pages/v2/RequestAccessPage';
import { NotFoundPage } from './pages/v2/NotFoundPage';
import { AccessDeniedPage } from './pages/v2/AccessDeniedPage';

// ── New v2 pages — Phase 2 (authenticated) ───────────────────────────────────
import { FacilitatorDashboardPage } from './pages/v2/FacilitatorDashboardPage';
import { SessionSetupPage } from './pages/v2/SessionSetupPage';
import { SessionsListPage } from './pages/v2/SessionsListPage';
import { ParticipantInvitePage } from './pages/v2/ParticipantInvitePage';
import { LiveRoomPage } from './pages/v2/LiveRoomPage';
import { OutcomeDraftingPage } from './pages/v2/OutcomeDraftingPage';

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

            {/* ── V2 Authenticated Shell (Phase 2) ─────────────────────── */}
            <Route
              element={
                <RequireAuth>
                  <AuthenticatedShell />
                </RequireAuth>
              }
            >
              {/* Facilitator Dashboard */}
              <Route path="/dashboard" element={<FacilitatorDashboardPage />} />

              {/* Sessions */}
              <Route path="/sessions" element={<SessionsListPage />} />
              <Route path="/sessions/new" element={<SessionSetupPage />} />
              <Route path="/sessions/:sessionId/invite" element={<ParticipantInvitePage />} />
              <Route path="/sessions/:sessionId/room" element={<LiveRoomPage />} />

              {/* Outcomes */}
              <Route path="/outcomes/new" element={<OutcomeDraftingPage />} />
              <Route path="/outcomes/:outcomeId" element={<OutcomeDraftingPage />} />
            </Route>

            {/* ── V2 Public Shell (Phase 1) ────────────────────────────── */}
            <Route element={<PageShell />}>

              {/* Public marketing */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/request-access" element={<RequestAccessPage />} />
              <Route path="/request-access/confirmed" element={<Navigate to="/request-access" replace />} />

              {/* Redirects for legacy paths */}
              <Route path="/login" element={<Navigate to="/sign-in" replace />} />
              <Route path="/sign-up" element={<Navigate to="/sign-in" replace />} />
              <Route path="/forgot-password" element={<Navigate to="/sign-in?reason=link" replace />} />
              <Route path="/intent" element={<Navigate to="/find-squad" replace />} />
              <Route path="/match-setup" element={<Navigate to="/find-squad" replace />} />
              <Route path="/mod" element={<Navigate to="/admin/rooms" replace />} />

              {/* Auth (existing pages, new shell) */}
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/verify" element={<VerificationPage />} />
              <Route path="/invite" element={<InvitePage />} />

              {/* Ledger (existing page, new shell) */}
              <Route
                path="/ledger"
                element={
                  <Suspense fallback={routeChunkFallback}>
                    <LedgerPage />
                  </Suspense>
                }
              />
              <Route
                path="/ledger/:proposalId"
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
                  <Route path="/session/demo" element={<Navigate to="/session/demo-session-001" replace />} />
                </>
              ) : (
                <>
                  <Route path="/session/demo-session-001" element={<Navigate to="/" replace />} />
                  <Route path="/session/demo" element={<Navigate to="/" replace />} />
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
