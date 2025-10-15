-- ========================================
-- RBAC (Role-Based Access Control) Setup
-- Run this in Supabase SQL Editor
-- ========================================

-- Step 1: Ensure custom_role and permissions columns exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;

-- Step 2: Create default permission structure for existing admins
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
    'user_management', ARRAY['read', 'write', 'update'],
    'admin_management', ARRAY['read', 'write', 'update']
)
WHERE role = 'SUPERADMIN' AND (permissions IS NULL OR permissions = '{}'::jsonb);

-- Step 3: Set default permissions for ADMIN role
UPDATE admins 
SET permissions = jsonb_build_object(
    'dashboard', ARRAY['read'],
    'contests', ARRAY['read', 'write', 'update'],
    'participants', ARRAY['read', 'write'],
    'draw', ARRAY['read', 'write'],
    'winners', ARRAY['read'],
    'communication', ARRAY['read', 'write'],
    'analytics', ARRAY['read'],
    'settings', ARRAY[]::text[],
    'user_management', ARRAY[]::text[],
    'admin_management', ARRAY[]::text[]
)
WHERE role = 'ADMIN' AND (permissions IS NULL OR permissions = '{}'::jsonb);

-- Step 4: Set default permissions for MODERATOR role
UPDATE admins 
SET permissions = jsonb_build_object(
    'dashboard', ARRAY['read'],
    'contests', ARRAY['read'],
    'participants', ARRAY['read', 'write'],
    'draw', ARRAY['read'],
    'winners', ARRAY['read'],
    'communication', ARRAY['read'],
    'analytics', ARRAY[]::text[],
    'settings', ARRAY[]::text[],
    'user_management', ARRAY[]::text[],
    'admin_management', ARRAY[]::text[]
)
WHERE role = 'MODERATOR' AND (permissions IS NULL OR permissions = '{}'::jsonb);

-- Step 5: Force Supabase to reload schema
NOTIFY pgrst, 'reload schema';

-- Step 6: Verify the setup
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
-- Permission Structure Explanation:
-- ========================================
-- Each page can have these permission levels:
-- - 'read': Can view the page
-- - 'write': Can create new items
-- - 'update': Can edit/delete items
-- - Empty array []: No access to the page
--
-- Available pages:
-- - dashboard: Main dashboard
-- - contests: Contest management
-- - participants: Participant management
-- - draw: Lucky draw execution
-- - winners: Winners management
-- - communication: Email/notifications
-- - analytics: Reports and analytics
-- - settings: System settings
-- - user_management: User management
-- - admin_management: Admin management
-- ========================================

-- Step 7: Create a function to check permissions (optional, for backend validation)
CREATE OR REPLACE FUNCTION has_permission(
    admin_id_param INTEGER,
    page_name TEXT,
    permission_level TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_permissions JSONB;
    page_permissions TEXT[];
BEGIN
    -- Get admin's permissions
    SELECT permissions INTO admin_permissions
    FROM admins
    WHERE admin_id = admin_id_param;
    
    -- Extract permissions for the specific page
    page_permissions := ARRAY(
        SELECT jsonb_array_elements_text(admin_permissions->page_name)
    );
    
    -- Check if the permission level exists
    RETURN permission_level = ANY(page_permissions);
END;
$$ LANGUAGE plpgsql;

-- Test the function
-- SELECT has_permission(1, 'dashboard', 'read');

-- ========================================
-- After running this:
-- 1. Wait 2-3 minutes for cache refresh
-- 2. Restart your React app
-- 3. Test the permission system
-- ========================================
