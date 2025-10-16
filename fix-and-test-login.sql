-- ALL-IN-ONE FIX: Setup both Super Admin and Test Regular Admin
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- PART 1: Add Required Columns
-- ============================================
ALTER TABLE admins ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS supabase_user_id UUID UNIQUE;

CREATE INDEX IF NOT EXISTS idx_admins_is_super_admin ON admins(is_super_admin);
CREATE INDEX IF NOT EXISTS idx_admins_supabase_user_id ON admins(supabase_user_id);

-- ============================================
-- PART 2: Setup Super Admin (admin@ecam.com)
-- ============================================
INSERT INTO admins (
  supabase_user_id,
  name,
  email,
  password_hash,
  role,
  is_super_admin,
  permissions,
  two_factor,
  created_at,
  last_login
) VALUES (
  'a6fec55f-c94f-4d08-962f-bda89fe3847c',
  'Super Admin',
  'admin@ecam.com',
  'supabase_auth',
  'SUPERADMIN',
  true,
  '{
    "dashboard": ["read", "write", "update"],
    "contests": ["read", "write", "update"],
    "participants": ["read", "write", "update"],
    "draw": ["read", "write", "update"],
    "winners": ["read", "write", "update"],
    "communication": ["read", "write", "update"],
    "analytics": ["read", "write", "update"],
    "settings": ["read", "write", "update"],
    "user_management": ["read", "write", "update"],
    "admin_management": ["read", "write", "update"]
  }'::jsonb,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
  supabase_user_id = EXCLUDED.supabase_user_id,
  is_super_admin = EXCLUDED.is_super_admin,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  last_login = NOW();

-- ============================================
-- PART 3: Create Test Regular Admin
-- ============================================
INSERT INTO admins (
  name,
  email,
  password_hash,
  role,
  is_super_admin,
  permissions,
  two_factor,
  created_at
) VALUES (
  'Test Admin',
  'testadmin@example.com',
  'password123',
  'ADMIN',
  false,
  '{
    "dashboard": ["read", "write"],
    "contests": ["read", "write", "update"],
    "participants": ["read", "write"],
    "draw": ["read", "write"],
    "winners": ["read"],
    "communication": ["read", "write"],
    "analytics": ["read"],
    "settings": ["read"],
    "user_management": ["read"],
    "admin_management": []
  }'::jsonb,
  false,
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
  password_hash = 'password123',
  role = 'ADMIN',
  is_super_admin = false,
  permissions = EXCLUDED.permissions;

-- ============================================
-- PART 4: Verification
-- ============================================

-- Show all admins
SELECT 
  admin_id,
  name,
  email,
  password_hash,
  role,
  is_super_admin,
  CASE 
    WHEN supabase_user_id IS NOT NULL THEN 'Supabase Auth'
    ELSE 'Database Auth'
  END as auth_method,
  created_at
FROM admins
ORDER BY is_super_admin DESC, admin_id;

-- Expected Results:
-- Row 1: Super Admin (admin@ecam.com) - SUPERADMIN - is_super_admin=true - Supabase Auth
-- Row 2: Test Admin (testadmin@example.com) - ADMIN - is_super_admin=false - Database Auth

-- ============================================
-- PART 5: Login Test Instructions
-- ============================================

-- After running this script, test these logins:
--
-- LOGIN 1 - Super Admin:
--   Email: admin@ecam.com
--   Password: [Your Supabase Auth password]
--   Expected: ✅ Success
--
-- LOGIN 2 - Regular Admin:
--   Email: testadmin@example.com
--   Password: password123
--   Expected: ✅ Success
--
-- If LOGIN 2 fails, check browser console logs (F12)
-- You should see detailed authentication logs starting with 🔐

-- ============================================
-- TROUBLESHOOTING QUERIES
-- ============================================

-- If regular admin login fails, run these:

-- 1. Check if testadmin exists and password is correct
-- SELECT email, password_hash, role FROM admins WHERE email = 'testadmin@example.com';
-- Expected: password_hash should be exactly 'password123'

-- 2. Force update password if needed
-- UPDATE admins SET password_hash = 'password123' WHERE email = 'testadmin@example.com';

-- 3. Check all columns exist
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'admins';
