-- SquadRidge PostgreSQL Schema (Supabase)
-- Canonical migrations live in: ../../supabase/migrations/
-- Prefer applying those files in the Supabase SQL Editor or via CLI.
--
-- Dashboard or "schema for context" dumps may omit tables added in later migrations (e.g. profiles, waitlist)
-- or show foreign keys without ON DELETE actions. Trust the ordered migration files as source of truth.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Identity and Verification
-- We do not store PII. User rows mirror auth.users(id) (see Supabase trigger in migrations).
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'))
);

-- ZK proof commitments (hash-only; no raw PII). nullifier_hash prevents double-spend (Semaphore-style).
CREATE TABLE public.zk_proof_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    proof_commitment TEXT NOT NULL,
    nullifier_hash TEXT NOT NULL,
    attribute_scope TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX zk_proof_submissions_nullifier_hash_uidx ON public.zk_proof_submissions (nullifier_hash);

-- Stores verified attributes derived from ZK proofs
CREATE TABLE public.verified_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    attribute_type VARCHAR(100) NOT NULL, -- e.g., 'citizenship', 'role'
    attribute_value VARCHAR(255) NOT NULL, -- e.g., 'Region_A', 'practitioner'
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, attribute_type)
);

-- 2. Dialogue Sessions
CREATE TABLE public.squads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'forming' CHECK (status IN ('forming', 'active', 'completed', 'flagged')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL -- Enforces ephemerality
);

CREATE TABLE public.squad_members (
    squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (squad_id, user_id)
);

-- Messages are encrypted and ephemeral
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    payload_ciphertext TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'retracted', 'flagged'))
);

-- 3. Analytics and Moderation
-- Separated from core messaging to ensure privacy
CREATE TABLE public.sentiment_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    squad_id UUID REFERENCES public.squads(id) ON DELETE SET NULL, -- Keep metrics even if squad is deleted
    tension_level DECIMAL(5,2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
    intervention_type VARCHAR(100) NOT NULL, -- e.g., 'slow_down_prompt', 'pull_back_used'
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Pseudonymous profile (Phase 1) — see ../../supabase/migrations/20260415120000_profiles_phase1.sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    callsign TEXT NOT NULL DEFAULT '',
    role_archetype TEXT,
    role_other_detail VARCHAR(100),
    era_affiliation TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    language TEXT,
    region_hint TEXT,
    timezone_window TEXT,
    onboarding_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Waitlist (landing) — see ../../supabase/migrations/20250413120000_waitlist_signups.sql
CREATE TABLE public.waitlist_signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT waitlist_email_len CHECK (char_length(btrim(email)) >= 5 AND char_length(email) <= 320),
    CONSTRAINT waitlist_email_unique UNIQUE (email)
);

-- 6. Row Level Security (RLS), auth trigger, and Realtime
-- Full policies (including zk_proof_submissions, sentiment_metrics, interventions,
-- squad creation/join, message retraction, profiles, waitlist) are defined in:
--   supabase/migrations/20250413000000_initial_schema.sql
--   plus later migrations (profiles, waitlist RLS, ZK policy changes, etc.)
