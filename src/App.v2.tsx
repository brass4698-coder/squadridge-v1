/**
 * App.v2.tsx — Redesign router (redesign/v2 branch)
 *
 * This file wires up all Phase-1 redesign routes while preserving the
 * existing App.tsx intact so the diff is reviewable and merge is clean.
 * To activate the redesign, swap the import in main.tsx from App to AppV2.
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

// ── New v2 pages (redesign) ───────────────────────────────────────────────────
import { LandingPage } from './pages/v2/LandingPage';
import { HowItWorksPage } from './pages/v2/HowItWorksPage';
import { RequestAccessPage } from './pages/v2/RequestAccessPage';
import { NotFoundPage } from './pages/v2/NotFoundPage';
import { AccessDeniedPage } from './pages/v2/AccessDeniedPage';

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

            {/* ── V2 Public Shell ─────────────────────────────────────────── */}
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
