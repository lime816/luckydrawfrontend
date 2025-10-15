-- SQL Commands to Create RLS Policies that Allow Inserts
-- Run these commands in your Supabase SQL Editor
-- This keeps RLS enabled but creates permissive policies

-- =====================================================
-- CREATE PERMISSIVE RLS POLICIES (RECOMMENDED)
-- =====================================================

-- First, drop any existing restrictive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON contests;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON contests;
DROP POLICY IF EXISTS "Enable update for users based on email" ON contests;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON contests;

DROP POLICY IF EXISTS "Enable read access for all users" ON prizes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON prizes;
DROP POLICY IF EXISTS "Enable update for users based on email" ON prizes;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON prizes;

DROP POLICY IF EXISTS "Enable read access for all users" ON participants;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON participants;
DROP POLICY IF EXISTS "Enable update for users based on email" ON participants;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON participants;

-- =====================================================
-- CONTESTS TABLE POLICIES
-- =====================================================

-- Allow all operations on contests table
CREATE POLICY "Allow all operations on contests" ON contests
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Alternative: Separate policies for each operation
/*
CREATE POLICY "Allow read on contests" ON contests
FOR SELECT TO public USING (true);

CREATE POLICY "Allow insert on contests" ON contests
FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow update on contests" ON contests
FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete on contests" ON contests
FOR DELETE TO public USING (true);
*/

-- =====================================================
-- PRIZES TABLE POLICIES
-- =====================================================

-- Allow all operations on prizes table
CREATE POLICY "Allow all operations on prizes" ON prizes
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- =====================================================
-- PARTICIPANTS TABLE POLICIES
-- =====================================================

-- Allow all operations on participants table
CREATE POLICY "Allow all operations on participants" ON participants
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- =====================================================
-- DRAWS TABLE POLICIES
-- =====================================================

-- Allow all operations on draws table
CREATE POLICY "Allow all operations on draws" ON draws
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- =====================================================
-- WINNERS TABLE POLICIES
-- =====================================================

-- Allow all operations on winners table
CREATE POLICY "Allow all operations on winners" ON winners
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- =====================================================
-- OTHER TABLES POLICIES
-- =====================================================

-- Messages table
CREATE POLICY "Allow all operations on messages" ON messages
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Forms table
CREATE POLICY "Allow all operations on forms" ON forms
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Form responses table
CREATE POLICY "Allow all operations on form_responses" ON form_responses
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Admins table
CREATE POLICY "Allow all operations on admins" ON admins
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Admin activity logs table
CREATE POLICY "Allow all operations on admin_activity_logs" ON admin_activity_logs
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check that RLS is still enabled (should return 't' for true)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('contests', 'prizes', 'participants', 'draws', 'winners');

-- List all policies (should show the new permissive policies)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('contests', 'prizes', 'participants', 'draws', 'winners')
ORDER BY tablename, policyname;
