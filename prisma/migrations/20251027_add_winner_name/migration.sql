-- Migration: add winner_name column to winners table
-- Date: 2025-10-27

-- Add nullable text column `winner_name` to store the participant's name redundantly for reporting.
ALTER TABLE IF EXISTS public.winners
ADD COLUMN IF NOT EXISTS winner_name text;

-- No destructive changes.

-- You can run this migration with `psql` or let Prisma/Migration tools run it.
