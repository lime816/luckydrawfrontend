-- Add Super Admin fields to admins table
ALTER TABLE admins ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS supabase_user_id UUID UNIQUE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_is_super_admin ON admins(is_super_admin);
CREATE INDEX IF NOT EXISTS idx_admins_supabase_user_id ON admins(supabase_user_id);

-- Update existing SUPERADMIN role users to have is_super_admin flag
UPDATE admins SET is_super_admin = true WHERE role = 'SUPERADMIN';
