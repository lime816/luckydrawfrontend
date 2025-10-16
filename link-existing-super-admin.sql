-- Link existing Supabase Auth user (admin@ecam.com) to admins table as Super Admin
-- Run this in Supabase SQL Editor

-- Step 1: Add new columns if they don't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS supabase_user_id UUID UNIQUE;

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_is_super_admin ON admins(is_super_admin);
CREATE INDEX IF NOT EXISTS idx_admins_supabase_user_id ON admins(supabase_user_id);

-- Step 3: Insert or update Super Admin record
-- Replace the UUID with your actual Supabase user ID from the screenshot
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
  'a6fec55f-c94f-4d08-962f-bda89fe3847c', -- Your Supabase user ID
  'Super Admin',
  'admin@ecam.com',
  'supabase_auth', -- Placeholder (password managed by Supabase Auth)
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

-- Step 4: Verify the Super Admin was created
SELECT 
  admin_id,
  name,
  email,
  role,
  is_super_admin,
  supabase_user_id,
  created_at
FROM admins 
WHERE email = 'admin@ecam.com';

-- Expected result:
-- You should see one row with:
-- - role: SUPERADMIN
-- - is_super_admin: true
-- - supabase_user_id: a6fec55f-c94f-4d08-962f-bda89fe3847c
