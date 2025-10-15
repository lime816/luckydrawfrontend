-- ========================================
-- SIMPLE PERMISSIONS SETUP
-- Copy and paste this into Supabase SQL Editor
-- ========================================

-- Step 1: Add permissions column (stores page access settings)
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;

-- Step 2: Add custom_role column (stores role name like "Contest Manager")
ALTER TABLE admins ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);

-- Step 3: Give Super Admins full permissions (if they don't have any)
UPDATE admins 
SET permissions = jsonb_build_object(
    'dashboard', ARRAY['read', 'write', 'update'],
    'contests', ARRAY['read', 'write', 'update'],
    'participants', ARRAY['read', 'write', 'update'],
    'draw', ARRAY['read', 'write', 'update'],
    'winners', ARRAY['read', 'write', 'update'],
    'communication', ARRAY['read', 'write', 'update'],
    'analytics', ARRAY['read', 'write', 'update'],
    'settings', ARRAY['read', 'write', 'update'],
    'user_management', ARRAY['read', 'write', 'update']
)
WHERE role = 'SUPERADMIN' AND (permissions IS NULL OR permissions = '{}'::jsonb);

-- Step 4: Force Supabase to reload the schema
NOTIFY pgrst, 'reload schema';

-- Step 5: Verify the setup
SELECT 
    admin_id,
    name,
    email,
    role,
    custom_role,
    permissions
FROM admins
ORDER BY created_at DESC;

-- ========================================
-- DONE! 
-- Wait 2-3 minutes, then restart your app
-- ========================================
