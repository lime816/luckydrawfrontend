# Testing Guide - Super Admin & Regular Admin Login

## 🎯 Quick Test (5 Minutes)

### Step 1: Setup Super Admin

Run this in **Supabase SQL Editor**:

```sql
-- File: link-existing-super-admin.sql
-- (Copy the entire contents of that file)
```

### Step 2: Create Test Regular Admin

Run this in **Supabase SQL Editor**:

```sql
-- File: create-test-admin.sql
-- (Copy the entire contents of that file)
```

### Step 3: Test Logins

#### Test A: Login as Super Admin ✅
1. Go to your app login page
2. Email: `admin@ecam.com`
3. Password: **Your Supabase Auth password** (the one you set in Supabase Dashboard)
4. Click Login
5. ✅ Should work - you're logged in as Super Admin

#### Test B: Login as Regular Admin ✅
1. Logout from Super Admin
2. Go to login page
3. Email: `testadmin@example.com`
4. Password: `password123`
5. Click Login
6. ✅ Should work - you're logged in as Regular Admin

---

## 🔍 Verification Steps

### After Login as Super Admin:

1. **Check Role Display**
   - Should show "Super Admin" or "SUPERADMIN"
   
2. **Go to Admin Management**
   - Should see interface to create/manage admins
   - Should see "Test Admin" in the list
   - Should see yourself (Super Admin) in the list

3. **Check Permissions**
   - All menu items should be accessible
   - No restrictions

### After Login as Regular Admin:

1. **Check Role Display**
   - Should show "Admin" or "ADMIN"

2. **Go to Admin Management**
   - Should see "Test Admin" (yourself)
   - Should **NOT** see "Super Admin" (admin@ecam.com) ❌
   - This proves visibility control is working!

3. **Check Permissions**
   - Some features may be restricted based on permissions
   - Cannot access Super Admin-only features

---

## 🐛 Troubleshooting

### Problem 1: "Super Admin login fails"

**Symptoms:**
- Error: "Invalid email or password"
- Can't login with admin@ecam.com

**Solutions:**

A. **Check if Super Admin exists in database:**
```sql
SELECT * FROM admins WHERE email = 'admin@ecam.com';
```
Should return 1 row with `is_super_admin = true`

B. **Check Supabase Auth user:**
- Go to Supabase Dashboard → Authentication → Users
- Find admin@ecam.com
- Make sure status is "Confirmed" (not "Pending")

C. **Reset Supabase Auth password:**
- In Supabase Dashboard → Authentication → Users
- Click on admin@ecam.com
- Click "Send password reset email"
- Or manually set a new password

D. **Check console logs:**
- Open browser DevTools (F12)
- Go to Console tab
- Try to login
- Look for authentication logs (they start with 🔐, ✅, or ❌)

### Problem 2: "Regular Admin login fails"

**Symptoms:**
- Error: "Invalid email or password"
- Can't login with testadmin@example.com

**Solutions:**

A. **Check if admin exists:**
```sql
SELECT * FROM admins WHERE email = 'testadmin@example.com';
```
Should return 1 row with `is_super_admin = false`

B. **Check password:**
Your AuthService compares passwords directly (no hashing).
The password in database should be: `password123`

```sql
SELECT email, password_hash FROM admins WHERE email = 'testadmin@example.com';
```
Should show: `password_hash = 'password123'`

C. **Check console logs:**
- Open browser DevTools (F12)
- Try to login
- Look for these specific logs:
  ```
  🔐 Starting authentication for: testadmin@example.com
  ❌ Not found in Supabase Auth, checking Admin table...
  ✅ Admin found in database
  🔐 Comparing passwords...
  ✅ Password verified successfully
  ```

D. **Manual password fix:**
If password doesn't match, update it:
```sql
UPDATE admins 
SET password_hash = 'password123'
WHERE email = 'testadmin@example.com';
```

### Problem 3: "Login works but redirects to wrong page"

**Check your routing:**
- Super Admin should go to `/dashboard` or `/super-admin-dashboard`
- Regular Admin should go to `/dashboard`

### Problem 4: "Can see Super Admin in regular admin view"

**This means visibility control isn't working.**

A. **Check if is_super_admin flag is set:**
```sql
SELECT email, is_super_admin FROM admins;
```
Super Admin should have `is_super_admin = true`

B. **Check AdminService.getAllAdmins():**
Make sure it's filtering by default:
```typescript
static async getAllAdmins(includeSuperAdmin: boolean = false)
```

C. **Check where getAllAdmins is called:**
In AdminManagement.tsx, it should be:
```typescript
AdminService.getAllAdmins() // No parameter = excludes Super Admin
```

### Problem 5: "Authentication takes too long"

**Check network tab:**
- Open DevTools → Network tab
- Try to login
- Look for slow requests
- Check if Supabase is reachable

---

## 📊 Database Verification Queries

### Check all admins:
```sql
SELECT 
  admin_id,
  name,
  email,
  role,
  is_super_admin,
  CASE 
    WHEN supabase_user_id IS NOT NULL THEN 'Supabase Auth'
    ELSE 'Database'
  END as auth_method,
  password_hash,
  created_at
FROM admins
ORDER BY is_super_admin DESC;
```

### Check Super Admin specifically:
```sql
SELECT * FROM admins WHERE is_super_admin = true;
```

### Check Regular Admins:
```sql
SELECT * FROM admins WHERE is_super_admin = false OR is_super_admin IS NULL;
```

### Check permissions:
```sql
SELECT 
  email,
  role,
  permissions
FROM admins;
```

---

## 🎯 Expected Results

After running both SQL scripts, you should have:

| Email | Role | Auth Method | is_super_admin | Password |
|-------|------|-------------|----------------|----------|
| admin@ecam.com | SUPERADMIN | Supabase Auth | true | Your Supabase password |
| testadmin@example.com | ADMIN | Database | false | password123 |

---

## 🔐 Security Note

**IMPORTANT:** Your current setup uses **plain text password comparison** for regular admins. This is fine for development but **NOT for production**.

For production, you should:
1. Hash passwords with bcrypt when creating admins
2. Compare hashed passwords during login
3. Never store plain text passwords

Example fix (for later):
```typescript
// When creating admin:
const hashedPassword = await bcrypt.hash(password, 10);

// When logging in:
const isValid = await bcrypt.compare(password, admin.password_hash);
```

---

## ✅ Success Checklist

- [ ] Ran `link-existing-super-admin.sql` in Supabase
- [ ] Ran `create-test-admin.sql` in Supabase
- [ ] Can login as Super Admin (admin@ecam.com)
- [ ] Can login as Regular Admin (testadmin@example.com)
- [ ] Super Admin can see all admins including themselves
- [ ] Regular Admin CANNOT see Super Admin in lists
- [ ] Both admins can access their respective features
- [ ] Console logs show correct authentication flow

---

## 🆘 Still Having Issues?

If you're still having problems, please provide:

1. **Which login is failing?**
   - Super Admin (admin@ecam.com)?
   - Regular Admin (testadmin@example.com)?

2. **What error message do you see?**
   - Copy the exact error message

3. **Console logs:**
   - Open DevTools (F12) → Console
   - Try to login
   - Copy all the authentication logs (🔐, ✅, ❌)

4. **Database check:**
   - Run the verification queries above
   - Share the results

With this information, I can help you debug the specific issue!
