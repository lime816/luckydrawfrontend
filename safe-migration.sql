-- Safe Migration: Add timing columns without breaking existing functionality
-- This migration adds new columns while keeping old ones temporarily

-- Step 1: Add new datetime columns (nullable initially)
ALTER TABLE contests 
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;

-- Step 2: Update existing records to have default timing
-- Set start_time to start_date + 10:00 AM, end_time to end_date + 6:00 PM
UPDATE contests 
SET 
  start_time = COALESCE(start_time, (start_date || ' 10:00:00')::TIMESTAMP WITH TIME ZONE),
  end_time = COALESCE(end_time, (end_date || ' 18:00:00')::TIMESTAMP WITH TIME ZONE)
WHERE start_time IS NULL OR end_time IS NULL;

-- Step 3: For any records that still don't have timing, set defaults
UPDATE contests 
SET 
  start_time = COALESCE(start_time, NOW()),
  end_time = COALESCE(end_time, NOW() + INTERVAL '7 days')
WHERE start_time IS NULL OR end_time IS NULL;

-- Step 4: Add comments to document the new columns
COMMENT ON COLUMN contests.start_time IS 'Lucky draw start time - when participants can start entering the draw';
COMMENT ON COLUMN contests.end_time IS 'Lucky draw end time - when the draw entry period closes';

-- Step 5: Create an index for efficient querying by time ranges
CREATE INDEX IF NOT EXISTS idx_contests_time_range ON contests(start_time, end_time);

-- Verification query - run this to check the results
-- SELECT contest_id, name, start_date, end_date, start_time, end_time FROM contests LIMIT 5;
