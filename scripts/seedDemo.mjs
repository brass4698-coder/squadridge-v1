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
 *   • The demo user is NOT a super_admin; it has the participant role only.
 *     Data seeded here is intentionally illustrative, not real.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seedDemo.mjs
 *
 * Or in one-off form:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seedDemo.mjs
 */

import { createClient } from '@supabase/supabase-js';

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

async function upsertDemoUser() {
  console.log(`[seedDemo] Ensuring demo user exists (${DEMO_EMAIL})…`);
  // `admin.createUser` errors if the user exists; treat that as success.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: 'SquadRidge Demo' },
  });

  if (createErr && !/already registered|already exists/i.test(createErr.message)) {
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
    console.log(`[seedDemo] Demo user existed (id=${match.id}).`);
    return match.id;
  }

  console.log(`[seedDemo] Created demo user (id=${created.user.id}).`);
  return created.user.id;
}

async function upsertProfileAndRole(userId) {
  console.log('[seedDemo] Upserting profile + participant role…');

  const { error: profileErr } = await admin.from('profiles').upsert(
    {
      id: userId,
      email: DEMO_EMAIL,
      display_name: 'SquadRidge Demo',
      status: 'active',
      primary_role: 'participant',
      onboarding_completed: true,
    },
    { onConflict: 'id' },
  );
  if (profileErr) throw profileErr;

  const { error: roleErr } = await admin.from('user_roles').upsert(
    {
      user_id: userId,
      role_key: 'participant',
      workspace_id: null,
      institution_id: null,
      granted_by: null,
    },
    { onConflict: 'user_id,role_key,workspace_id,institution_id' },
  );
  if (roleErr) throw roleErr;
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
      outcome_public: true,
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
