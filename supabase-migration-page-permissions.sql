-- Migration: Convert to page-based permissions system
-- Run this in your Supabase SQL Editor

-- Drop old permission columns if they exist
ALTER TABLE admins DROP COLUMN IF EXISTS permission_read;
ALTER TABLE admins DROP COLUMN IF EXISTS permission_write;
ALTER TABLE admins DROP COLUMN IF EXISTS permission_update;

-- Add new JSONB permissions column
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT NULL;

-- Update existing SUPERADMIN users to have full permissions on all pages
UPDATE admins 
SET permissions = '{
  "dashboard": "full",
  "contests": "full",
  "participants": "full",
  "draw": "full",
  "winners": "full",
  "communication": "full",
  "analytics": "full",
  "settings": "full"
}'::jsonb
WHERE role = 'SUPERADMIN';

-- Update existing ADMIN users with read and write permissions
UPDATE admins 
SET permissions = '{
  "dashboard": "read",
  "contests": "write",
  "participants": "write",
  "draw": "write",
  "winners": "read",
  "communication": "write",
  "analytics": "read",
  "settings": "none"
}'::jsonb
WHERE role = 'ADMIN' AND permissions IS NULL;

-- Update existing MODERATOR users with read-only permissions
UPDATE admins 
SET permissions = '{
  "dashboard": "read",
  "contests": "read",
  "participants": "read",
  "draw": "none",
  "winners": "read",
  "communication": "none",
  "analytics": "read",
  "settings": "none"
}'::jsonb
WHERE role = 'MODERATOR' AND permissions IS NULL;

-- Add comment to column
COMMENT ON COLUMN admins.permissions IS 'Page-based permissions stored as JSONB. Format: {"page_name": "none|read|write|full"}';

-- Create index for faster permission queries
CREATE INDEX IF NOT EXISTS idx_admins_permissions ON admins USING GIN (permissions);
