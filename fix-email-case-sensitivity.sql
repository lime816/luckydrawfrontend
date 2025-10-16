-- Fix email case sensitivity issues
-- Some emails might have uppercase letters or extra spaces

-- Step 1: Check for email issues
SELECT 
  admin_id,
  email,
  LENGTH(email) as email_length,
  CASE 
    WHEN email != LOWER(email) THEN '⚠️ Has uppercase letters'
    WHEN email != TRIM(email) THEN '⚠️ Has spaces'
    WHEN email LIKE '%@GMAIL.%' THEN '⚠️ Domain has uppercase'
    ELSE '✅ OK'
  END as issue,
  password_hash,
  role
FROM admins
ORDER BY admin_id;

-- Step 2: Normalize all emails to lowercase and trim spaces
UPDATE admins 
SET email = LOWER(TRIM(email));

-- Step 3: Verify the fix
SELECT 
  admin_id,
  email,
  password_hash,
  role,
  'Login with this exact email (all lowercase)' as instruction
FROM admins
ORDER BY admin_id;

-- Step 4: Show login credentials for all admins
SELECT 
  '=== LOGIN CREDENTIALS ===' as info,
  email as login_email,
  CASE 
    WHEN password_hash = 'supabase_auth' THEN 'Use Supabase Auth password'
    ELSE password_hash
  END as login_password,
  role
FROM admins
ORDER BY admin_id;
