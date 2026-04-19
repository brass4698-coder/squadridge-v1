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

const OnboardingApp = lazy(() =>
  import('./onboarding/app/components/onboarding/Onboarding').then((m) => ({
    default: m.Onboarding,
  })),
);

const LedgerPage = lazy(() =>
  import('./pages/LedgerPage').then((m) => ({ default: m.LedgerPage })),
);

const ModDashboardPage = lazy(() =>
  import('./pages/ModDashboardPage').then((m) => ({ default: m.ModDashboardPage })),
);

const routeChunkFallback = (
  <div className="flex min-h-dvh items-center justify-center bg-[#0a0f1a] font-sans text-sm text-slate-500">
    Loading…
  </div>
);

export default function App() {
  return (
    <>
      {/* Stack above GrainOverlay (z-1) so routes/layout paint above the fixed grain texture */}
      <div className="relative z-10">
        <BrowserRouter>
          <SentryNavigationListener />
          <ScrollToTop />
          <DemoWalkthroughProvider>
            <AuthProvider>
              <Toaster position="top-center" richColors closeButton className="font-sans" />
              <Routes>
                <Route
                  path="/onboarding"
                  element={
                    <Suspense
                      fallback={
                        <div className="flex min-h-dvh items-center justify-center bg-[#0a0f1a] font-sans text-sm text-slate-500">
                          Loading…
                        </div>
                      }
                    >
                      <OnboardingApp />
                    </Suspense>
                  }
                />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/verify" element={<VerificationPage />} />
                  <Route path="/intent" element={<IntentPage />} />
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
                  <Route path="/match" element={<Match />} />
                  <Route path="/match-setup" element={<Navigate to="/intent" replace />} />
                  <Route
                    path="/admin/health"
                    element={
                      <RequireAuth>
                        <RequireModerator>
                          <SupabaseHealthPage />
                        </RequireModerator>
                      </RequireAuth>
                    }
                  />
                  <Route path="/sign-in" element={<SignInPage />} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route
                    path="/settings/profile"
                    element={
                      <RequireAuth>
                        <ProfileSettingsPage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/mod"
                    element={
                      <RequireAuth>
                        <RequireModerator>
                          <Suspense fallback={routeChunkFallback}>
                            <ModDashboardPage />
                          </Suspense>
                        </RequireModerator>
                      </RequireAuth>
                    }
                  />
                  {/* Static offline squad demo — must be declared before `/session/:squadId?`. Developer-only shortcuts (create demo squad) still use isDemoSquadShortcutsEnabled in env. */}
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
      {/* Fixed grain (z-1); routes live in the z-10 wrapper above */}
      <GrainOverlay />
    </>
  );
}
