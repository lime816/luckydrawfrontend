-- Add custom_role column to admins table
-- Run this in Supabase SQL Editor

ALTER TABLE admins ADD COLUMN IF NOT EXISTS custom_role VARCHAR(100);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admins' AND column_name = 'custom_role';

-- After running this, wait 2-3 minutes for Supabase schema cache to refresh
-- Or run this to force refresh:
NOTIFY pgrst, 'reload schema';
