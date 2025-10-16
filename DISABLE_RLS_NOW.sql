-- QUICK FIX: Disable RLS to restore login functionality
-- Run this NOW to fix udith@gmail.com login

ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'admins';
-- Should show: rowsecurity = false

-- Now try login again with:
-- Email: udith@gmail.com
-- Password: password123
-- Should work! ✅

-- ============================================
-- EXPLANATION
-- ============================================
-- 
-- The RLS policies are blocking the login query.
-- For login to work, the app needs to query the admins table
-- BEFORE the user is authenticated (catch-22 problem).
--
-- Solutions:
-- 1. Keep RLS disabled for development (current approach)
-- 2. Create proper policies that allow anonymous SELECT
-- 3. Use a different authentication approach
--
-- For now, keeping RLS disabled is the simplest solution.
-- You can enable it later when you have proper policies tested.
