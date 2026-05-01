import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../components';
import { cn } from '../../../../lib/cn';

interface OnboardingExitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmExit: () => void;
}

export function OnboardingExitDialog({
  open,
  onOpenChange,
  onConfirmExit,
}: OnboardingExitDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          'z-[100] border border-white/10 bg-onboarding-card text-white shadow-onboarding-card sm:max-w-md',
        )}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Exit onboarding?</AlertDialogTitle>
          <AlertDialogDescription className="text-white/60">
            Your progress in this session won&apos;t be saved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
            Stay
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-onboarding-accent text-onboarding-bg hover:bg-onboarding-accent/90"
            onClick={onConfirmExit}
          >
            Exit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
