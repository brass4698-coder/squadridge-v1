import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/env';
import { submitZkProofStub } from '../lib/zk';

function ZkDevCard() {
  const { supabase, session, ensureAnonymousSession } = useAuth();
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    void ensureAnonymousSession();
  }, [supabase, ensureAnonymousSession]);

  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  return (
    <section className="panel mt-lg" aria-labelledby="zk-dev-heading">
      <h2 id="zk-dev-heading" className="font-heading text-fluid-h3 text-gray-light">
        ZK verification (development stub)
      </h2>
      <p className="mt-sm text-fluid-small text-gray-light">
        Stores a SHA-256 commitment only—no raw PII. Replace with Semaphore proofs against your verifier.
      </p>
      <button
        type="button"
        className="btn-primary mt-md"
        disabled={!session?.user}
        onClick={() => {
          void (async () => {
            if (!session?.user) return;
            setStatus(null);
            try {
              await submitZkProofStub(supabase, session.user.id, 'onboarding_demo');
              setStatus('Proof commitment recorded.');
            } catch (e) {
              setStatus(e instanceof Error ? e.message : 'Request failed.');
            }
          })();
        }}
      >
        Run ZK stub
      </button>
      {status ? (
        <p className="mt-sm text-fluid-small text-teal" role="status">
          {status}
        </p>
      ) : null}
    </section>
  );
}

const steps = [
  {
    title: 'Norms and principles',
    body:
      'SquadRidge exists to build bridges across divides. Dialogue is structured, non-violent, and grounded in mutual respect. We avoid alarmist or urgent language so participants can use the Power of Pause.',
  },
  {
    title: 'Verified anonymity',
    body:
      'Your account does not store raw personally identifiable information for matching. Zero-knowledge proofs let you show verified attributes (for example, region or role) without exposing underlying documents or linking them to your messages.',
  },
  {
    title: 'zkTLS and verification',
    body:
      'When you verify attributes, private data stays on your side until it is turned into a cryptographic proof. The platform only sees proof commitments suitable for matching—not your underlying records.',
  },
  {
    title: 'In-room tools',
    body:
      'Use Slow down to pause before sending, Pull back to retract a recent message where supported, and expect gentle AI-assisted translation and tone hints when enabled. Core chat works even if AI is unavailable.',
  },
] as const;

export function OnboardingPage() {
  return (
    <article className="space-y-xl">
      <header className="space-y-sm">
        <h1 className="font-heading text-fluid-h2 text-gray-light">Onboarding</h1>
        <p className="text-fluid-body text-gray-light max-w-prose">
          This flow follows the product onboarding narrative: safety, anonymity mechanics, verification, and
          de-escalation tools.
        </p>
      </header>

      <ol className="space-y-lg">
        {steps.map((step, index) => (
          <li key={step.title} className="panel">
            <p className="font-heading text-fluid-small text-teal">
              Step {index + 1} — {step.title}
            </p>
            <p className="mt-sm text-fluid-body text-gray-light">{step.body}</p>
          </li>
        ))}
      </ol>

      <ZkDevCard />
    </article>
  );
}
