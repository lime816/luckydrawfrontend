-- Debug Regular Admin Login Issue
-- Run these queries one by one in Supabase SQL Editor

-- 1. Check if the test admin exists
SELECT 
  admin_id,
  name,
  email,
  password_hash,
  role,
  is_super_admin,
  supabase_user_id,
  created_at
FROM admins 
WHERE email = 'testadmin@example.com';

-- Expected: Should return 1 row
-- If no rows: The admin wasn't created, run create-test-admin.sql again
-- If password_hash is not 'password123': Update it with query below

-- 2. Check all admins to see what we have
SELECT 
  admin_id,
  name,
  email,
  LEFT(password_hash, 20) as password_preview,
  role,
  is_super_admin,
  CASE 
    WHEN supabase_user_id IS NOT NULL THEN 'Supabase'
    ELSE 'Database'
  END as auth_type
FROM admins
ORDER BY is_super_admin DESC, created_at DESC;

-- 3. If password is wrong, fix it
UPDATE admins 
SET password_hash = 'password123'
WHERE email = 'testadmin@example.com';

-- 4. Verify the fix
SELECT email, password_hash, role FROM admins WHERE email = 'testadmin@example.com';

-- 5. Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admins'
ORDER BY ordinal_position;
