import { Link } from 'react-router-dom';
import { isDemoSquadShortcutsEnabled } from '../../lib';
import { useDemoWalkthrough } from '../../demo/DemoWalkthroughContext';

/**
 * Staging controls for the scripted walkthrough and offline session demo.
 */
export function AdminDemoPage() {
  const { startWalkthrough, demoActive } = useDemoWalkthrough();
  const canDemo = isDemoSquadShortcutsEnabled();

  return (
    <section className="space-y-4" aria-labelledby="admin-demo">
      <h1 id="admin-demo" className="font-heading text-xl font-semibold text-gray-light">
        Demo mode
      </h1>
      <p className="max-w-[60ch] font-sans text-[0.88rem] text-slate-500">
        Start the public tour from landing, or jump into the offline match and session when demo
        shortcuts are enabled in the environment.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => startWalkthrough()}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-teal px-4 font-heading text-[0.9rem] font-semibold text-[#0b0f1a]"
        >
          Start walkthrough
        </button>
        {canDemo ? (
          <Link
            to="/match?demo=1"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-navy-light px-4 text-[0.9rem] text-slate-200 hover:bg-navy-light/30"
          >
            Match (guided demo)
          </Link>
        ) : null}
        {canDemo ? (
          <Link
            to="/session/demo-session-001"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-navy-light px-4 text-[0.9rem] text-slate-200 hover:bg-navy-light/30"
          >
            Offline session sample
          </Link>
        ) : null}
        <Link
          to="/ledger"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-navy-light px-4 text-[0.9rem] text-slate-200 hover:bg-navy-light/30"
        >
          Ledger
        </Link>
      </div>
      <p className="font-sans text-[0.8rem] text-slate-600" aria-live="polite">
        Walkthrough state: {demoActive ? 'active (tour or demo flag in session)' : 'idle'}
      </p>
    </section>
  );
}
