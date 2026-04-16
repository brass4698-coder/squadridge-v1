import { Onboarding } from '../onboarding/app/components/onboarding/Onboarding';
import { Toaster } from '../onboarding/app/components/ui/sonner';

export function OnboardingPage() {
  return (
    <div className="dark onboarding-page-root font-onboarding-ui min-h-screen">
      <Onboarding />
      <Toaster position="top-center" richColors closeButton className="font-sans" />
    </div>
  );
}
