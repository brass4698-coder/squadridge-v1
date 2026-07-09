-- ============================================================
-- Migration: financial_projections table + RLS policies
-- Issue #48 — Financial Projections investor-facing dashboard
-- ============================================================
-- RLS uses the user_roles table pattern consistent with
-- src/contexts/AuthContext.tsx → fetchUserRoles()
-- Investor-level access = super_admin | institution_admin | analyst

-- 1. Create the table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financial_projections (
  id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario        text            NOT NULL CHECK (scenario IN ('baseline', 'optimistic', 'conservative')),
  period_label    text            NOT NULL,           -- e.g. 'Q1 2026'
  period_start    date            NOT NULL,
  period_end      date            NOT NULL,
  arr_usd         numeric(15, 2)  NOT NULL DEFAULT 0,
  mau             integer         NOT NULL DEFAULT 0,
  revenue_usd     numeric(15, 2)  NOT NULL DEFAULT 0,
  runway_months   integer,
  burn_rate_usd   numeric(15, 2),
  notes           text,
  created_at      timestamptz     NOT NULL DEFAULT now(),
  updated_at      timestamptz     NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.financial_projections IS
  'Investor-facing financial forecast data. Access restricted via RLS to super_admin, institution_admin, and analyst roles in user_roles table.';

-- 2. Enable RLS
-- ------------------------------------------------------------
ALTER TABLE public.financial_projections ENABLE ROW LEVEL SECURITY;

-- 3. Deny-all default (belt-and-suspenders)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "deny_all_default" ON public.financial_projections;
CREATE POLICY "deny_all_default"
  ON public.financial_projections
  AS RESTRICTIVE
  FOR ALL
  TO public
  USING (false);

-- 4. READ policy — investor-tier roles via user_roles table
-- ------------------------------------------------------------
-- Matches the role architecture in:
--   src/types/roles.ts  → RoleKey union
--   src/lib/roles.ts    → fetchUserRoles()
--   src/contexts/AuthContext.tsx → roles state
--
-- Roles granted read access:
--   super_admin       — full platform access
--   institution_admin — institutional partner access
--   analyst           — read-only financial/data access
--
-- NOTE: 'investor' is not a role in the current RoleKey union.
-- Use analyst role for external investor read-only access.
DROP POLICY IF EXISTS "investors_can_read" ON public.financial_projections;
CREATE POLICY "investors_can_read"
  ON public.financial_projections
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM   public.user_roles ur
      WHERE  ur.user_id = auth.uid()
        AND  ur.role_key IN ('super_admin', 'institution_admin', 'analyst')
    )
  );

-- 5. WRITE policy — super_admin only (no browser client writes)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "admins_can_write" ON public.financial_projections;
CREATE POLICY "admins_can_write"
  ON public.financial_projections
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM   public.user_roles ur
      WHERE  ur.user_id = auth.uid()
        AND  ur.role_key = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM   public.user_roles ur
      WHERE  ur.user_id = auth.uid()
        AND  ur.role_key = 'super_admin'
    )
  );

-- 6. Auto-update updated_at timestamp
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_financial_projections_updated_at ON public.financial_projections;
CREATE TRIGGER trg_financial_projections_updated_at
  BEFORE UPDATE ON public.financial_projections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 7. Indexes for common query patterns
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_fp_scenario_period
  ON public.financial_projections (scenario, period_start);

CREATE INDEX IF NOT EXISTS idx_fp_user_roles_lookup
  ON public.user_roles (user_id, role_key);

-- 8. Seed placeholder rows (safe in dev; replace with real model in prod)
-- ------------------------------------------------------------
INSERT INTO public.financial_projections
  (scenario, period_label, period_start, period_end, arr_usd, mau, revenue_usd, runway_months, burn_rate_usd, notes)
VALUES
  ('baseline',     'Q3 2026', '2026-07-01', '2026-09-30',  120000,   800,  10000, 18, 8000,  'Seed stage, pre-launch beta'),
  ('baseline',     'Q4 2026', '2026-10-01', '2026-12-31',  280000,  1800,  23333, 16, 9000,  'Beta launch, first cohort'),
  ('baseline',     'Q1 2027', '2027-01-01', '2027-03-31',  480000,  3200,  40000, 14, 10000, 'Growth from grant funding'),
  ('baseline',     'Q2 2027', '2027-04-01', '2027-06-30',  720000,  5000,  60000, 12, 11000, 'Tier 2 city expansion'),
  ('baseline',     'Q3 2027', '2027-07-01', '2027-09-30',  960000,  7000,  80000, 11, 12000, 'Partnership pipeline active'),
  ('baseline',     'Q4 2027', '2027-10-01', '2027-12-31', 1200000,  9500, 100000, 10, 12000, 'Series A target runway'),
  ('optimistic',   'Q3 2026', '2026-07-01', '2026-09-30',  180000,  1200,  15000, 22, 8000,  'Strong early enterprise interest'),
  ('optimistic',   'Q4 2026', '2026-10-01', '2026-12-31',  420000,  2800,  35000, 20, 9000,  'Viral community growth'),
  ('optimistic',   'Q1 2027', '2027-01-01', '2027-03-31',  720000,  5000,  60000, 18, 10000, 'Gov contract signed'),
  ('optimistic',   'Q2 2027', '2027-04-01', '2027-06-30', 1080000,  8000,  90000, 16, 11500, 'International pilot'),
  ('optimistic',   'Q3 2027', '2027-07-01', '2027-09-30', 1560000, 12000, 130000, 15, 12500, 'Media coverage, growth spike'),
  ('optimistic',   'Q4 2027', '2027-10-01', '2027-12-31', 2400000, 18000, 200000, 14, 13000, 'Series A oversubscribed'),
  ('conservative', 'Q3 2026', '2026-07-01', '2026-09-30',   60000,   400,   5000, 14, 8000,  'Slow initial adoption'),
  ('conservative', 'Q4 2026', '2026-10-01', '2026-12-31',  120000,   900,  10000, 12, 9000,  'Extended beta'),
  ('conservative', 'Q1 2027', '2027-01-01', '2027-03-31',  200000,  1500,  16667, 10, 10000, 'Measured rollout'),
  ('conservative', 'Q2 2027', '2027-04-01', '2027-06-30',  300000,  2200,  25000,  9, 11000, 'Single city live'),
  ('conservative', 'Q3 2027', '2027-07-01', '2027-09-30',  420000,  3000,  35000,  8, 12000, 'Break-even target'),
  ('conservative', 'Q4 2027', '2027-10-01', '2027-12-31',  600000,  4200,  50000,  8, 12000, 'Pre-Series A bridge round')
ON CONFLICT DO NOTHING;
