import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { getSupabase, getWaitlistFormUrl, isSupabaseConfigured } from '../lib';
import { WAITLIST_CHANGED_EVENT } from '../components/HeroWaitlistCounter';

export type WaitlistFormStatus = 'idle' | 'loading' | 'success' | 'error';

export function useWaitlistForm() {
  const externalUrl = getWaitlistFormUrl();
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<WaitlistFormStatus>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    void (async () => {
      const { data, error } = await getSupabase().rpc('waitlist_signup_count');
      if (cancelled || error) return;
      if (data == null) return;
      const n = typeof data === 'number' ? data : Number.parseInt(String(data), 10);
      if (Number.isFinite(n)) setWaitlistCount(Math.max(0, n));
    })();
    return () => {
      cancelled = true;
    };
  }, [configured]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trap = (
        e.currentTarget.elements.namedItem('website') as HTMLInputElement | null
      )?.value?.trim();
      if (trap) return;
      const trimmed = email.trim();
      if (!trimmed) return;
      if (!configured) {
        setFeedback('Waitlist capture needs Supabase env vars or an external form URL.');
        setStatus('error');
        return;
      }
      setStatus('loading');
      setFeedback(null);
      try {
        const { error } = await getSupabase().from('waitlist_signups').insert({ email: trimmed });
        if (error) {
          if (error.code === '23505') {
            setFeedback("You're already on the list. We'll be in touch.");
            setStatus('success');
          } else {
            setFeedback(error.message);
            setStatus('error');
          }
          return;
        }
        setStatus('success');
        setFeedback("Thanks — you're on the list.");
        setEmail('');
        window.dispatchEvent(new Event(WAITLIST_CHANGED_EVENT));
        const { data: c } = await getSupabase().rpc('waitlist_signup_count');
        if (c != null) {
          const n = typeof c === 'number' ? c : Number.parseInt(String(c), 10);
          if (Number.isFinite(n)) setWaitlistCount(Math.max(0, n));
        }
      } catch (err) {
        setFeedback(err instanceof Error ? err.message : 'Something went wrong.');
        setStatus('error');
      }
    },
    [configured, email],
  );

  return {
    email,
    setEmail,
    status,
    feedback,
    handleSubmit,
    waitlistCount,
    configured,
    externalUrl,
  };
}
