-- SquadRidge: Session phase pipeline
-- Adds structured dialogue phases, isolated inputs, and AI analysis storage.

-- Phase tracking on squads
ALTER TABLE public.squads
  ADD COLUMN IF NOT EXISTS current_phase TEXT DEFAULT 'waiting'
    CHECK (current_phase IN ('waiting','input','reveal','negotiation','analysis','complete')),
  ADD COLUMN IF NOT EXISTS phase_started_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS session_question TEXT,
  ADD COLUMN IF NOT EXISTS input_duration_ms INTEGER DEFAULT 1200000,
  ADD COLUMN IF NOT EXISTS negotiation_duration_ms INTEGER DEFAULT 1800000,
  ADD COLUMN IF NOT EXISTS min_participants INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 8;

-- Session inputs — isolated during input phase, revealed together after
CREATE TABLE IF NOT EXISTS public.session_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  encrypted_content TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  is_final BOOLEAN DEFAULT false,
  UNIQUE(squad_id, user_id)
);

ALTER TABLE public.session_inputs ENABLE ROW LEVEL SECURITY;

-- During input phase: only own input visible. After reveal: all squad inputs visible.
CREATE POLICY "inputs_select_phase_aware" ON public.session_inputs
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.squads s
      WHERE s.id = squad_id
        AND s.current_phase NOT IN ('waiting', 'input')
        AND public.auth_user_is_squad_member(squad_id)
    )
  );

CREATE POLICY "inputs_insert_member" ON public.session_inputs
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND public.auth_user_is_squad_member(squad_id)
  );

CREATE POLICY "inputs_update_own" ON public.session_inputs
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- AI analysis results
CREATE TABLE IF NOT EXISTS public.session_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  analysis_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ranked_proposals JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  UNIQUE(squad_id)
);

ALTER TABLE public.session_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analysis_select_member" ON public.session_analysis
  FOR SELECT USING (public.auth_user_is_squad_member(squad_id));

-- Service-role insert only (Edge Function writes analysis)
CREATE POLICY "analysis_insert_service" ON public.session_analysis
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Phase transition RPC — advances the session phase with timestamp
CREATE OR REPLACE FUNCTION public.advance_session_phase(
  p_squad_id UUID,
  p_next_phase TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_next_phase NOT IN ('waiting','input','reveal','negotiation','analysis','complete') THEN
    RAISE EXCEPTION 'Invalid phase: %', p_next_phase;
  END IF;

  UPDATE public.squads
  SET current_phase = p_next_phase,
      phase_started_at = timezone('utc'::text, now())
  WHERE id = p_squad_id;
END;
$$;

REVOKE ALL ON FUNCTION public.advance_session_phase(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.advance_session_phase(UUID, TEXT) TO authenticated;

-- Count finalized inputs for a squad (used by phase orchestrator)
CREATE OR REPLACE FUNCTION public.count_final_inputs(p_squad_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.session_inputs
  WHERE squad_id = p_squad_id AND is_final = true;
$$;

GRANT EXECUTE ON FUNCTION public.count_final_inputs(UUID) TO authenticated;

-- Realtime: replicate session_inputs for reveal synchronization
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_inputs;
