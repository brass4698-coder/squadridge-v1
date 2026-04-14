import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isAiPipelineEnabled, isSupabaseConfigured } from '../lib/env';
import { decodeMessagePayload, encodeMessagePayload } from '../lib/messagePayload';
import { createDemoSquad } from '../lib/squad';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';
import { logIntervention, recordLocalToneAndMaybePersist } from '../lib/ai/pipeline';

export function SessionPage() {
  const { squadId } = useParams<{ squadId?: string }>();
  const navigate = useNavigate();
  const { supabase, loading: authLoading, ensureAnonymousSession } = useAuth();
  const { messages, loading, error, refresh } = useRealtimeMessages(squadId);
  const [composer, setComposer] = useState('');
  const [sending, setSending] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  async function handleCreateDemo() {
    if (!supabase) return;
    setDemoError(null);
    try {
      await ensureAnonymousSession();
      const id = await createDemoSquad(supabase);
      navigate(`/session/${id}`, { replace: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not create demo squad.';
      setDemoError(msg);
    }
  }

  async function handleSend() {
    if (!supabase || !squadId || !composer.trim()) return;
    setSending(true);
    const text = composer.trim();
    setComposer('');
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSending(false);
      return;
    }

    const { error: sendError } = await supabase.from('messages').insert({
      squad_id: squadId,
      sender_id: user.id,
      encrypted_content: encodeMessagePayload(text),
    });

    if (sendError) {
      setComposer(text);
      setSending(false);
      return;
    }

    if (isAiPipelineEnabled() && squadId) {
      await recordLocalToneAndMaybePersist(supabase, squadId, text);
    }

    setSending(false);
  }

  async function handlePullBack(messageId: string) {
    if (!supabase) return;
    await supabase.from('messages').update({ status: 'retracted' }).eq('id', messageId);
    await refresh();
  }

  if (!configured) {
    return (
      <section className="panel space-y-sm" aria-labelledby="session-unconfigured">
        <h1 id="session-unconfigured" className="font-heading text-fluid-h2 text-gray-light">
          Session unavailable
        </h1>
        <p className="text-fluid-body text-gray-light">
          Configure Supabase environment variables to use the squad room. See the home page for setup steps.
        </p>
        <Link to="/" className="btn-primary inline-flex w-fit">
          Back to home
        </Link>
      </section>
    );
  }

  if (authLoading) {
    return <p className="text-gray-light">Loading session…</p>;
  }

  if (!squadId) {
    return (
      <section className="space-y-lg">
        <header className="space-y-sm">
          <h1 className="font-heading text-fluid-h2 text-gray-light">Squad room</h1>
          <p className="text-fluid-body text-gray-light max-w-prose">
            Open a squad to exchange structured messages. For development, create a private demo squad tied to your
            anonymous Supabase session.
          </p>
        </header>
        <div className="flex flex-wrap gap-md">
          <button type="button" className="btn-primary" onClick={() => void handleCreateDemo()} disabled={!supabase}>
            Create demo squad
          </button>
          <Link
            to="/onboarding"
            className="inline-flex items-center justify-center rounded-md border border-gray-light border-opacity-30 px-lg py-sm font-heading text-gray-light hover:border-teal hover:text-white"
          >
            Review onboarding
          </Link>
        </div>
        {demoError ? (
          <p className="text-fluid-small text-amber" role="alert">
            {demoError}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col gap-lg" aria-labelledby="session-title">
      <header className="flex flex-wrap items-end justify-between gap-md">
        <div>
          <h1 id="session-title" className="font-heading text-fluid-h2 text-gray-light">
            Squad session
          </h1>
          <p className="text-fluid-small text-gray-light opacity-80">Squad ID: {squadId}</p>
        </div>
        <button type="button" className="text-fluid-small text-teal underline-offset-2 hover:underline" onClick={() => refresh()}>
          Refresh
        </button>
      </header>

      {loading ? <p className="text-gray-light">Loading messages…</p> : null}
      {error ? (
        <p className="text-amber" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="flex flex-1 flex-col gap-sm overflow-y-auto rounded-lg border border-gray-light border-opacity-20 bg-navy-dark p-md min-h-[12rem]" aria-live="polite">
        {messages.length === 0 && !loading ? (
          <li className="text-gray-light text-fluid-small">No messages yet. Say hello calmly.</li>
        ) : null}
        {messages.map((m) => {
          const body = decodeMessagePayload(m.encrypted_content);
          const retracted = m.status === 'retracted';
          return (
            <li key={m.id} className="panel border border-gray-light border-opacity-10">
              <div className="flex flex-wrap items-start justify-between gap-sm">
                <p className={`text-fluid-body ${retracted ? 'text-gray-light line-through opacity-70' : ''}`}>
                  {retracted ? 'Message retracted' : body}
                </p>
                {!retracted ? (
                  <button
                    type="button"
                    className="text-fluid-small text-amber hover:underline"
                    onClick={() => void handlePullBack(m.id)}
                  >
                    Pull back
                  </button>
                ) : null}
              </div>
              <p className="mt-xs text-fluid-small text-gray-light opacity-60">{new Date(m.sent_at).toLocaleString()}</p>
            </li>
          );
        })}
      </ul>

      <form
        className="flex flex-col gap-sm"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSend();
        }}
      >
        <label htmlFor="composer" className="font-heading text-fluid-small text-gray-light">
          Message
        </label>
        <textarea
          id="composer"
          name="composer"
          rows={3}
          className="w-full rounded-md border border-gray-light border-opacity-30 bg-navy-dark px-md py-sm text-fluid-body text-white placeholder:text-gray-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          placeholder="Write with intention…"
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
          disabled={sending}
        />
        <div className="flex flex-wrap gap-md">
          <button type="submit" className="btn-primary" disabled={sending || !composer.trim()}>
            {sending ? 'Sending…' : 'Send'}
          </button>
          <button
            type="button"
            className="btn-warning"
            onClick={() => {
              setComposer('');
              if (supabase && squadId) {
                void logIntervention(supabase, squadId, 'slow_down_clear');
              }
            }}
          >
            Slow down (clear)
          </button>
        </div>
      </form>
    </section>
  );
}
