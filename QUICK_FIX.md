# Quick Fix - Link Your Super Admin

## Skip Prisma - Use SQL Directly

You're getting a Prisma connection error, but you don't need Prisma for this. Just use SQL directly in Supabase.

---

## Step 1: Run SQL in Supabase Dashboard

1. Go to **Supabase Dashboard**: https://rnihpvwaugrekmkbvhlk.supabase.co
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste this entire script:

```sql
-- Add new columns to admins table
ALTER TABLE admins ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS supabase_user_id UUID UNIQUE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_is_super_admin ON admins(is_super_admin);
CREATE INDEX IF NOT EXISTS idx_admins_supabase_user_id ON admins(supabase_user_id);

-- Insert or update Super Admin record
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

-- Verify
SELECT admin_id, name, email, role, is_super_admin, supabase_user_id
FROM admins 
WHERE email = 'admin@ecam.com';
```

5. Click **Run** (or press F5)
6. Check the results - you should see your Super Admin record

---

## Step 2: About "Login as Regular Admin Not Working"

I need to understand what's happening. Let me clarify:

### Scenario A: You're trying to test visibility
- You want to create a regular admin
- Then logout from Super Admin
- Login as that regular admin
- And verify Super Admin is hidden

**If this is the case:**
1. First, make sure you've run the SQL above
2. Login as Super Admin (admin@ecam.com)
3. Go to Admin Management page
4. Create a new regular admin (e.g., john@example.com)
5. Logout
6. Try to login as john@example.com

**Problem?** Regular admins authenticate differently:
- Super Admin → Uses Supabase Auth
- Regular Admin → Uses admins table password

### Scenario B: You already have a regular admin but can't login
- Check if the admin exists in the database
- Check if the password is correct
- Check if the authentication logic handles both types

---

## Step 3: Check Current Admins

Run this in Supabase SQL Editor:

```sql
-- See all admins
SELECT 
  admin_id,
  name,
  email,
  role,
  is_super_admin,
  supabase_user_id,
  created_at
FROM admins
ORDER BY created_at DESC;
```

This will show:
- How many admins you have
- Which one is Super Admin
- Which are regular admins

---

## Step 4: Test Authentication

### For Super Admin (admin@ecam.com):
- Uses Supabase Auth password
- Should work immediately after running SQL

### For Regular Admin:
- Uses password stored in admins table
- Needs to be created through Admin Management page
- OR needs password hash in database

---

## Common Issues

### Issue 1: "No regular admin exists yet"
**Solution:** Login as Super Admin first, then create a regular admin from the UI

### Issue 2: "Regular admin exists but password doesn't work"
**Solution:** The password needs to be hashed. Check your AuthService to see how it handles regular admin authentication.

### Issue 3: "AuthService doesn't recognize regular admins"
**Solution:** Make sure your AuthService has the dual authentication logic (Supabase Auth + Database)

---

## Tell Me More

Please clarify:
1. ✅ Have you run the SQL script in Supabase yet?
2. ✅ Can you login as Super Admin (admin@ecam.com)?
3. ❓ Do you have any regular admins created?
4. ❓ What exactly happens when you try to login as regular admin?
   - Wrong password error?
   - User not found error?
   - Something else?

Let me know and I'll help you fix the specific issue!
