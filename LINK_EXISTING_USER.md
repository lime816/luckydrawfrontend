# Link Existing Supabase User as Super Admin

## Quick Setup (2 Minutes)

You already have a user `admin@ecam.com` in Supabase Authentication. Let's link it to the admins table as Super Admin.

---

## Option 1: SQL Script (Recommended - Fastest)

### Step 1: Run SQL Migration

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the entire contents of: `link-existing-super-admin.sql`
3. Click **Run**
4. You should see a success message and the admin record

### Step 2: Verify

The query at the end will show your Super Admin record:
```
admin_id | name        | email           | role       | is_super_admin | supabase_user_id
---------|-------------|-----------------|------------|----------------|------------------
1        | Super Admin | admin@ecam.com  | SUPERADMIN | true           | a6fec55f-c94f...
```

### Step 3: Login

1. Go to your app login page
2. Email: `admin@ecam.com`
3. Password: Your Supabase Auth password
4. ✅ You're in as Super Admin!

---

## Option 2: Node.js Script

If you prefer to use Node.js:

```bash
# Install dependencies (if not already installed)
npm install

# Run the script
node link-super-admin.js
```

The script will:
- Connect to your Supabase database
- Create/update the Super Admin record
- Link it to your Supabase Auth user
- Set full permissions

---

## Option 3: Prisma Migration

If you want to use Prisma:

### Step 1: Generate Prisma Client
```bash
npx prisma generate
```

### Step 2: Run Migration
```bash
npx prisma db push
```

### Step 3: Run SQL Script
Then run the `link-existing-super-admin.sql` in Supabase SQL Editor to link your user.

---

## What This Does

1. **Adds new columns** to admins table:
   - `is_super_admin` - Flag to identify Super Admin
   - `supabase_user_id` - Links to Supabase Auth user
   - `custom_role` - For custom role names
   - `permissions` - JSON field for granular permissions

2. **Creates Super Admin record**:
   - Links your Supabase user `a6fec55f-c94f-4d08-962f-bda89fe3847c`
   - Sets role to `SUPERADMIN`
   - Sets `is_super_admin = true`
   - Grants full permissions

3. **Sets up indexes** for better query performance

---

## After Setup

### ✅ You Can Now:
- Login with `admin@ecam.com` and your Supabase password
- Access all admin features
- Create other admins from Admin Management page
- Manage permissions
- View all system data

### 🔒 Security Features:
- Your Super Admin account is hidden from other admins
- Only you can see your own record
- Full audit trail of all actions
- Row Level Security enforced at database level

---

## Troubleshooting

### Error: "duplicate key value violates unique constraint"

This means an admin with that email already exists. Update the SQL to use UPDATE instead:

```sql
UPDATE admins 
SET 
  supabase_user_id = 'a6fec55f-c94f-4d08-962f-bda89fe3847c',
  is_super_admin = true,
  role = 'SUPERADMIN',
  permissions = '{...}'::jsonb
WHERE email = 'admin@ecam.com';
```

### Can't login after setup?

1. Verify the record was created:
   ```sql
   SELECT * FROM admins WHERE email = 'admin@ecam.com';
   ```

2. Check Supabase Auth user exists:
   - Go to Authentication → Users
   - Find `admin@ecam.com`
   - Make sure it's confirmed (not pending)

3. Try resetting password in Supabase Auth dashboard

---

## Next Steps

After successful login:

1. **Test Super Admin Access**
   - Go to Admin Management
   - You should see the interface to create admins

2. **Create Your First Regular Admin**
   - Click "Add Admin"
   - Fill in details
   - Assign role (Admin or Moderator)
   - Set permissions

3. **Test Visibility**
   - Logout
   - Login as the regular admin
   - Go to Admin Management
   - ✅ You should NOT see the Super Admin in the list

4. **Review Documentation**
   - Read `SUPER_ADMIN_GUIDE.md` for complete details
   - Check `SUPER_ADMIN_ARCHITECTURE.md` for system design

---

## Quick Verification

Run this query to verify everything is set up correctly:

```sql
-- Check Super Admin
SELECT 
  admin_id,
  name,
  email,
  role,
  is_super_admin,
  supabase_user_id,
  permissions
FROM admins 
WHERE is_super_admin = true;

-- Should return 1 row with your admin@ecam.com user
```

---

**Status**: Ready to run! Choose Option 1 (SQL Script) for fastest setup.
