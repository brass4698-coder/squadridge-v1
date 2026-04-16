import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { PROFILE_ROLE_VALUES, type ProfileRole } from '../lib/profile';
import { isSupabaseConfigured } from '../lib/env';

function parseTags(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ProfileSettingsPage() {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, upsertProfile } = useProfile();

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

  const hasRole = Boolean(role);
  const canSave =
    callsign.trim().length >= 2 &&
    hasRole &&
    (role !== 'other' || (roleOther.trim().length >= 8 && roleOther.trim().length <= 80)) &&
    !roleOtherInvalid;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    const tags = parseTags(tagsRaw);
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
    setMessage('Saved. What squads see is what you set here.');
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-copy px-md py-12">
        <p className="text-[#8892a4]">Supabase is not configured.</p>
        <Link to="/" className="mt-4 inline-block text-teal-light underline-offset-4 hover:underline">
          Home
        </Link>
      </div>
    );
  }

  if (authLoading || !session) {
    return (
      <div className="mx-auto max-w-copy px-md py-12 font-sans text-[#8892a4]">
        {authLoading ? 'Loading…' : 'Sign in to edit your profile.'}
      </div>
    );
  }

  if (profileLoading && !profile) {
    return (
      <div className="mx-auto max-w-copy px-md py-12 font-sans text-[#8892a4]">Loading profile…</div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[560px] px-md py-12">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(36vh,22rem)] bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(0,194,178,0.055)_0%,transparent_58%)]"
        aria-hidden
      />
      <div className="relative z-[1]">
        <p className="mb-0 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-teal/80">
          Settings
        </p>
        <h1
          className="mt-2 font-heading font-extrabold text-[#f1f5f9]"
          style={{ fontSize: 'clamp(1.65rem, 2.8vw, 2.1rem)', letterSpacing: '-0.03em', lineHeight: 1.12 }}
        >
          Profile &amp; keys
        </h1>
        <p className="mt-4 max-w-[52ch] font-sans text-[0.95rem] leading-relaxed text-[#8892a4]">
          We verify you without building a dossier. What you set here is what squads see—callsign, lane, and coarse
          placement hints for routing only.
        </p>
        {/* TODO(ZK): Surface public commitment / verified-attribute flags here instead of editable raw tags where proofs exist. */}
        <form className="mt-10 space-y-6" onSubmit={(e) => void handleSave(e)}>
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

          <div className="space-y-2">
            <label htmlFor="pf-callsign" className="block font-sans text-[0.8rem] font-medium text-[#a8b2c1]">
              Callsign
            </label>
            <input
              id="pf-callsign"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value)}
              className="w-full rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pf-role" className="block font-sans text-[0.8rem] font-medium text-[#a8b2c1]">
              Role
            </label>
            <select
              id="pf-role"
              value={role}
              onChange={(e) => setRole(e.target.value as ProfileRole | '')}
              className="w-full rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none"
            >
              <option value="">Select…</option>
              {PROFILE_ROLE_VALUES.map((r) => (
                <option key={r} value={r}>
                  {r === 'field' ? 'Field practitioner' : r.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {role === 'other' ? (
            <div className="space-y-2">
              <label htmlFor="pf-role-other" className="block font-sans text-[0.8rem] font-medium text-[#a8b2c1]">
                Describe your lane (8–80 characters)
              </label>
              <textarea
                id="pf-role-other"
                value={roleOther}
                onChange={(e) => setRoleOther(e.target.value.slice(0, 80))}
                rows={3}
                className="w-full resize-y rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none"
              />
              {roleOtherInvalid ? (
                <p className="font-sans text-[0.8rem] text-amber">Use between 8 and 80 characters for this lane.</p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="pf-tags" className="block font-sans text-[0.8rem] font-medium text-[#a8b2c1]">
              Tags (optional, comma-separated)
            </label>
            <input
              id="pf-tags"
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="e.g. cross_cultural_dialogue, military_veteran"
              className="w-full rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] placeholder:text-[#3d4f63] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pf-era" className="block font-sans text-[0.8rem] font-medium text-[#a8b2c1]">
              Era lens (optional)
            </label>
            <input
              id="pf-era"
              value={era}
              onChange={(e) => setEra(e.target.value)}
              className="w-full rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            <div className="space-y-2">
              <label htmlFor="pf-lang" className="block font-sans text-[0.8rem] font-medium text-[#a8b2c1]">
                Placement — language
              </label>
              <input
                id="pf-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="pf-region" className="block font-sans text-[0.8rem] font-medium text-[#a8b2c1]">
                Placement — region
              </label>
              <input
                id="pf-region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="pf-tw" className="block font-sans text-[0.8rem] font-medium text-[#a8b2c1]">
                Placement — time window
              </label>
              <input
                id="pf-tw"
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="w-full rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSave || saving}
            className="inline-flex min-h-[44px] items-center justify-center border-0 bg-teal px-8 py-3 font-heading text-[0.95rem] font-semibold text-[#0b0f1a] transition-opacity hover:opacity-[0.92] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ borderRadius: 8 }}
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>

        <p className="mt-10 font-sans text-[0.85rem] text-[#4b5563]">
          <Link to="/" className="text-[#8892a4] underline-offset-4 hover:text-[#c4cdd9] hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
