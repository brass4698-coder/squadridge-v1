// ============================================================
// UnauthorizedState — calm 403 for missing permissions (left-aligned)
// ============================================================
import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { Button } from '../ui/Button';

export function UnauthorizedState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center gap-4 px-5 text-left md:px-6">
      <ShieldOff className="h-12 w-12 text-ink-faint" aria-hidden="true" />
      <h1 className="max-w-prose text-2xl font-semibold tracking-[-0.02em] text-ink">
        You don't have access to this section
      </h1>
      <p className="max-w-prose text-base leading-[1.55] text-ink-secondary">
        Contact your administrator if you think this is a mistake.
      </p>
      <Button
        asChild
        variant="primary"
        className="mt-2 h-11 min-w-[11rem] rounded-xl tracking-[-0.01em]"
      >
        <Link to="/app">Go to dashboard</Link>
      </Button>
    </div>
  );
}
