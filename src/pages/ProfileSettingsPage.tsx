import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { NextStepHint } from '../components/ui/NextStepHint';
import { DemoClaimConsentModal } from '../components/settings/DemoClaimConsentModal';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks';
import {
  isSupabaseConfigured,
  PROFILE_ROLE_VALUES,
  type ProfileRole,
  createDemoSessionClaim,
  finalizeDemoSessionClaim,
  issueDemoClaimConsent,
  describeDemoClaimError,
} from '../lib';

const MAX_TAGS = 5;

/** One line per role: select `title` + hint below (native option tooltips vary by browser). */
const ROLE_HINT: Record<ProfileRole, string> = {
  strategist: 'Plans campaigns and coordinates moves across the problem space.',
  analyst: 'Works with data, OSINT, and structured assessment.',
  policy: 'Law, doctrine, and institutional angles.',
  mediator: 'Facilitation and bridging between perspectives.',
  field: 'On-the-ground operations and lived context.',
  other: 'Describe your lane in your own words when none of the presets fit.',
};

function parseTagsList(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function fieldLabelClass(required: boolean) {
  return required
    ? 'block font-sans text-[0.8rem] font-medium text-[#a8b2c1]'
    : 'block font-sans text-[0.8rem] font-medium text-[#8892a4]';
}

function RequiredMark() {
  return (
    <span className="ml-1.5 align-middle font-sans text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#7dd3fc]/90">
      Required
    </span>
  );
}

function OptionalMark() {
  return (
    <span className="ml-1.5 align-middle font-sans text-[0.6rem] font-normal uppercase tracking-[0.08em] text-[#3f4c5c]">
      Optional
    </span>
  );
}

export function ProfileSettingsPage() {
  const [searchParams] = useSearchParams();
  const { session, loading: authLoading, ensureAnonymousSession, supabase } = useAuth();
  const { profile, loading: profileLoading, upsertProfile } = useProfile();

  useEffect(() => {
    if (searchParams.get('demo') !== '1') return;
    if (!isSupabaseConfigured()) return;
    void ensureAnonymousSession();
  }, [searchParams, ensureAnonymousSession]);

  const [callsign, setCallsign] = useState('');
  const [role, setRole] = useState<ProfileRole | ''>('');
  const [roleOther, setRoleOther] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');
  const [language, setLanguage] = useState('');
  const [region, setRegion] = useState('');
  const [timeWindow, setTimeWindow] = useState('');
  const [era, setEra] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** After a successful save, footer can say “All changes saved” until the user edits again. */
  const [ackSaved, setAckSaved] = useState(false);

  const [demoClaimBusy, setDemoClaimBusy] = useState(false);
  const [demoClaimErr, setDemoClaimErr] = useState<string | null>(null);
  const [demoClaimCode, setDemoClaimCode] = useState<string | null>(null);
  const [finalizeCode, setFinalizeCode] = useState('');
  const [finalizeBusy, setFinalizeBusy] = useState(false);
  const [finalizeErr, setFinalizeErr] = useState<string | null>(null);
  const [finalizeMsg, setFinalizeMsg] = useState<string | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentToken, setConsentToken] = useState<string | null>(null);
  const [consentExpiresAt, setConsentExpiresAt] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setCallsign(profile.callsign ?? '');
    setRole((profile.role_archetype as ProfileRole | null) ?? '');
    setRoleOther(profile.role_other_detail ?? '');
    setTagsRaw((profile.tags ?? []).join(', '));
    setLanguage(profile.language ?? '');
    setRegion(profile.region_hint ?? '');
    setTimeWindow(profile.timezone_window ?? '');
    setEra(profile.era_affiliation ?? '');
  }, [profile]);

  const roleOtherInvalid = useMemo(() => {
    if (role !== 'other') return false;
    const t = roleOther.trim();
    return t.length > 0 && (t.length < 8 || t.length > 80);
  }, [role, roleOther]);

  const tagsList = useMemo(() => parseTagsList(tagsRaw), [tagsRaw]);
  const tagsTooMany = tagsList.length > MAX_TAGS;

  const hasRole = Boolean(role);
  const canSave =
    callsign.trim().length >= 2 &&
    hasRole &&
    (role !== 'other' || (roleOther.trim().length >= 8 && roleOther.trim().length <= 80)) &&
    !roleOtherInvalid &&
    !tagsTooMany;

  const isDirty = useMemo(() => {
    if (!profile) return false;
    const savedTags = (profile.tags ?? []).join(', ');
    const sameTags = tagsRaw.trim() === savedTags.trim();
    return (
      callsign.trim() !== (profile.callsign ?? '').trim() ||
      (role || '') !== (profile.role_archetype ?? '') ||
      roleOther.trim() !== (profile.role_other_detail ?? '').trim() ||
      !sameTags ||
      language.trim() !== (profile.language ?? '').trim() ||
      region.trim() !== (profile.region_hint ?? '').trim() ||
      timeWindow.trim() !== (profile.timezone_window ?? '').trim() ||
      era.trim() !== (profile.era_affiliation ?? '').trim()
    );
  }, [profile, callsign, role, roleOther, tagsRaw, language, region, timeWindow, era]);

  useEffect(() => {
    if (isDirty) setAckSaved(false);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return undefined;
    const onBeforeUnload = (ev: BeforeUnloadEvent) => {
      ev.preventDefault();
      ev.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    const tags = parseTagsList(tagsRaw);
    if (tags.length > MAX_TAGS) {
      setSaving(false);
      setError(`Use at most ${MAX_TAGS} tags.`);
      return;
    }
    const { error: err } = await upsertProfile({
      callsign: callsign.trim(),
      role_archetype: hasRole ? role : null,
      role_other_detail: role === 'other' ? roleOther.trim() : null,
      tags,
      language: language.trim() || null,
      region_hint: region.trim() || null,
      timezone_window: timeWindow.trim() || null,
      era_affiliation: era.trim() || null,
    });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setAckSaved(true);
    setMessage('Saved. What squads see is what you set here.');
  }

  function confirmLeaveInApp(e: React.MouseEvent) {
    if (!isDirty) return;
    if (!window.confirm('You have unsaved profile changes. Leave without saving?')) {
      e.preventDefault();
    }
  }

  async function handleCreateDemoClaim() {
    if (!supabase) return;
    setDemoClaimBusy(true);
    setDemoClaimErr(null);
    setFinalizeMsg(null);
    try {
      const code = await createDemoSessionClaim(supabase);
      setDemoClaimCode(code);
    } catch (e) {
      setDemoClaimErr(e instanceof Error ? e.message : String(e));
    } finally {
      setDemoClaimBusy(false);
    }
  }

  async function handleRequestConsent() {
    if (!supabase) return;
    const trimmed = finalizeCode.trim();
    if (!trimmed) return;
    setFinalizeBusy(true);
    setFinalizeErr(null);
    setFinalizeMsg(null);
    try {
      const res = await issueDemoClaimConsent(supabase, trimmed);
      if (!res.ok) {
        setFinalizeErr(describeDemoClaimError(res.error_code));
        return;
      }
      setConsentToken(res.consent_token);
      setConsentExpiresAt(res.expires_at);
      setConsentChecked(false);
      setConsentOpen(true);
    } catch (e) {
      setFinalizeErr(e instanceof Error ? e.message : String(e));
    } finally {
      setFinalizeBusy(false);
    }
  }

  function closeConsentModal() {
    setConsentOpen(false);
    setConsentChecked(false);
    setConsentToken(null);
    setConsentExpiresAt(null);
  }

  async function handleConfirmFinalize() {
    if (!supabase) return;
    if (!consentToken) return;
    const trimmed = finalizeCode.trim();
    if (!trimmed) return;
    setFinalizeBusy(true);
    setFinalizeErr(null);
    setFinalizeMsg(null);
    try {
      const res = await finalizeDemoSessionClaim(supabase, trimmed, consentToken);
      if (!res.ok) {
        setFinalizeErr(describeDemoClaimError(res.error_code));
        closeConsentModal();
        return;
      }
      const n = res.migrated_memberships;
      setFinalizeMsg(
        n > 0
          ? `Transfer applied. Squad memberships migrated: ${n}.`
          : 'Transfer completed. No new memberships needed migrating.',
      );
      setFinalizeCode('');
      setDemoClaimCode(null);
      closeConsentModal();
    } catch (e) {
      setFinalizeErr(e instanceof Error ? e.message : String(e));
      closeConsentModal();
    } finally {
      setFinalizeBusy(false);
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-copy px-gutter py-12">
        <p className="text-[#8892a4]">Supabase is not configured.</p>
        <Link
          to="/"
          className="mt-4 inline-block text-teal-light underline-offset-4 hover:underline"
        >
          Home
        </Link>
      </div>
    );
  }

  if (authLoading || !session) {
    return (
      <div className="mx-auto max-w-copy px-gutter py-12 font-sans text-[#8892a4]">
        {authLoading ? 'Loading…' : 'Sign in to edit your profile.'}
      </div>
    );
  }

  if (profileLoading && !profile) {
    return (
      <div className="mx-auto max-w-copy px-gutter py-12 font-sans text-[#8892a4]">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[560px] px-gutter py-12">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(36vh,22rem)] bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(0,194,178,0.055)_0%,transparent_58%)]"
        aria-hidden
      />
      <div className="relative z-[1]">
        <p className="mb-0 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-teal/80">
          Settings
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h1
            className="font-heading font-extrabold text-[#f1f5f9]"
            style={{
              fontSize: 'clamp(1.65rem, 2.8vw, 2.1rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.12,
            }}
          >
            Profile &amp; keys
          </h1>
          {isDirty ? (
            <p
              className="shrink-0 font-sans text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-amber-300/95"
              role="status"
              aria-live="polite"
            >
              Unsaved changes
            </p>
          ) : null}
        </div>
        <p className="mt-2 max-w-[52ch] font-sans text-[0.9rem] font-medium leading-relaxed text-[#b8c5d3]">
          This profile is how you&apos;ll appear in rooms; it never includes your real-world
          identifiers.
        </p>
        <p className="mt-3 max-w-[52ch] font-sans text-[0.95rem] leading-relaxed text-[#c4cdd9]">
          These settings shape how you&apos;re seen in squads and how we route you.
        </p>
        <p className="mt-3 max-w-[52ch] font-sans text-[0.95rem] leading-relaxed text-[#8892a4]">
          We verify you without building a dossier. What you set here is what squads see—callsign,
          lane, and tags. Below that, coarse hints help matching without turning this into a
          dossier.
        </p>
        <p className="mt-3 max-w-[52ch] font-sans text-[0.9rem] leading-relaxed text-[#6b7280]">
          Squads never see your email, phone, or real-world ID—only what&apos;s on this page.
        </p>
        {/* When ZK commitments ship, surface verified-attribute flags here (ADR 003). */}
        <form
          id="profile-settings-form"
          className="mt-10 space-y-12 pb-28"
          onSubmit={(e) => void handleSave(e)}
        >
          {error ? (
            <p className="font-sans text-[0.875rem] text-amber" role="alert">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="font-sans text-[0.875rem] text-[#6ee7b7]/90" role="status">
              {message}
            </p>
          ) : null}

          <section
            className="space-y-6 rounded-xl border border-[#1a2236]/70 bg-[#060a10]/55 p-6 sm:p-7"
            aria-labelledby="pf-identity-heading"
          >
            <div>
              <h2
                id="pf-identity-heading"
                className="font-heading text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]"
              >
                In the room
              </h2>
              <p className="mt-1.5 max-w-[52ch] font-sans text-[0.8rem] leading-relaxed text-[#4b5563]">
                The minimum squads need to address you and understand your lane.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="pf-callsign" className={fieldLabelClass(true)}>
                Callsign
                <RequiredMark />
              </label>
              <input
                id="pf-callsign"
                data-demo="profile-callsign"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                className="w-full rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none"
                autoComplete="off"
                aria-describedby="pf-callsign-hint"
              />
              <p
                id="pf-callsign-hint"
                className="font-sans text-[0.78rem] leading-relaxed text-[#5c6570]"
              >
                Avoid real names or handles you use elsewhere; pick something memorable (e.g.{' '}
                <span className="font-mono text-[0.76rem] text-[#94a3b8]">Falcon-23</span>).
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="pf-role" className={fieldLabelClass(true)}>
                Role
                <RequiredMark />
              </label>
              <p
                id="pf-role-desc"
                className="font-sans text-[0.78rem] leading-relaxed text-[#5c6570]"
              >
                How you&apos;ll primarily contribute in squads.
              </p>
              <select
                id="pf-role"
                data-demo="profile-role"
                value={role}
                onChange={(e) => setRole(e.target.value as ProfileRole | '')}
                className="w-full rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none"
                aria-describedby="pf-role-desc pf-role-hint"
              >
                <option value="">Select…</option>
                {PROFILE_ROLE_VALUES.map((r) => (
                  <option key={r} value={r} title={ROLE_HINT[r]}>
                    {r === 'field'
                      ? 'Field practitioner'
                      : r === 'other'
                        ? 'Other'
                        : r.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <p
                id="pf-role-hint"
                className={
                  role && role !== 'other' && ROLE_HINT[role]
                    ? 'font-sans text-[0.78rem] leading-relaxed text-[#5c6570]'
                    : role === 'other'
                      ? 'font-sans text-[0.78rem] leading-relaxed text-[#5c6570]'
                      : 'sr-only'
                }
              >
                {role === 'other'
                  ? 'Use the field below in your own words.'
                  : role && ROLE_HINT[role as ProfileRole]
                    ? ROLE_HINT[role as ProfileRole]
                    : 'Choose the lane that best matches how you show up.'}
              </p>
            </div>

            {role === 'other' ? (
              <div className="space-y-2">
                <label htmlFor="pf-role-other" className={fieldLabelClass(true)}>
                  Describe your lane (8–80 characters)
                  <RequiredMark />
                </label>
                <textarea
                  id="pf-role-other"
                  value={roleOther}
                  onChange={(e) => setRoleOther(e.target.value.slice(0, 80))}
                  rows={3}
                  className="w-full resize-y rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none"
                />
                {roleOtherInvalid ? (
                  <p className="font-sans text-[0.8rem] text-amber">
                    Use between 8 and 80 characters for this lane.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <label htmlFor="pf-tags" className={fieldLabelClass(false)}>
                  Tags
                  <OptionalMark />
                </label>
                <span
                  className={`font-mono text-[0.72rem] font-medium tabular-nums ${
                    tagsTooMany
                      ? 'text-amber'
                      : tagsList.length >= MAX_TAGS
                        ? 'text-teal-light/90'
                        : 'text-[#64748b]'
                  }`}
                  aria-live="polite"
                >
                  {tagsList.length} / {MAX_TAGS} tags
                </span>
              </div>
              <p className="font-sans text-[0.78rem] leading-relaxed text-[#5c6570]">
                Comma-separated. Aim for 3–5 tags; the {MAX_TAGS}-tag cap keeps routing cues
                scannable.
              </p>
              {tagsList.length > 0 ? (
                <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Parsed tags">
                  {tagsList.slice(0, MAX_TAGS).map((t) => (
                    <li
                      key={t}
                      className="inline-flex max-w-full truncate rounded-md border border-[#2d3f55]/80 bg-[#0c1018] px-2 py-0.5 font-mono text-[0.68rem] text-[#94a3b8]"
                    >
                      {t}
                    </li>
                  ))}
                  {tagsTooMany ? (
                    <li className="inline-flex items-center rounded-md border border-amber/40 bg-amber/10 px-2 py-0.5 font-sans text-[0.68rem] font-medium text-amber">
                      +{tagsList.length - MAX_TAGS} over cap
                    </li>
                  ) : null}
                </ul>
              ) : null}
              <input
                id="pf-tags"
                data-demo="profile-tags"
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                placeholder="e.g. cross_cultural_dialogue, military_veteran"
                className={`w-full rounded-[8px] border bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] placeholder:text-[#3d4f63] focus-visible:outline-none ${
                  tagsTooMany
                    ? 'border-amber/50 focus-visible:border-amber/60'
                    : 'border-[#1a2236] focus-visible:border-[rgba(0,194,178,0.4)]'
                }`}
                aria-invalid={tagsTooMany}
                aria-describedby={
                  [tagsTooMany ? 'pf-tags-error' : '', 'pf-tags-count-hint']
                    .filter(Boolean)
                    .join(' ') || undefined
                }
              />
              <p id="pf-tags-count-hint" className="sr-only">
                Up to {MAX_TAGS} separate tags after splitting on commas.
              </p>
              {tagsTooMany ? (
                <p id="pf-tags-error" className="font-sans text-[0.8rem] text-amber" role="alert">
                  Use at most {MAX_TAGS} tags.
                </p>
              ) : null}
            </div>
          </section>

          <section
            className="space-y-6 rounded-xl border border-[#1a2236]/70 bg-[#060a10]/55 p-6 sm:p-8"
            aria-labelledby="pf-routing-heading"
          >
            <div>
              <h2
                id="pf-routing-heading"
                className="font-heading text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]"
              >
                Routing hints
              </h2>
              <p className="mt-1.5 max-w-[52ch] font-sans text-[0.8rem] leading-relaxed text-[#4b5563]">
                Optional signals for matching — keep them coarse; you can leave any blank.
              </p>
              <p className="mt-2 max-w-[52ch] font-sans text-[0.8rem] leading-relaxed text-[#5c6570]">
                <strong className="font-semibold text-[#cbd5e1]">Used for matching only</strong>
                <span className="text-[#64748b]"> — </span>
                <span className="text-[#94a3b8]">not shown to squads.</span>
              </p>
              <details className="group mt-3 rounded-lg border border-[#1e293b]/90 bg-[#070b10]/60 px-3 py-2">
                <summary className="cursor-pointer list-none font-sans text-[0.78rem] font-medium text-teal-light/90 [&::-webkit-details-marker]:hidden">
                  <span className="underline decoration-teal/30 underline-offset-2 group-open:decoration-teal/60">
                    Why we ask for this
                  </span>
                </summary>
                <p className="mt-2 border-t border-[#1e293b]/80 pt-2 font-sans text-[0.78rem] leading-relaxed text-[#64748b]">
                  Matching needs coarse language, region, and timing hints—we don&apos;t use them to
                  build a dossier, and squads never see these fields. For technical scope, see{' '}
                  <Link
                    to="/security"
                    className="text-teal-light/90 underline-offset-2 hover:underline"
                  >
                    Security boundaries
                  </Link>
                  .
                </p>
              </details>
            </div>

            <div className="space-y-2">
              <label htmlFor="pf-era" className={fieldLabelClass(false)}>
                Era lens
                <OptionalMark />
              </label>
              <p className="font-sans text-[0.78rem] leading-relaxed text-[#5c6570]">
                What eras or events shape how you see this conflict?
              </p>
              <input
                id="pf-era"
                data-demo="profile-era"
                value={era}
                onChange={(e) => setEra(e.target.value)}
                placeholder="e.g. Cold War, post-2014, future scenarios"
                className="w-full rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] placeholder:text-[#3d4f63] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-1">
              <div className="space-y-2">
                <label htmlFor="pf-lang" className={fieldLabelClass(false)}>
                  Primary language
                  <OptionalMark />
                </label>
                <p className="font-sans text-[0.78rem] leading-relaxed text-[#5c6570]">
                  Coarse is fine; no need for dialects.
                </p>
                <input
                  id="pf-lang"
                  data-demo="profile-lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. English, Arabic"
                  className="w-full rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] placeholder:text-[#3d4f63] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="pf-region" className={fieldLabelClass(false)}>
                  Rough region
                  <OptionalMark />
                </label>
                <input
                  id="pf-region"
                  data-demo="profile-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Western Europe, MENA"
                  className="w-full rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] placeholder:text-[#3d4f63] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="pf-tw" className={fieldLabelClass(false)}>
                  Typical meeting window
                  <OptionalMark />
                </label>
                <p className="font-sans text-[0.78rem] leading-relaxed text-[#5c6570]">
                  Use your local time — no need to convert to UTC.
                </p>
                <input
                  id="pf-tw"
                  data-demo="profile-timewindow"
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  placeholder="e.g. weekday evenings, Sat mornings"
                  className="w-full rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] placeholder:text-[#3d4f63] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none"
                />
              </div>
            </div>
          </section>
        </form>

        {supabase ? (
          <section className="mt-10 rounded-[12px] border border-[#1e2a3a] bg-[#0c1118]/80 p-6">
            <h2 className="font-heading text-[1.05rem] font-semibold uppercase tracking-[0.12em] text-[#a8b2c1]">
              Demo session hand-off
            </h2>
            <p className="mt-2 font-sans text-[0.78rem] leading-relaxed text-[#5c6570]">
              Optional migration for anonymous/demo squad membership after you verify. Generate a
              code in the demo session, then finalize here signed in as your verified account.
              Conflicts skip squads where you&apos;re already a member.
            </p>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#64748b]">
                  Step 1 — demo / anonymous session
                </p>
                <button
                  type="button"
                  disabled={demoClaimBusy}
                  onClick={() => void handleCreateDemoClaim()}
                  className="inline-flex min-h-[40px] w-full items-center justify-center rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 font-sans text-[0.88rem] text-[#e2e8f0] transition hover:bg-[#131c2e] disabled:opacity-60"
                >
                  {demoClaimBusy ? 'Generating…' : 'Generate transfer code'}
                </button>
                {demoClaimCode ? (
                  <p className="break-all rounded-[6px] border border-[#1a2536] bg-[#080c12] px-3 py-2 font-mono text-[0.8rem] text-teal-light/95">
                    {demoClaimCode}
                  </p>
                ) : null}
                {demoClaimErr ? (
                  <p className="font-sans text-[0.8rem] text-rose-300/95">{demoClaimErr}</p>
                ) : null}
              </div>
              <div className="space-y-3">
                <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#64748b]">
                  Step 2 — verified account
                </p>
                <label htmlFor="demo-claim-finalize" className="sr-only">
                  Paste claim code
                </label>
                <input
                  id="demo-claim-finalize"
                  value={finalizeCode}
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(e) => setFinalizeCode(e.target.value)}
                  placeholder="Paste code from demo session…"
                  className="w-full rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-mono text-[0.85rem] text-[#e2e8f0] placeholder:text-[#3d4f63] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none"
                />
                <button
                  type="button"
                  disabled={finalizeBusy || !finalizeCode.trim()}
                  onClick={() => void handleRequestConsent()}
                  className="inline-flex min-h-[40px] w-full items-center justify-center rounded-[8px] border-0 bg-teal/90 px-4 font-heading text-[0.88rem] font-semibold text-[#0b0f1a] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderRadius: 8 }}
                >
                  {finalizeBusy ? 'Working…' : 'Review and confirm transfer'}
                </button>
                {finalizeMsg ? (
                  <p className="font-sans text-[0.82rem] text-[#94d82d]/95">{finalizeMsg}</p>
                ) : null}
                {finalizeErr ? (
                  <p className="font-sans text-[0.8rem] text-rose-300/95">{finalizeErr}</p>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <DemoClaimConsentModal
          open={consentOpen}
          busy={finalizeBusy}
          consented={consentChecked}
          onConsentChange={setConsentChecked}
          expiresAt={consentExpiresAt}
          onConfirm={() => void handleConfirmFinalize()}
          onCancel={closeConsentModal}
        />

        <NextStepHint className="mt-8 border-[#1e2a3a] bg-[#0c1118]/60">
          <span className="font-medium text-slate-400">Next:</span> When you&apos;re ready to match,
          use Find squad from the menu. This profile helps route you into the right pool.
        </NextStepHint>

        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center border-t border-[#1a2236] bg-[#080c12]/92 px-gutter py-3 backdrop-blur-md sm:px-6"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div className="pointer-events-auto flex w-full max-w-[560px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="min-w-0 font-sans text-[0.8rem] leading-snug">
              {isDirty ? (
                <span className="font-medium text-amber-200/95">
                  Unsaved changes — click Save profile to apply.
                </span>
              ) : ackSaved ? (
                <span className="text-[#a8b8c9]">All changes saved to your profile.</span>
              ) : (
                <span className="text-[#64748b]">
                  No unsaved changes (same as last saved profile).
                </span>
              )}
            </p>
            <button
              type="submit"
              form="profile-settings-form"
              disabled={!canSave || saving}
              className="inline-flex min-h-[44px] w-full shrink-0 items-center justify-center border-0 bg-teal px-8 py-3 font-heading text-[0.95rem] font-semibold text-[#0b0f1a] transition-opacity hover:opacity-[0.92] disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto sm:w-auto"
              style={{ borderRadius: 8 }}
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </div>

        <p className="mt-10 font-sans text-[0.85rem] text-[#4b5563]">
          <Link
            to="/"
            onClick={confirmLeaveInApp}
            className="text-[#8892a4] underline-offset-4 hover:text-[#c4cdd9] hover:underline"
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
