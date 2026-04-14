-- SquadRidge: initial schema aligned with docs/technical/schema.sql
-- Apply via Supabase SQL Editor or: supabase db push (with CLI linked project)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Public profile row mirrors auth.users (no PII)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'))
);

-- ZK proof references (hashes / commitments only — no raw PII)
CREATE TABLE public.zk_proof_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    proof_commitment TEXT NOT NULL,
    attribute_scope TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.verified_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users (id) ON DELETE CASCADE,
    attribute_type VARCHAR(100) NOT NULL,
    attribute_value VARCHAR(255) NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, attribute_type)
);

CREATE TABLE public.squads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'forming' CHECK (status IN ('forming', 'active', 'completed', 'flagged')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE public.squad_members (
    squad_id UUID REFERENCES public.squads (id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users (id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (squad_id, user_id)
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    squad_id UUID REFERENCES public.squads (id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users (id) ON DELETE CASCADE,
    encrypted_content TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'retracted', 'flagged'))
);

CREATE TABLE public.sentiment_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    squad_id UUID REFERENCES public.squads (id) ON DELETE SET NULL,
    tension_level DECIMAL(5, 2) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    squad_id UUID REFERENCES public.squads (id) ON DELETE CASCADE,
    intervention_type VARCHAR(100) NOT NULL,
    triggered_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sync auth.users -> public.users
CREATE OR REPLACE FUNCTION public.handle_new_user ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
    INSERT INTO public.users (id)
        VALUES (NEW.id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user ();

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zk_proof_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "Users_select_own" ON public.users
    FOR SELECT USING (auth.uid () = id);

CREATE POLICY "Users_update_own" ON public.users
    FOR UPDATE USING (auth.uid () = id)
    WITH CHECK (auth.uid () = id);

-- zk_proof_submissions
CREATE POLICY "Zk_select_own" ON public.zk_proof_submissions
    FOR SELECT USING (auth.uid () = user_id);

CREATE POLICY "Zk_insert_own" ON public.zk_proof_submissions
    FOR INSERT WITH CHECK (auth.uid () = user_id);

-- verified_attributes
CREATE POLICY "Attrs_select_own" ON public.verified_attributes
    FOR SELECT USING (auth.uid () = user_id);

CREATE POLICY "Attrs_insert_own" ON public.verified_attributes
    FOR INSERT WITH CHECK (auth.uid () = user_id);

CREATE POLICY "Attrs_update_own" ON public.verified_attributes
    FOR UPDATE USING (auth.uid () = user_id)
    WITH CHECK (auth.uid () = user_id);

-- squads: members can read; authenticated users can create sessions
CREATE POLICY "Squads_select_member" ON public.squads
    FOR SELECT USING (EXISTS (
            SELECT 1
            FROM public.squad_members m
            WHERE m.squad_id = squads.id
                AND m.user_id = auth.uid ()));

CREATE POLICY "Squads_insert_authenticated" ON public.squads
    FOR INSERT WITH CHECK (auth.uid () IS NOT NULL);

CREATE POLICY "Squads_update_member" ON public.squads
    FOR UPDATE USING (EXISTS (
            SELECT 1
            FROM public.squad_members m
            WHERE m.squad_id = squads.id
                AND m.user_id = auth.uid ()));

-- squad_members
CREATE POLICY "Squad_members_select_participant" ON public.squad_members
    FOR SELECT USING (user_id = auth.uid ()
        OR EXISTS (
            SELECT 1
            FROM public.squad_members m
            WHERE m.squad_id = squad_members.squad_id
                AND m.user_id = auth.uid ()));

CREATE POLICY "Squad_members_insert_self" ON public.squad_members
    FOR INSERT WITH CHECK (user_id = auth.uid ());

-- messages
CREATE POLICY "Messages_select_squad" ON public.messages
    FOR SELECT USING (EXISTS (
            SELECT 1
            FROM public.squad_members m
            WHERE m.squad_id = messages.squad_id
                AND m.user_id = auth.uid ()));

CREATE POLICY "Messages_insert_squad" ON public.messages
    FOR INSERT WITH CHECK (EXISTS (
            SELECT 1
            FROM public.squad_members m
            WHERE m.squad_id = messages.squad_id
                AND m.user_id = auth.uid ())
        AND sender_id = auth.uid ());

CREATE POLICY "Messages_update_sender_retract" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid ())
    WITH CHECK (sender_id = auth.uid ());

-- sentiment_metrics: squad members read; insert for pipeline (client AI stub / edge later)
CREATE POLICY "Sentiment_select_squad" ON public.sentiment_metrics
    FOR SELECT USING (squad_id IS NULL
        OR EXISTS (
            SELECT 1
            FROM public.squad_members m
            WHERE m.squad_id = sentiment_metrics.squad_id
                AND m.user_id = auth.uid ()));

CREATE POLICY "Sentiment_insert_squad" ON public.sentiment_metrics
    FOR INSERT WITH CHECK (squad_id IS NULL
        OR EXISTS (
            SELECT 1
            FROM public.squad_members m
            WHERE m.squad_id = sentiment_metrics.squad_id
                AND m.user_id = auth.uid ()));

-- interventions
CREATE POLICY "Interventions_select_squad" ON public.interventions
    FOR SELECT USING (EXISTS (
            SELECT 1
            FROM public.squad_members m
            WHERE m.squad_id = interventions.squad_id
                AND m.user_id = auth.uid ()));

CREATE POLICY "Interventions_insert_squad" ON public.interventions
    FOR INSERT WITH CHECK (EXISTS (
            SELECT 1
            FROM public.squad_members m
            WHERE m.squad_id = interventions.squad_id
                AND m.user_id = auth.uid ()));

-- Realtime: replicate messages for squad channels
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
