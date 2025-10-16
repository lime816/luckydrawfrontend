-- Re-enable RLS with Proper Policies for Production
-- Run this when you're ready to add security back

-- ============================================
-- STEP 1: Re-enable RLS
-- ============================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Drop all existing policies (clean slate)
-- ============================================
DROP POLICY IF EXISTS "Allow authenticated users to read admins" ON admins;
DROP POLICY IF EXISTS "Super Admin full access" ON admins;
DROP POLICY IF EXISTS "Admins can view non-super admins" ON admins;
DROP POLICY IF EXISTS "Admins can update themselves" ON admins;
DROP POLICY IF EXISTS "Allow public read for login" ON admins;
DROP POLICY IF EXISTS "Allow authenticated users to modify" ON admins;

-- ============================================
-- STEP 3: Create Production-Ready Policies
-- ============================================

-- Policy 1: Allow anonymous SELECT for login authentication
-- This allows the login process to query admins table
-- CRITICAL: Without this, login will fail!
CREATE POLICY "Allow anonymous read for authentication" ON admins
  FOR SELECT
  TO anon
  USING (true);

-- Policy 2: Allow authenticated users to read all admins
-- Once logged in, users can see admin records
CREATE POLICY "Allow authenticated users to read admins" ON admins
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Super Admin has full access to everything
-- Super Admin can create, read, update, delete any admin
CREATE POLICY "Super Admin full access" ON admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.supabase_user_id = auth.uid()
      AND admins.is_super_admin = true
    )
  );

-- Policy 4: Regular admins can update their own record only
-- Admins can update their own profile, password, etc.
CREATE POLICY "Admins can update themselves" ON admins
  FOR UPDATE
  TO authenticated
  USING (
    email = (SELECT email FROM admins WHERE supabase_user_id = auth.uid())
  );

-- ============================================
-- STEP 4: Verify Policies
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression
FROM pg_policies 
WHERE tablename = 'admins'
ORDER BY policyname;

-- Expected policies:
-- 1. Allow anonymous read for authentication (SELECT, anon)
-- 2. Allow authenticated users to read admins (SELECT, authenticated)
-- 3. Super Admin full access (ALL, authenticated)
-- 4. Admins can update themselves (UPDATE, authenticated)

-- ============================================
-- STEP 5: Test After Enabling
-- ============================================

-- Test 1: Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'admins';
-- Should show: rowsecurity = true

-- Test 2: Try to query as anonymous (simulates login)
-- This should work (returns admins)
SET ROLE anon;
SELECT email, role FROM admins LIMIT 1;
RESET ROLE;

-- Test 3: Verify Super Admin can see all
-- (You'll need to test this by logging in as Super Admin)

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If login fails after enabling RLS:

-- Check 1: Verify anonymous policy exists
SELECT policyname, roles FROM pg_policies 
WHERE tablename = 'admins' 
AND 'anon' = ANY(roles);
-- Should return: "Allow anonymous read for authentication"

-- Check 2: Test anonymous access
SET ROLE anon;
SELECT COUNT(*) FROM admins;
RESET ROLE;
-- Should return a count (not an error)

-- Check 3: If still failing, temporarily disable RLS again
-- ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ADDITIONAL SECURITY (OPTIONAL)
-- ============================================

-- Hide Super Admin from regular admins (optional)
-- Uncomment if you want regular admins to NOT see Super Admin

/*
DROP POLICY IF EXISTS "Allow authenticated users to read admins" ON admins;

CREATE POLICY "Authenticated users see non-super admins" ON admins
  FOR SELECT
  TO authenticated
  USING (
    -- Super Admin can see everyone
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.supabase_user_id = auth.uid()
      AND admins.is_super_admin = true
    )
    OR
    -- Regular admins can only see non-super admins
    (is_super_admin = false OR is_super_admin IS NULL)
  );
*/

-- ============================================
-- NOTES
-- ============================================

-- 1. The "anon" role is for unauthenticated users (login process)
-- 2. The "authenticated" role is for logged-in users
-- 3. Super Admin identification uses supabase_user_id
-- 4. Regular admins use email for identification
-- 5. All policies are permissive (USING clause allows access)

-- ============================================
-- WHEN TO RUN THIS
-- ============================================

-- Run this script when:
-- ✅ All logins are working perfectly
-- ✅ You've tested all admin accounts
-- ✅ You're ready to deploy to production
-- ✅ You want to add security back

-- DO NOT run this if:
-- ❌ Logins are still failing
-- ❌ You're still testing/debugging
-- ❌ You haven't verified all admins work

-- ============================================
-- ROLLBACK (if something goes wrong)
-- ============================================

-- If enabling RLS breaks login, run this:
/*
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
*/

-- Then debug the issue and try again
