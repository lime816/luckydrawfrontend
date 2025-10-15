-- ========================================
-- RUN THIS IN SUPABASE SQL EDITOR NOW!
-- ========================================

-- Step 1: Add custom_role column (if it doesn't exist)
ALTER TABLE admins ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);

-- Step 2: Add permissions column (if it doesn't exist)  
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB;

-- Step 3: Update existing admins to have custom roles based on their system role
-- (This sets a default custom role for admins that don't have one)
UPDATE admins 
SET custom_role = CASE 
    WHEN role = 'MODERATOR' THEN 'Moderator'
    WHEN role = 'ADMIN' THEN 'Administrator'
    WHEN role = 'SUPERADMIN' THEN 'Super Administrator'
    ELSE 'Staff'
END
WHERE custom_role IS NULL OR custom_role = '';

-- Step 4: Force Supabase to reload the schema
NOTIFY pgrst, 'reload schema';

-- Step 5: Verify the changes
SELECT 
    admin_id,
    name,
    email,
    role as system_role,
    custom_role,
    created_at
FROM admins
ORDER BY created_at DESC;

-- ========================================
-- EXPECTED RESULT:
-- You should see all admins with custom_role filled in
-- ========================================

-- After running this:
-- 1. Wait 2-3 minutes
-- 2. Restart your React app (npm start)
-- 3. Refresh the User Management page
-- 4. You should see custom roles in the Role column
