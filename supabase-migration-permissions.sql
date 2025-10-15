-- Migration: Add custom role and permissions to admins table
-- Run this in your Supabase SQL Editor if you already have the admins table

-- Add custom_role column
ALTER TABLE admins ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);

-- Add permission columns
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permission_read BOOLEAN DEFAULT TRUE;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permission_write BOOLEAN DEFAULT FALSE;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permission_update BOOLEAN DEFAULT FALSE;

-- Update existing SUPERADMIN users to have all permissions
UPDATE admins 
SET permission_read = TRUE, 
    permission_write = TRUE, 
    permission_update = TRUE 
WHERE role = 'SUPERADMIN';

-- Update existing ADMIN users to have read and update permissions
UPDATE admins 
SET permission_read = TRUE, 
    permission_write = FALSE, 
    permission_update = TRUE 
WHERE role = 'ADMIN';

-- Update existing MODERATOR users to have read permission only
UPDATE admins 
SET permission_read = TRUE, 
    permission_write = FALSE, 
    permission_update = FALSE 
WHERE role = 'MODERATOR';

-- Add comment to table
COMMENT ON COLUMN admins.custom_role IS 'Custom role name defined by Super Admin (e.g., Event Manager, Data Analyst)';
COMMENT ON COLUMN admins.permission_read IS 'Admin can view data but cannot input or edit fields';
COMMENT ON COLUMN admins.permission_write IS 'Admin can input new data but cannot modify existing entries';
COMMENT ON COLUMN admins.permission_update IS 'Admin can edit or update existing data but cannot add new entries';
