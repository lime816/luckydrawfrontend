-- Migration: add trigger to prevent allocating more winners than total prize quantity
-- Date: 2025-10-27

-- This creates a function that checks, on insert into winners, that the total
-- number of winners for the contest (including the new row) does not exceed
-- the sum of prize quantities for that contest. If it would, the function
-- raises an exception and the insert is rejected. This provides an atomic,
-- database-level safeguard against race conditions.

BEGIN;

-- Create or replace function
CREATE OR REPLACE FUNCTION public.check_winner_allocation()
RETURNS trigger AS $$
DECLARE
  contest_id_val INT;
  total_prize_slots INT;
  existing_winners INT;
BEGIN
  -- Find the contest_id for the draw this winner is being added to
  SELECT contest_id INTO contest_id_val FROM public.draws WHERE draw_id = NEW.draw_id;
  IF contest_id_val IS NULL THEN
    RAISE EXCEPTION 'Invalid draw_id % when inserting winner', NEW.draw_id;
  END IF;

  -- Sum all prize quantities for the contest
  SELECT COALESCE(SUM(quantity),0) INTO total_prize_slots FROM public.prizes WHERE contest_id = contest_id_val;

  -- Count existing winners for the contest (including the candidate NEW row)
  SELECT COUNT(w.*) INTO existing_winners
  FROM public.winners w
  JOIN public.draws d ON w.draw_id = d.draw_id
  WHERE d.contest_id = contest_id_val;

  existing_winners := existing_winners + 1; -- account for NEW row

  IF existing_winners > total_prize_slots THEN
    RAISE EXCEPTION 'Prize allocation exceeded for contest %: requested % but only % slots', contest_id_val, existing_winners, total_prize_slots;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (if not exists) that calls the function before insert on winners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE t.tgname = 'winners_check_allocation_trigger' AND c.relname = 'winners'
  ) THEN
    CREATE TRIGGER winners_check_allocation_trigger
    BEFORE INSERT ON public.winners
    FOR EACH ROW EXECUTE FUNCTION public.check_winner_allocation();
  END IF;
END$$;

COMMIT;

-- End migration
