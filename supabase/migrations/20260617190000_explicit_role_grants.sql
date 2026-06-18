-- Migration: 20260617190000_explicit_role_grants
-- Purpose: Permanent replacement for auto_expose_new_tables (deprecated in Supabase CLI >=2.106.0,
--          to be removed Oct 30 2026). Grants the same permissions that were previously applied
--          automatically by the CLI on every db reset / push.
--
-- When auto_expose_new_tables = true is removed from config.toml, this migration ensures the
-- local CI stack and production continue to work identically.
--
-- Covers: all tables currently in public schema as of migration 20260430130000.
-- Future tables: add explicit GRANTs in their own migration file. Do NOT rely on
-- auto_expose_new_tables going forward.

-- ----------------------------------------------------------------
-- USAGE on schema (required for role to resolve objects in schema)
-- ----------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- ----------------------------------------------------------------
-- Default privileges for FUTURE tables created by postgres role
-- This ensures new tables added after this migration also get
-- grants automatically (belt-and-suspenders alongside explicit grants).
-- ----------------------------------------------------------------
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

-- ----------------------------------------------------------------
-- Explicit grants on all existing public tables
-- (covers every table present as of the last migration)
-- ----------------------------------------------------------------
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  LOOP
    EXECUTE format(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO anon, authenticated, service_role',
      tbl
    );
  END LOOP;
END;
$$;

-- Sequences
DO $$
DECLARE
  seq text;
BEGIN
  FOR seq IN
    SELECT sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
    ORDER BY sequence_name
  LOOP
    EXECUTE format(
      'GRANT USAGE, SELECT ON SEQUENCE public.%I TO anon, authenticated, service_role',
      seq
    );
  END LOOP;
END;
$$;
