-- SQL Commands to Fix Supabase RLS Policies
-- Run these commands in your Supabase SQL Editor

-- =====================================================
-- OPTION 1: DISABLE RLS (Quick Fix for Development)
-- =====================================================

-- Disable RLS on all tables
ALTER TABLE contests DISABLE ROW LEVEL SECURITY;
ALTER TABLE prizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE draws DISABLE ROW LEVEL SECURITY;
ALTER TABLE winners DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- OPTION 2: CREATE PERMISSIVE POLICIES (Recommended)
-- =====================================================

-- If you prefer to keep RLS enabled but allow all operations,
-- uncomment and run these commands instead:

/*
-- Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "contests_policy" ON contests;
DROP POLICY IF EXISTS "prizes_policy" ON prizes;
DROP POLICY IF EXISTS "participants_policy" ON participants;
DROP POLICY IF EXISTS "draws_policy" ON draws;
DROP POLICY IF EXISTS "winners_policy" ON winners;

-- Create permissive policies for contests table
CREATE POLICY "Allow all operations on contests" ON contests
FOR ALL USING (true) WITH CHECK (true);

-- Create permissive policies for prizes table
CREATE POLICY "Allow all operations on prizes" ON prizes
FOR ALL USING (true) WITH CHECK (true);

-- Create permissive policies for participants table
CREATE POLICY "Allow all operations on participants" ON participants
FOR ALL USING (true) WITH CHECK (true);

-- Create permissive policies for draws table
CREATE POLICY "Allow all operations on draws" ON draws
FOR ALL USING (true) WITH CHECK (true);

-- Create permissive policies for winners table
CREATE POLICY "Allow all operations on winners" ON winners
FOR ALL USING (true) WITH CHECK (true);

-- Create permissive policies for messages table
CREATE POLICY "Allow all operations on messages" ON messages
FOR ALL USING (true) WITH CHECK (true);

-- Create permissive policies for form_responses table
CREATE POLICY "Allow all operations on form_responses" ON form_responses
FOR ALL USING (true) WITH CHECK (true);

-- Create permissive policies for forms table
CREATE POLICY "Allow all operations on forms" ON forms
FOR ALL USING (true) WITH CHECK (true);

-- Create permissive policies for admins table
CREATE POLICY "Allow all operations on admins" ON admins
FOR ALL USING (true) WITH CHECK (true);

-- Create permissive policies for admin_activity_logs table
CREATE POLICY "Allow all operations on admin_activity_logs" ON admin_activity_logs
FOR ALL USING (true) WITH CHECK (true);
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if RLS is disabled (should return 'f' for false)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('contests', 'prizes', 'participants', 'draws', 'winners');

-- List all policies (should be empty if RLS is disabled)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('contests', 'prizes', 'participants', 'draws', 'winners');
