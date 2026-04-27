import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import {
  AppLayout,
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
import { IntentPage } from './pages/IntentPage';
import { LandingPage } from './pages/LandingPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { SignInPage } from './pages/SignInPage';
import { SupabaseHealthPage } from './pages/SupabaseHealthPage';
import { VerificationPage } from './pages/VerificationPage';
import { SecurityDisclosurePage } from './pages/SecurityDisclosurePage';
import { Match } from './pages/Match';
import { DemoSessionPage } from './pages/DemoSessionPage';
import { DemoWalkthroughProvider } from './demo/DemoWalkthroughContext';
import { InvitePage } from './pages/InvitePage';
import { SettingsIndexPage } from './pages/SettingsIndexPage';
import { SafetyCenterPage } from './pages/SafetyCenterPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminVerificationPage } from './pages/admin/AdminVerificationPage';
import { AdminRoomsPage } from './pages/admin/AdminRoomsPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { AdminDemoPage } from './pages/admin/AdminDemoPage';
import { AdminCsiPage } from './pages/admin/AdminCsiPage';

const OnboardingApp = lazy(() =>
  import('./onboarding/app/components/onboarding/Onboarding').then((m) => ({
    default: m.Onboarding,
  })),
);

const LedgerPage = lazy(() =>
  import('./pages/LedgerPage').then((m) => ({ default: m.LedgerPage })),
);

const PitchDeckHubPage = lazy(() =>
  import('./pages/PitchDeckHubPage').then((m) => ({ default: m.PitchDeckHubPage })),
);

const routeChunkFallback = (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className="flex min-h-dvh items-center justify-center bg-[#0a0f1a] font-sans text-sm text-slate-500"
  >
    <span className="sr-only">Loading page content.</span>
    <span aria-hidden="true">Loading…</span>
  </div>
);

export default function App() {
  return (
    <>
      <div className="relative z-10">
        <BrowserRouter>
          <SentryNavigationListener />
          <ScrollToTop />
          <DemoWalkthroughProvider>
            <AuthProvider>
              <Toaster position="top-center" richColors closeButton className="font-sans" />
              <Routes>
                <Route path="/onboarding" element={<Navigate to="/onboarding/mission" replace />} />
                <Route
                  path="/onboarding/:stepId"
                  element={
                    <Suspense fallback={routeChunkFallback}>
                      <OnboardingApp />
                    </Suspense>
                  }
                />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Navigate to="/sign-in" replace />} />
                  <Route path="/invite" element={<InvitePage />} />
                  <Route path="/verify" element={<VerificationPage />} />
                  <Route path="/find-squad" element={<IntentPage />} />
                  <Route path="/intent" element={<Navigate to="/find-squad" replace />} />
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
                  <Route path="/security" element={<SecurityDisclosurePage />} />
                  <Route
                    path="/pitch-deck-hub"
                    element={
                      <Suspense fallback={routeChunkFallback}>
                        <PitchDeckHubPage />
                      </Suspense>
                    }
                  />
                  <Route path="/match" element={<Match />} />
                  <Route path="/match-setup" element={<Navigate to="/find-squad" replace />} />
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
                  <Route path="/mod" element={<Navigate to="/admin/rooms" replace />} />
                  <Route path="/sign-in" element={<SignInPage />} />
                  <Route path="/sign-up" element={<Navigate to="/sign-in" replace />} />
                  <Route
                    path="/forgot-password"
                    element={<Navigate to="/sign-in?reason=link" replace />}
                  />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route path="/session/demo-session-001" element={<DemoSessionPage />} />
                  <Route
                    path="/session/demo"
                    element={<Navigate to="/session/demo-session-001" replace />}
                  />
                  <Route path="/session/:squadId?" element={<SessionAccess />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </AuthProvider>
          </DemoWalkthroughProvider>
        </BrowserRouter>
      </div>
      <GrainOverlay />
    </>
  );
}
