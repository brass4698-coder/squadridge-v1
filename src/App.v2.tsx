/**
 * App.v2.tsx — Redesign router (redesign/v2 branch)
 *
 * Phase 1: Public shell, marketing pages, error pages.
 * Phase 2: Authenticated shell, facilitator dashboard, session setup,
 *          participant invite, live room, outcome drafting, sessions list.
 * Phase 3: Participant flow (/p/*), ledger v2, public pages.
 * Phase 4: Shared components (ConfirmModal, StatusBadge, AuthenticatedShell,
 *          PublicShell, 404, AccessDenied).
 * Phase 5: All routes wired; main.tsx points here.
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
import { PublicShell } from './components/layout/PublicShell';
import { AuthenticatedShell } from './components/layout/AuthenticatedShell';
import { isDemoSquadShortcutsEnabled } from './lib';
import { DemoWalkthroughProvider } from './demo/DemoWalkthroughContext';

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
import { DemoSessionPage } from './pages/DemoSessionPage';

// ── V2 pages — Phase 1 (public marketing) ────────────────────────────────────
import { LandingPage } from './pages/v2/LandingPage';
import { HowItWorksPage } from './pages/v2/HowItWorksPage';
import { RequestAccessPage } from './pages/v2/RequestAccessPage';

// ── V2 pages — Phase 2 (authenticated facilitator) ───────────────────────────
import { FacilitatorDashboardPage } from './pages/v2/FacilitatorDashboardPage';
import { SessionSetupPage } from './pages/v2/SessionSetupPage';
import { SessionsListPage } from './pages/v2/SessionsListPage';
import { ParticipantInvitePage } from './pages/v2/ParticipantInvitePage';
import { LiveRoomPage } from './pages/v2/LiveRoomPage';
import { OutcomeDraftingPage } from './pages/v2/OutcomeDraftingPage';

// ── V2 pages — Phase 3 (participant flow) ────────────────────────────────────
import { InviteAcceptancePage } from './pages/v2/participant/InviteAcceptancePage';
import { VerificationStepPage } from './pages/v2/participant/VerificationStepPage';
import { ConsentPage } from './pages/v2/participant/ConsentPage';
import { SessionBriefingPage } from './pages/v2/participant/SessionBriefingPage';
import { WaitingRoomPage } from './pages/v2/participant/WaitingRoomPage';
import { ParticipantRoomPage } from './pages/v2/participant/ParticipantRoomPage';
import { SessionEndPage } from './pages/v2/participant/SessionEndPage';

// ── V2 pages — Phase 3 (ledger v2) ───────────────────────────────────────────
import { LedgerIndexPage } from './pages/v2/LedgerIndexPage';
import { LedgerRecordPage } from './pages/v2/LedgerRecordPage';

// ── V2 pages — Phase 3 (public site pages) ───────────────────────────────────
import { UseCasesPage } from './pages/v2/UseCasesPage';
import { SecurityPage } from './pages/v2/SecurityPage';
import { AboutPage } from './pages/v2/AboutPage';
import { FaqPage } from './pages/v2/FaqPage';
import { PrivacyPage } from './pages/v2/PrivacyPage';
import { TermsPage } from './pages/v2/TermsPage';

// ── V2 pages — Phase 4 (error pages) ─────────────────────────────────────────
import { NotFoundPage } from './pages/v2/NotFoundPage';
import { AccessDeniedPage } from './pages/v2/AccessDeniedPage';

const OnboardingApp = lazy(() =>
  import('./onboarding/app/components/onboarding/Onboarding').then((m) => ({
    default: m.Onboarding,
  })),
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
      <GrainOverlay />
      <SentryNavigationListener />
      <ScrollToTop />
      <DemoWalkthroughProvider>
        <AuthProvider>
          <Toaster position="top-center" richColors closeButton className="font-sans" />
          <Routes>

            {/* ── Onboarding (unchanged) ───────────────────────────────── */}
            <Route path="/onboarding" element={<Navigate to="/onboarding/mission" replace />} />
            <Route
              path="/onboarding/:stepId"
              element={
                <Suspense fallback={routeChunkFallback}>
                  <OnboardingApp />
                </Suspense>
              }
            />

            {/* ── Participant flow (unauthenticated, token-gated) ──────── */}
            <Route path="/p/invite" element={<InviteAcceptancePage />} />
            <Route path="/p/verify" element={<VerificationStepPage />} />
            <Route path="/p/consent" element={<ConsentPage />} />
            <Route path="/p/briefing" element={<SessionBriefingPage />} />
            <Route path="/p/waiting" element={<WaitingRoomPage />} />
            <Route path="/p/room" element={<ParticipantRoomPage />} />
            <Route path="/p/session-end" element={<SessionEndPage />} />

            {/* ── V2 Authenticated Shell (facilitator) ─────────────────── */}
            <Route
              element={
                <RequireAuth>
                  <AuthenticatedShell />
                </RequireAuth>
              }
            >
              <Route path="/f/dashboard" element={<FacilitatorDashboardPage />} />
              <Route path="/dashboard" element={<Navigate to="/f/dashboard" replace />} />

              <Route path="/f/sessions" element={<SessionsListPage />} />
              <Route path="/sessions" element={<Navigate to="/f/sessions" replace />} />
              <Route path="/f/sessions/new" element={<SessionSetupPage />} />
              <Route path="/sessions/new" element={<Navigate to="/f/sessions/new" replace />} />
              <Route path="/f/sessions/:sessionId/invite" element={<ParticipantInvitePage />} />
              <Route path="/f/sessions/:sessionId/room" element={<LiveRoomPage />} />

              <Route path="/f/outcomes/new" element={<OutcomeDraftingPage />} />
              <Route path="/f/outcomes/:outcomeId" element={<OutcomeDraftingPage />} />
              <Route path="/outcomes/new" element={<Navigate to="/f/outcomes/new" replace />} />

              {/* Settings */}
              <Route path="/f/settings" element={<SettingsLayout />}>
                <Route index element={<SettingsIndexPage />} />
                <Route path="profile" element={<ProfileSettingsPage />} />
                <Route path="safety" element={<SafetyCenterPage />} />
                <Route path="notifications" element={<NotificationsSettingsPage />} />
              </Route>
              <Route path="/settings" element={<Navigate to="/f/settings" replace />} />
            </Route>

            {/* ── Admin (existing pages) ───────────────────────────────── */}
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

            {/* ── V2 Public Shell ──────────────────────────────────────── */}
            <Route element={<PublicShell />}>

              {/* Marketing */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/use-cases" element={<UseCasesPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/request-access" element={<RequestAccessPage />} />
              <Route path="/request-access/confirmed" element={<Navigate to="/request-access" replace />} />

              {/* Ledger (v2) */}
              <Route path="/ledger" element={<LedgerIndexPage />} />
              <Route path="/ledger/:proposalId" element={<LedgerRecordPage />} />

              {/* Auth */}
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/verify" element={<VerificationPage />} />
              <Route path="/invite" element={<InvitePage />} />

              {/* Legacy redirects */}
              <Route path="/login" element={<Navigate to="/sign-in" replace />} />
              <Route path="/sign-up" element={<Navigate to="/sign-in" replace />} />
              <Route path="/forgot-password" element={<Navigate to="/sign-in?reason=link" replace />} />

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
