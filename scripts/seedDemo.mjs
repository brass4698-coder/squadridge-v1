#!/usr/bin/env node
/**
 * seedDemo.mjs — safe re-runnable seed for the SquadRidge demo account.
 *
 * Creates (or refreshes) the demo user + example sessions/participants/messages
 * so that the "Try the Demo" button on /sign-in lands the user in a fully
 * populated app. This script is idempotent — upserts everywhere; re-run any
 * time to rebuild the demo state.
 *
 * ─── Required env ───────────────────────────────────────────────────
 *   SUPABASE_URL              (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY (needed to create the user + bypass RLS)
 *
 * Optional env (fallbacks match the app's defaults in src/lib/demoLogin.ts):
 *   DEMO_EMAIL     — default: demo@squadridge.com
 *   DEMO_PASSWORD  — default: SquadRidgeDemo2026!
 *
 * SECURITY:
 *   • NEVER commit the service role key. Put it in .env.local (already in
 *     .gitignore) and load with `node --env-file=.env.local scripts/seedDemo.mjs`.
 *     The demo user is NOT a super_admin; it has facilitator + participant
 *     roles so "Try the Demo" lands in the facilitator workspace with seeded
 *     sessions. Data seeded here is intentionally illustrative, not real.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seedDemo.mjs
 *
 * Or in one-off form:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seedDemo.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEMO_EMAIL = (process.env.DEMO_EMAIL ?? 'demo@squadridge.com').trim();
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? 'SquadRidgeDemo2026!';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    '[seedDemo] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
      '           Put them in .env.local and re-run with:\n' +
      '             node --env-file=.env.local scripts/seedDemo.mjs',
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Run SQL against the linked remote DB. Needed for profile privileged columns —
 * `guard_profiles_privileged_columns` only opens when
 * `app.allow_profile_privileged_update=true` in the same transaction (same latch
 * as `accept_invite`). PostgREST upserts cannot set that GUC.
 */
