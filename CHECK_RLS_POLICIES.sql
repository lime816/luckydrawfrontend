-- Check if RLS is enabled on admins table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'admins';

-- Check existing RLS policies on admins table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'admins';

-- If RLS is blocking, temporarily disable it for testing (NOT for production!)
-- Uncomment the line below to disable RLS:
-- ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Or create a permissive policy for testing:
-- DROP POLICY IF EXISTS "Allow all access to admins" ON admins;
-- CREATE POLICY "Allow all access to admins" ON admins FOR ALL USING (true);

-- To enable RLS again later:
-- ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
