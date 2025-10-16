-- IMMEDIATE FIX for testadmin@example.com login
-- Copy and run this in Supabase SQL Editor RIGHT NOW

-- Step 1: Add columns if missing
ALTER TABLE admins ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS supabase_user_id UUID UNIQUE;

-- Step 2: Delete any existing testadmin to start fresh
DELETE FROM admins WHERE email = 'testadmin@example.com';

-- Step 3: Create testadmin with correct data
INSERT INTO admins (
  name,
  email,
  password_hash,
  role,
  is_super_admin,
  two_factor,
  created_at
) VALUES (
  'Test Admin',
  'testadmin@example.com',
  'password123',
  'ADMIN',
  false,
  false,
  NOW()
);

-- Step 4: Verify it was created
SELECT 
  admin_id,
  name,
  email,
  password_hash,
  role,
  is_super_admin
FROM admins 
WHERE email = 'testadmin@example.com';

-- You should see:
-- admin_id | name       | email                  | password_hash | role  | is_super_admin
-- ---------|------------|------------------------|---------------|-------|---------------
-- [number] | Test Admin | testadmin@example.com  | password123   | ADMIN | false

-- Step 5: Check all admins
SELECT admin_id, email, role, is_super_admin FROM admins ORDER BY admin_id;
