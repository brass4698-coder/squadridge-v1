import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GrainOverlay } from './components/GrainOverlay';
import { ScrollToTop } from './components/ScrollToTop';
import { AppLayout } from './components/layout/AppLayout';
import { IntentPage } from './pages/IntentPage';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SessionPage } from './pages/SessionPage';
import { SupabaseHealthPage } from './pages/SupabaseHealthPage';
import { VerificationPage } from './pages/VerificationPage';
import { LedgerPage } from './pages/LedgerPage';
import { Match } from './pages/Match';
import { DemoSessionPage } from './pages/DemoSessionPage';

export default function App() {
  return (
    <>
      {/* Stack above GrainOverlay (z-1) so routes/layout paint above the fixed grain texture */}
      <div className="relative z-10">
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/verify" element={<VerificationPage />} />
                <Route path="/intent" element={<IntentPage />} />
                <Route path="/ledger" element={<LedgerPage />} />
                <Route path="/ledger/:proposalId" element={<LedgerPage />} />
                <Route path="/match" element={<Match />} />
                <Route path="/match-setup" element={<Navigate to="/intent" replace />} />
                <Route path="/dev/supabase" element={<SupabaseHealthPage />} />
                {/* Static demo path must win over `/session/:squadId?` */}
                <Route path="/session/demo-session-001" element={<DemoSessionPage />} />
                {/* Single SessionPage route: `/session` (landing) and `/session/:id` (room) */}
                <Route path="/session/:squadId?" element={<SessionPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </div>
      {/* Fixed grain (z-1); routes live in the z-10 wrapper above */}
      <GrainOverlay />
    </>
  );
}
