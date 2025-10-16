-- Create a test regular admin for testing login
-- Run this in Supabase SQL Editor after running the Super Admin setup

-- First, make sure the columns exist (run this if you haven't already)
ALTER TABLE admins ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS supabase_user_id UUID UNIQUE;

-- Create a test regular admin
-- Password is stored as plain text: "password123"
-- (Your app compares passwords directly without hashing)
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
  'password123', -- Plain text password (matches your AuthService logic)
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
ON CONFLICT (email) DO NOTHING;

-- Verify both admins exist
SELECT 
  admin_id,
  name,
  email,
  role,
  is_super_admin,
  CASE 
    WHEN supabase_user_id IS NOT NULL THEN 'Supabase Auth'
    ELSE 'Database Auth'
  END as auth_type,
  created_at
FROM admins
ORDER BY is_super_admin DESC, created_at DESC;

-- Expected result:
-- Row 1: Super Admin (admin@ecam.com) - Supabase Auth
-- Row 2: Test Admin (testadmin@example.com) - Database Auth
