-- Diagnose why admins created by Super Admin aren't working
-- Run this in Supabase SQL Editor

-- 1. Show ALL admins with their details
SELECT 
  admin_id,
  name,
  email,
  password_hash,
  LENGTH(password_hash) as password_length,
  role,
  is_super_admin,
  supabase_user_id,
  created_at
FROM admins
ORDER BY created_at DESC;

-- 2. Check for common issues
SELECT 
  email,
  CASE 
    WHEN password_hash IS NULL THEN '❌ NULL password'
    WHEN password_hash = '' THEN '❌ Empty password'
    WHEN LENGTH(password_hash) < 3 THEN '⚠️ Very short password'
    WHEN password_hash LIKE '% %' THEN '⚠️ Password has spaces'
    WHEN password_hash != TRIM(password_hash) THEN '⚠️ Password has leading/trailing spaces'
    ELSE '✅ Password looks OK'
  END as password_status,
  password_hash,
  role,
  is_super_admin
FROM admins
ORDER BY created_at DESC;

-- 3. Check for duplicate emails
SELECT 
  email,
  COUNT(*) as count
FROM admins
GROUP BY email
HAVING COUNT(*) > 1;

-- 4. Show admins that should work for login (non-super admins with passwords)
SELECT 
  admin_id,
  email,
  password_hash,
  role,
  'Login with this email and password_hash as password' as instruction
FROM admins
WHERE is_super_admin = false OR is_super_admin IS NULL
ORDER BY created_at DESC;

-- Instructions:
-- After running this, check the results:
-- 
-- For each admin created by Super Admin:
-- - Note the email
-- - Note the password_hash value
-- - Try to login with:
--   Email: [the email from database]
--   Password: [the password_hash value from database]
--
-- If password_hash is something like "admin123", use "admin123" as the password
-- The password should be exactly what's stored in password_hash column
