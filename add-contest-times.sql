-- Migration: Replace start_date/end_date with start_time/end_time
-- This migration removes old date fields and replaces them with datetime fields

-- Step 1: Add new datetime columns (initially nullable)
ALTER TABLE contests 
ADD COLUMN start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN end_time TIMESTAMP WITH TIME ZONE;

-- Step 2: Migrate existing data (if any) - combine date with default times
-- This assumes existing contests should start at 10:00 AM and end at 6:00 PM
UPDATE contests 
SET 
  start_time = (start_date || ' 10:00:00')::TIMESTAMP WITH TIME ZONE,
  end_time = (end_date || ' 18:00:00')::TIMESTAMP WITH TIME ZONE
WHERE start_date IS NOT NULL AND end_date IS NOT NULL;

-- Step 3: Make the new columns required (NOT NULL)
ALTER TABLE contests 
ALTER COLUMN start_time SET NOT NULL,
ALTER COLUMN end_time SET NOT NULL;

-- Step 4: Remove old date columns
ALTER TABLE contests 
DROP COLUMN IF EXISTS start_date,
DROP COLUMN IF EXISTS end_date;

-- Step 5: Add comments to document the new columns
COMMENT ON COLUMN contests.start_time IS 'Lucky draw start time - when participants can start entering the draw';
COMMENT ON COLUMN contests.end_time IS 'Lucky draw end time - when the draw entry period closes';

-- Step 6: Create an index for efficient querying by time ranges
CREATE INDEX idx_contests_time_range ON contests(start_time, end_time);

-- Step 7: Add a check constraint to ensure end_time is after start_time
ALTER TABLE contests 
ADD CONSTRAINT chk_contest_time_order CHECK (end_time > start_time);