function runLinkedSql(sql) {
  // Private dir + restrictive file mode — avoid predictable paths in the shared temp root.
  const dir = mkdtempSync(join(tmpdir(), 'squadridge-seed-demo-'));
  try {
    try {
      chmodSync(dir, 0o700);
    } catch {
      /* Windows may ignore mode; directory is still uniquely named */
    }
    const sqlPath = join(dir, 'seed.sql');
    writeFileSync(sqlPath, sql, { encoding: 'utf8', mode: 0o600 });
    execFileSync(
      'npx',
      ['supabase', 'db', 'query', '--linked', '--agent=no', '-f', sqlPath],
      { stdio: 'inherit', shell: true },
    );
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

async function upsertDemoUser() {
  console.log(`[seedDemo] Ensuring demo user exists (${DEMO_EMAIL})…`);
  // `admin.createUser` errors if the user exists; treat that as success.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: 'SquadRidge Demo' },
  });

  if (
    createErr &&
    !/already (been )?registered|already exists|email.?address.?.*registered/i.test(
      createErr.message,
    )
  ) {
    throw createErr;
  }

  // If already existed, fetch the id via listUsers (paginated). For small
  // deployments a single page is fine; grow this if the demo grows.
  if (!created?.user) {
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) throw listErr;
    const match = list.users.find((u) => (u.email ?? '').toLowerCase() === DEMO_EMAIL.toLowerCase());
    if (!match) {
      throw new Error(`[seedDemo] Could not find or create demo user (${DEMO_EMAIL}).`);
    }
    const { error: pwErr } = await admin.auth.admin.updateUserById(match.id, {
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    if (pwErr) throw pwErr;
    console.log(`[seedDemo] Demo user existed (id=${match.id}); password refreshed.`);
    return match.id;
  }

  console.log(`[seedDemo] Created demo user (id=${created.user.id}).`);
  return created.user.id;
}

async function upsertProfileAndRole(userId) {
  console.log('[seedDemo] Upserting profile + participant role…');

  const emailLit = DEMO_EMAIL.replace(/'/g, "''");
  const idLit = userId.replace(/'/g, "''");

  // Single DO block so `supabase db query` / Management API runs the full
  // privileged update in one statement (multi-statement files only execute first).
  runLinkedSql(`
do $$
begin
  perform set_config('app.allow_profile_privileged_update', 'true', true);

  insert into public.profiles (
    id, email, display_name, status, primary_role, onboarding_completed
  ) values (
    '${idLit}'::uuid,
    '${emailLit}',
    'SquadRidge Demo',
    'active',
    'facilitator',
    true
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = excluded.display_name,
    status = excluded.status,
    primary_role = excluded.primary_role,
    onboarding_completed = excluded.onboarding_completed;

  delete from public.user_roles
  where user_id = '${idLit}'::uuid
    and role_key in ('participant', 'facilitator')
    and workspace_id is null
    and institution_id is null;

  insert into public.user_roles (
    user_id, role_key, workspace_id, institution_id, granted_by
  ) values
    ('${idLit}'::uuid, 'facilitator', null, null, null),
    ('${idLit}'::uuid, 'participant', null, null, null);
end $$;
`);
}

async function upsertDemoSessions(facilitatorId) {
  console.log('[seedDemo] Upserting demo sessions…');

  const rows = [
    {
      id: '11111111-1111-4111-8111-111111111111',
      facilitator_id: facilitatorId,
      title: 'Landlord-Tenant Dispute — Downtown Loft',
      conflict_type: 'housing',
      language: 'en',
      max_participants: 4,
      identity_verification_required: true,
      outcome_public: false,
      status: 'live',
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      facilitator_id: facilitatorId,
      title: 'Business Partnership Disagreement — Equity Rebalance',
      conflict_type: 'business',
      language: 'en',
      max_participants: 3,
      identity_verification_required: true,
      outcome_public: false,
      status: 'paused',
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      facilitator_id: facilitatorId,
      title: 'Workplace Conflict — Manager Escalation',
      conflict_type: 'workplace',
      language: 'en',
      max_participants: 3,
      identity_verification_required: false,
      // Keep demo outcome in the workspace — do not expose as a public ledger release.
      outcome_public: false,
      status: 'released',
    },
  ];

  const { error } = await admin.from('sessions').upsert(rows, { onConflict: 'id' });
  if (error) throw error;
  return rows;
}

async function upsertDemoParticipants(sessions) {
  console.log('[seedDemo] Upserting demo participants…');
  const participants = sessions.flatMap((s, sessionIdx) =>
    [
      { codename: 'PartyA', role: 'participant' },
      { codename: 'PartyB', role: 'participant' },
    ].map((p, i) => ({
      id: `aaaaaaaa-${sessionIdx}${i}00-4000-8000-000000000000`,
      session_id: s.id,
      codename: p.codename,
      invite_token: `demo-${s.id.slice(0, 8)}-${p.codename.toLowerCase()}`,
      invite_used: true,
      email_hash: null,
      verification_status: 'verified',
      document_submitted: false,
      consented_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      admitted_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      left_at: null,
    })),
  );

  const { error } = await admin.from('participants').upsert(participants, { onConflict: 'id' });
  if (error) throw error;
}

async function upsertDemoOutcome(sessionId, status) {
  const { error } = await admin.from('outcome_records').upsert(
    {
      id: `cccccccc-${sessionId.slice(0, 4)}-4000-8000-000000000000`,
      session_id: sessionId,
      summary: 'Both parties agreed on a revised schedule and a follow-up review in 30 days.',
      agreed_terms: '1. Rent payments resume on the first of each month.\n2. Repairs completed by the 15th.',
      pending_items: 'Signed addendum pending countersignature.',
      facilitator_notes: 'Session ended calmly. Both parties comfortable with the outcome.',
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
      ledger_sha: status === 'published' ? 'demo-sha-placeholder' : null,
    },
    { onConflict: 'id' },
  );
  if (error) throw error;
}

async function main() {
  const userId = await upsertDemoUser();
  await upsertProfileAndRole(userId);
  // Sessions need a facilitator_id that references a real auth user. The
  // demo user has the participant role — but facilitator_id in the schema
  // is just a uuid pointer, so we can reuse the demo user id here without
  // granting facilitator privileges (RLS still gates writes elsewhere).
  const sessions = await upsertDemoSessions(userId);
  await upsertDemoParticipants(sessions);
  await upsertDemoOutcome(sessions[0].id, 'draft');
  await upsertDemoOutcome(sessions[1].id, 'pending_approval');
  await upsertDemoOutcome(sessions[2].id, 'published');
  console.log('[seedDemo] Done. Sign in as', DEMO_EMAIL, 'to explore.');
}

main().catch((e) => {
  console.error('[seedDemo] Failed:', e?.message ?? e);
  process.exit(1);
});
