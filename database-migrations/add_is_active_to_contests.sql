-- Add is_active column to contests table
-- This allows admins to enable/disable contests

ALTER TABLE contests 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing contests to be active by default
UPDATE contests 
SET is_active = true 
WHERE is_active IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN contests.is_active IS 'Whether the contest is active/enabled. Admins can toggle this to enable or disable contests.';
