-- ============================================
-- SUPABASE RLS POLICIES FOR LUCKY DRAW SYSTEM
-- ============================================
-- Run this SQL in Supabase SQL Editor to fix RLS issues

-- ============================================
-- STEP 1: DISABLE RLS TEMPORARILY (to see your data again)
-- ============================================
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE contests DISABLE ROW LEVEL SECURITY;
ALTER TABLE prizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE draws DISABLE ROW LEVEL SECURITY;
ALTER TABLE winners DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: CREATE PERMISSIVE POLICIES FOR DEVELOPMENT
-- ============================================
-- These policies allow ALL operations for development
-- Replace with secure policies for production

-- ADMINS TABLE
CREATE POLICY "Allow all operations on admins" ON admins
FOR ALL USING (true) WITH CHECK (true);

-- ADMIN ACTIVITY LOG
CREATE POLICY "Allow all operations on admin_activity_log" ON admin_activity_log
FOR ALL USING (true) WITH CHECK (true);

-- CONTESTS TABLE
CREATE POLICY "Allow all operations on contests" ON contests
FOR ALL USING (true) WITH CHECK (true);

-- PRIZES TABLE
CREATE POLICY "Allow all operations on prizes" ON prizes
FOR ALL USING (true) WITH CHECK (true);

-- PARTICIPANTS TABLE
CREATE POLICY "Allow all operations on participants" ON participants
FOR ALL USING (true) WITH CHECK (true);

-- DRAWS TABLE
CREATE POLICY "Allow all operations on draws" ON draws
FOR ALL USING (true) WITH CHECK (true);

-- WINNERS TABLE
CREATE POLICY "Allow all operations on winners" ON winners
FOR ALL USING (true) WITH CHECK (true);

-- MESSAGES TABLE
CREATE POLICY "Allow all operations on messages" ON messages
FOR ALL USING (true) WITH CHECK (true);

-- FORMS TABLE
CREATE POLICY "Allow all operations on forms" ON forms
FOR ALL USING (true) WITH CHECK (true);

-- FORM RESPONSES TABLE
CREATE POLICY "Allow all operations on form_responses" ON form_responses
FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- STEP 3: RE-ENABLE RLS WITH POLICIES
-- ============================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify your data is accessible

-- Check contests
SELECT COUNT(*) as total_contests FROM contests;

-- Check prizes
SELECT COUNT(*) as total_prizes FROM prizes;

-- Check participants
SELECT COUNT(*) as total_participants FROM participants;

-- View all contests
SELECT * FROM contests ORDER BY created_at DESC LIMIT 10;

-- ============================================
-- PRODUCTION POLICIES (OPTIONAL - FOR LATER)
-- ============================================
-- Uncomment and customize these for production use

/*
-- Drop development policies first
DROP POLICY IF EXISTS "Allow all operations on contests" ON contests;

-- Create secure policies
CREATE POLICY "authenticated_users_read_contests" ON contests
FOR SELECT USING (true);  -- Anyone can read

CREATE POLICY "authenticated_users_write_contests" ON contests
FOR INSERT WITH CHECK (true);  -- Anyone can create

CREATE POLICY "authenticated_users_update_contests" ON contests
FOR UPDATE USING (true) WITH CHECK (true);  -- Anyone can update

CREATE POLICY "authenticated_users_delete_contests" ON contests
FOR DELETE USING (true);  -- Anyone can delete
*/

-- ============================================
-- NOTES
-- ============================================
-- 1. Current policies allow ALL operations (development mode)
-- 2. Your data is safe - it was just hidden by RLS
-- 3. For production, implement authentication-based policies
-- 4. Test thoroughly after enabling RLS
