# Super Admin Quick Start

## 🚀 Quick Setup (5 Minutes)

### Step 1: Run Database Migration (2 min)

1. Open **Supabase Dashboard** → SQL Editor
2. Copy and paste contents of `supabase-super-admin-setup.sql`
3. Click **Run**
4. Wait for "Success" message

### Step 2: Create Super Admin User (2 min)

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter:
   - Email: `superadmin@yourdomain.com`
   - Password: `[Strong Password]`
   - Auto Confirm User: ✅ **Yes**
4. Click **Create User**

### Step 3: Set Super Admin Metadata (1 min)

After user is created:

1. Click on the newly created user
2. Scroll to **User Metadata** section
3. Click **Edit**
4. Replace content with:
```json
{
  "is_super_admin": true,
  "name": "Super Admin"
}
```
5. Click **Save**

### Step 4: Verify Setup (30 sec)

Run this query in SQL Editor:

```sql
SELECT admin_id, name, email, role, is_super_admin 
FROM admins 
WHERE is_super_admin = true;
```

You should see your Super Admin user.

### Step 5: Login (30 sec)

1. Go to your app login page
2. Enter Super Admin credentials
3. You're in! 🎉

---

## ✅ What You Get

- ✅ Super Admin authenticated via Supabase Auth
- ✅ Automatically synced to admins table
- ✅ Hidden from all other admins
- ✅ Full permissions to create/manage other admins
- ✅ Protected routes with access control
- ✅ Activity logging and audit trail

---

## 🎯 Next Steps

### Create Your First Regular Admin

1. Login as Super Admin
2. Go to **Admin Management**
3. Click **Add Admin**
4. Fill in details:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Password: `password123`
   - Role: **Admin** or **Moderator**
   - Permissions: Select as needed
5. Click **Create Admin**

### Test Visibility Controls

1. Logout from Super Admin
2. Login as the regular admin you just created
3. Go to **Admin Management**
4. ✅ You should **NOT** see the Super Admin in the list
5. ✅ You should only see other regular admins

---

## 🔒 Security Checklist

- [ ] Strong password for Super Admin (12+ characters)
- [ ] Enable 2FA in Supabase Auth (recommended)
- [ ] Store credentials in password manager
- [ ] Limit Super Admin usage to admin tasks only
- [ ] Regular backup of Supabase project
- [ ] Monitor Super Admin activity logs

---

## 🆘 Troubleshooting

### Super Admin not appearing in admins table?

**Check metadata:**
```sql
SELECT raw_user_meta_data 
FROM auth.users 
WHERE email = 'your-superadmin@example.com';
```

Should contain: `{"is_super_admin": true}`

**Manually sync:**
```sql
-- Get the user ID first
SELECT id FROM auth.users WHERE email = 'your-superadmin@example.com';

-- Then insert manually
INSERT INTO admins (
  supabase_user_id, name, email, password_hash, role, is_super_admin
) VALUES (
  'user-id-from-above',
  'Super Admin',
  'your-superadmin@example.com',
  'supabase_auth',
  'SUPERADMIN',
  true
);
```

### Can't login as Super Admin?

1. Verify user exists in Supabase Auth
2. Check password is correct
3. Ensure user is confirmed (not pending)
4. Check browser console for errors

### Regular admins can see Super Admin?

Run this to verify RLS policies:
```sql
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'admins';
```

Should see policies:
- `Super Admin full access`
- `Admins can view non-super admins`

---

## 📚 Full Documentation

For detailed information, see: **SUPER_ADMIN_GUIDE.md**

---

## 🎉 You're All Set!

Your Super Admin system is now configured and ready to use. You can now:
- Create and manage other admins
- Control permissions
- Monitor activities
- Secure your application

**Remember**: Use Super Admin account only for administrative tasks. Create a regular admin account for daily operations.
