-- Migration: add trigger to populate created_by_role on contests
-- Created: 2025-10-27

-- Ensure the created_by_role column exists (uses existing enum role_type)
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.contests ADD COLUMN created_by_role role_type;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
END$$;

-- Create or replace the function that sets created_by_role from admins.role
CREATE OR REPLACE FUNCTION public.set_contest_created_by_role()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    SELECT a.role INTO NEW.created_by_role
    FROM public.admins a
    WHERE a.admin_id = NEW.created_by
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE t.tgname = 'set_contest_created_by_role_trigger' AND c.relname = 'contests'
  ) THEN
    CREATE TRIGGER set_contest_created_by_role_trigger
    BEFORE INSERT ON public.contests
    FOR EACH ROW
    EXECUTE FUNCTION public.set_contest_created_by_role();
  END IF;
END$$;

-- Backfill existing rows where created_by is present but created_by_role is NULL
DO $$
BEGIN
  UPDATE public.contests c
  SET created_by_role = a.role
  FROM public.admins a
  WHERE c.created_by = a.admin_id AND c.created_by_role IS NULL;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Backfill failed: %', SQLERRM;
END$$;

COMMENT ON FUNCTION public.set_contest_created_by_role() IS 'Sets created_by_role on insert using admins.role';
COMMENT ON TRIGGER set_contest_created_by_role_trigger ON public.contests IS 'Trigger to populate created_by_role from admins';
