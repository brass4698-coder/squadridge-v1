-- SquadRidge PostgreSQL Schema (Supabase)
-- Canonical migrations live in: ../../supabase/migrations/
-- Prefer applying those files in the Supabase SQL Editor or via CLI.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Identity and Verification
-- We do not store PII. User rows mirror auth.users(id) (see Supabase trigger in migrations).
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'))
);

-- ZK proof commitments (hash-only; no raw PII)
CREATE TABLE public.zk_proof_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    proof_commitment TEXT NOT NULL,
    attribute_scope TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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
    encrypted_content TEXT NOT NULL,
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

-- 4. Row Level Security (RLS), auth trigger, and Realtime
-- Full policies (including zk_proof_submissions, sentiment_metrics, interventions,
-- squad creation/join, message retraction) are defined in:
--   supabase/migrations/20250413000000_initial_schema.sql
