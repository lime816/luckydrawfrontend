-- ONE-CLICK FIX: Reset all UI-created admin passwords
-- This will make all regular admins use password: password123
-- Run this in Supabase SQL Editor

-- Step 1: Show current state BEFORE fix
SELECT 
  '=== BEFORE FIX ===' as status,
  admin_id,
  email,
  password_hash,
  role,
  is_super_admin,
  CASE 
    WHEN is_super_admin = true THEN 'Supabase Auth - No change needed'
    WHEN supabase_user_id IS NOT NULL THEN 'Supabase Auth - No change needed'
    ELSE 'Database Auth - Will be updated'
  END as action
FROM admins
ORDER BY is_super_admin DESC NULLS LAST, admin_id;

-- Step 2: Trim any spaces from existing passwords
UPDATE admins 
SET password_hash = TRIM(password_hash)
WHERE password_hash IS NOT NULL
  AND password_hash != TRIM(password_hash);

-- Step 3: Reset all regular admin passwords to 'password123'
-- (Excludes Super Admin and Supabase Auth users)
UPDATE admins 
SET password_hash = 'password123'
WHERE 
  (is_super_admin = false OR is_super_admin IS NULL)
  AND (supabase_user_id IS NULL)
  AND password_hash != 'supabase_auth'; -- Don't update Super Admin placeholder

-- Step 4: Show current state AFTER fix
SELECT 
  '=== AFTER FIX ===' as status,
  admin_id,
  email,
  password_hash,
  role,
  is_super_admin,
  CASE 
    WHEN is_super_admin = true THEN 'Use Supabase Auth password'
    WHEN supabase_user_id IS NOT NULL THEN 'Use Supabase Auth password'
    WHEN password_hash = 'password123' THEN '✅ Login with: password123'
    ELSE '⚠️ Custom password: ' || password_hash
  END as login_instruction
FROM admins
ORDER BY is_super_admin DESC NULLS LAST, admin_id;

-- ============================================
-- RESULTS EXPLANATION
-- ============================================
-- 
-- After running this script:
-- 
-- 1. Super Admin (admin@ecam.com):
--    - Email: admin@ecam.com
--    - Password: Your Supabase Auth password
--    - Status: No change
--
-- 2. All other admins:
--    - Password: password123
--    - Status: Updated
--
-- ============================================
-- TEST YOUR LOGINS
-- ============================================
--
-- For each admin shown in the AFTER FIX results:
-- 1. Note the email
-- 2. Use password: password123
-- 3. Try to login
-- 4. Check console logs (F12)
--
-- Example:
-- - Email: john@example.com
-- - Password: password123
-- - Should work! ✅
--
-- ============================================
-- IF STILL NOT WORKING
-- ============================================
--
-- Check specific admin:
-- SELECT email, password_hash FROM admins WHERE email = 'problematic@example.com';
--
-- The password_hash value is what you need to type as password
-- If it shows 'password123', type exactly: password123
--
