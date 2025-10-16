-- Fix RLS Login Issue - Allow Anonymous SELECT for Authentication
-- Run this to fix login after enabling RLS

-- Step 1: Check current policies
SELECT 
  policyname,
  cmd as command,
  roles,
  qual as using_clause
FROM pg_policies 
WHERE tablename = 'admins'
ORDER BY policyname;

-- Step 2: Drop the problematic anonymous policy
DROP POLICY IF EXISTS "Allow anonymous read for authentication" ON admins;

-- Step 3: Create correct policy for anonymous SELECT
-- This allows unauthenticated users to query admins table for login
CREATE POLICY "Enable read access for authentication" ON admins
  FOR SELECT
  USING (true);

-- This policy applies to ALL roles (including anon and authenticated)
-- It's needed for the login process to work

-- Step 4: Verify the policy was created
SELECT 
  policyname,
  cmd,
  roles,
  permissive
FROM pg_policies 
WHERE tablename = 'admins'
AND policyname = 'Enable read access for authentication';

-- Step 5: Test anonymous access (simulates login query)
SET ROLE anon;
SELECT email, role FROM admins WHERE email = 'udith@gmail.com';
RESET ROLE;
-- Should return the admin record (not an error)

-- ============================================
-- ALTERNATIVE: If still not working
-- ============================================

-- Option 1: Create explicit anon policy
/*
DROP POLICY IF EXISTS "Enable read access for authentication" ON admins;

CREATE POLICY "Allow anon to read for login" ON admins
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);
*/

-- Option 2: Temporarily disable RLS again
/*
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
*/

-- ============================================
-- VERIFY EVERYTHING
-- ============================================

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'admins';

-- Check all policies
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'admins';

-- Test query as anon (should work)
SET ROLE anon;
SELECT COUNT(*) FROM admins;
RESET ROLE;
