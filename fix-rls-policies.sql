-- Fix RLS Policies for Admin Login
-- The 406 error means RLS is blocking unauthenticated access to admins table

-- Step 1: Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'admins';

-- Step 2: Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'admins';

-- Step 3: TEMPORARY FIX - Disable RLS for testing
-- (Re-enable after confirming login works)
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Step 4: Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'admins';
-- Should show: rowsecurity = false

-- Step 5: Test login now
-- Try logging in with udith@gmail.com / password123
-- It should work!

-- ============================================
-- AFTER CONFIRMING LOGIN WORKS
-- ============================================

-- Step 6: Re-enable RLS with proper policies
-- (Run this AFTER you confirm all logins work)

/*
-- Re-enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read admins" ON admins;
DROP POLICY IF EXISTS "Super Admin full access" ON admins;
DROP POLICY IF EXISTS "Admins can view non-super admins" ON admins;
DROP POLICY IF EXISTS "Admins can update themselves" ON admins;

-- Create new policy: Allow public read access for login
-- This allows the login process to query admins table
CREATE POLICY "Allow public read for login" ON admins
  FOR SELECT
  USING (true);

-- Create policy: Only authenticated users can modify
CREATE POLICY "Allow authenticated users to modify" ON admins
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Verify new policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'admins';
*/

-- ============================================
-- INSTRUCTIONS
-- ============================================
-- 
-- 1. Run Step 1-4 above (disable RLS)
-- 2. Restart your dev server
-- 3. Hard refresh browser (Ctrl+Shift+R)
-- 4. Test all logins:
--    - admin@ecam.com (Super Admin)
--    - testadmin@example.com
--    - udith@gmail.com
--    - mrudhula@gmail.com
--    - hrithik@gmail.com
-- 
-- 5. If all work, you can re-enable RLS later with proper policies
--    (uncomment Step 6 section above)
-- 
-- For now, disabling RLS is fine for development
-- You can add proper policies later for production
