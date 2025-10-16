-- Super Admin Setup for Lucky Draw Application
-- This script adds support for Super Admin authentication via Supabase Auth
-- with automatic syncing to the admins table while keeping Super Admin hidden from other admins

-- Step 1: Add is_super_admin flag to admins table
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Step 2: Add supabase_user_id to link Supabase Auth users to admin table
ALTER TABLE admins ADD COLUMN IF NOT EXISTS supabase_user_id UUID UNIQUE;

-- Step 3: Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_admins_is_super_admin ON admins(is_super_admin);
CREATE INDEX IF NOT EXISTS idx_admins_supabase_user_id ON admins(supabase_user_id);

-- Step 4: Create function to sync Supabase Auth user to admins table
CREATE OR REPLACE FUNCTION sync_super_admin_to_admins()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if user has super_admin metadata
  IF (NEW.raw_user_meta_data->>'is_super_admin')::boolean = true THEN
    -- Insert or update admin record
    INSERT INTO admins (
      supabase_user_id,
      name,
      email,
      password_hash,
      role,
      is_super_admin,
      created_at
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Super Admin'),
      NEW.email,
      'supabase_auth', -- Placeholder since password is managed by Supabase Auth
      'SUPERADMIN',
      true,
      NEW.created_at
    )
    ON CONFLICT (supabase_user_id) 
    DO UPDATE SET
      name = COALESCE(EXCLUDED.name, admins.name),
      email = EXCLUDED.email,
      last_login = CURRENT_TIMESTAMP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger to auto-sync on user creation/update
DROP TRIGGER IF EXISTS on_auth_user_created_sync_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_sync_admin
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_super_admin_to_admins();

-- Step 6: Update RLS policies for admins table
-- Drop existing policies if any
DROP POLICY IF EXISTS "Super Admin full access" ON admins;
DROP POLICY IF EXISTS "Admins can view non-super admins" ON admins;
DROP POLICY IF EXISTS "Admins can update themselves" ON admins;

-- Policy 1: Super Admin has full access to all admins
CREATE POLICY "Super Admin full access" ON admins
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE supabase_user_id = auth.uid() 
      AND is_super_admin = true
    )
  );

-- Policy 2: Regular admins can only see non-super admins (hide Super Admin from lists)
CREATE POLICY "Admins can view non-super admins" ON admins
  FOR SELECT
  USING (
    is_super_admin = false
    AND EXISTS (
      SELECT 1 FROM admins 
      WHERE admin_id = (auth.jwt()->>'admin_id')::int
      AND is_super_admin = false
    )
  );

-- Policy 3: Regular admins can update themselves only
CREATE POLICY "Admins can update themselves" ON admins
  FOR UPDATE
  USING (
    admin_id = (auth.jwt()->>'admin_id')::int
    AND is_super_admin = false
  );

-- Step 7: Create helper function to check if current user is Super Admin
CREATE OR REPLACE FUNCTION is_current_user_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE supabase_user_id = auth.uid() 
    AND is_super_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Update activity log policies to hide Super Admin activities from regular admins
DROP POLICY IF EXISTS "Admins can view activity logs" ON admin_activity_log;
CREATE POLICY "Admins can view activity logs" ON admin_activity_log
  FOR SELECT
  USING (
    -- Super Admin can see all logs
    is_current_user_super_admin()
    OR
    -- Regular admins can only see logs from non-super admins
    (
      admin_id IN (SELECT admin_id FROM admins WHERE is_super_admin = false)
    )
  );

-- Step 9: Create view for non-super admins (for easy querying)
CREATE OR REPLACE VIEW admins_visible AS
SELECT * FROM admins
WHERE is_super_admin = false;

-- Step 10: Grant permissions
GRANT SELECT ON admins_visible TO authenticated;

-- Instructions for setting up Super Admin:
-- 1. Create a user in Supabase Authentication dashboard
-- 2. After creation, update the user metadata with:
--    {
--      "is_super_admin": true,
--      "name": "Super Admin Name"
--    }
-- 3. The trigger will automatically sync this user to the admins table
-- 4. The Super Admin will be hidden from all admin lists for regular admins

-- Example: Update existing Supabase Auth user to be Super Admin
-- UPDATE auth.users 
-- SET raw_user_meta_data = raw_user_meta_data || '{"is_super_admin": true, "name": "Super Admin"}'::jsonb
-- WHERE email = 'your-super-admin@example.com';

-- Verify Super Admin setup:
-- SELECT admin_id, name, email, role, is_super_admin, supabase_user_id 
-- FROM admins 
-- WHERE is_super_admin = true;
