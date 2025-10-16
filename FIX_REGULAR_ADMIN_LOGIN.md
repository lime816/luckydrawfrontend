# Fix Regular Admin Login - Step by Step

## 🐛 Problem: testadmin@example.com login not working

Your AuthService has excellent logging built-in. Let's use it to debug!

---

## 🔍 Step 1: Check Browser Console Logs

1. **Open your app** in the browser
2. **Open DevTools** (Press F12)
3. **Go to Console tab**
4. **Try to login** with:
   - Email: `testadmin@example.com`
   - Password: `password123`

### What to Look For:

You should see logs like this:

```
🔐 Starting authentication for: testadmin@example.com
📍 Step 1: Checking Supabase Auth...
❌ Not found in Supabase Auth, checking Admin table...
📍 Step 2: Checking Admin Table...
✅ Admin found in database: {email: "testadmin@example.com", role: "ADMIN"}
🔐 Comparing passwords...
   - Stored password hash: password123
   - Provided password: password123
   - Match: true
✅ Password verified successfully
✅ Admin authentication successful
```

### If You See Different Logs:

#### Scenario A: "❌ Admin not found in database"
**Problem:** The admin doesn't exist in the database.

**Fix:** Run this in Supabase SQL Editor:
```sql
-- Check if admin exists
SELECT * FROM admins WHERE email = 'testadmin@example.com';

-- If no results, create it:
INSERT INTO admins (name, email, password_hash, role, is_super_admin, two_factor)
VALUES ('Test Admin', 'testadmin@example.com', 'password123', 'ADMIN', false, false);
```

#### Scenario B: "❌ Password mismatch"
**Problem:** The stored password doesn't match what you're typing.

**Check what's stored:**
```sql
SELECT email, password_hash FROM admins WHERE email = 'testadmin@example.com';
```

**Fix it:**
```sql
UPDATE admins 
SET password_hash = 'password123'
WHERE email = 'testadmin@example.com';
```

#### Scenario C: Error before reaching admin table check
**Problem:** Supabase Auth is taking too long or erroring.

**Fix:** Check your Supabase connection in `.env`

---

## 🔍 Step 2: Verify Database

Run these queries in **Supabase SQL Editor**:

### Query 1: Check if admin exists
```sql
SELECT 
  admin_id,
  name,
  email,
  password_hash,
  role,
  is_super_admin,
  two_factor,
  created_at
FROM admins 
WHERE email = 'testadmin@example.com';
```

**Expected Result:**
```
admin_id | name       | email                  | password_hash | role  | is_super_admin
---------|------------|------------------------|---------------|-------|---------------
2        | Test Admin | testadmin@example.com  | password123   | ADMIN | false
```

**If no results:** Admin doesn't exist, run `create-test-admin.sql`

**If password_hash is different:** Update it with the fix below

### Query 2: Check all admins
```sql
SELECT 
  admin_id,
  email,
  password_hash,
  role,
  is_super_admin
FROM admins
ORDER BY admin_id;
```

This shows all admins in your database.

---

## 🔧 Step 3: Common Fixes

### Fix 1: Create the admin if missing
```sql
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
  'password123',
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
```

### Fix 2: Update password if wrong
```sql
UPDATE admins 
SET password_hash = 'password123'
WHERE email = 'testadmin@example.com';
```

### Fix 3: Ensure columns exist
```sql
ALTER TABLE admins ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS supabase_user_id UUID UNIQUE;
```

### Fix 4: Check for typos in email
```sql
-- See all emails (case-sensitive)
SELECT email FROM admins;

-- If you see 'TestAdmin@example.com' instead of 'testadmin@example.com':
UPDATE admins 
SET email = 'testadmin@example.com'
WHERE LOWER(email) = 'testadmin@example.com';
```

---

## 🧪 Step 4: Test Again

After applying fixes:

1. **Refresh your browser** (Ctrl+Shift+R)
2. **Clear console** (click 🚫 icon in DevTools)
3. **Try login again**:
   - Email: `testadmin@example.com`
   - Password: `password123`
4. **Watch console logs**

---

## 📊 Step 5: Advanced Debugging

If still not working, run this complete diagnostic:

```sql
-- Complete diagnostic query
SELECT 
  'Admin Exists' as check_name,
  CASE WHEN COUNT(*) > 0 THEN '✅ YES' ELSE '❌ NO' END as result
FROM admins 
WHERE email = 'testadmin@example.com'

UNION ALL

SELECT 
  'Password Matches',
  CASE WHEN password_hash = 'password123' THEN '✅ YES' ELSE '❌ NO - Password is: ' || password_hash END
FROM admins 
WHERE email = 'testadmin@example.com'

UNION ALL

SELECT 
  'Role is ADMIN',
  CASE WHEN role = 'ADMIN' THEN '✅ YES' ELSE '❌ NO - Role is: ' || role END
FROM admins 
WHERE email = 'testadmin@example.com'

UNION ALL

SELECT 
  'Is NOT Super Admin',
  CASE WHEN is_super_admin = false OR is_super_admin IS NULL THEN '✅ YES' ELSE '❌ NO - is_super_admin is true' END
FROM admins 
WHERE email = 'testadmin@example.com'

UNION ALL

SELECT 
  'Has Permissions',
  CASE WHEN permissions IS NOT NULL THEN '✅ YES' ELSE '⚠️ NULL (will use empty object)' END
FROM admins 
WHERE email = 'testadmin@example.com';
```

This will show you exactly what's wrong.

---

## 🎯 Most Common Issues & Solutions

### Issue 1: "Invalid email or password" error
**Cause:** Admin doesn't exist OR password doesn't match

**Solution:**
1. Run diagnostic query above
2. If admin doesn't exist: Run `create-test-admin.sql`
3. If password wrong: Run Fix 2 (UPDATE password)

### Issue 2: Login button does nothing
**Cause:** JavaScript error or network issue

**Solution:**
1. Check browser console for errors (red text)
2. Check Network tab for failed requests
3. Make sure Supabase URL is correct in `.env`

### Issue 3: "User not found in admins table"
**Cause:** Admin doesn't exist

**Solution:** Run `create-test-admin.sql` in Supabase SQL Editor

### Issue 4: Login works but immediately logs out
**Cause:** Token or session issue

**Solution:**
1. Check if `useAuthStore` is working
2. Check browser localStorage for auth-storage
3. Clear browser cache and try again

---

## ✅ Verification Checklist

Run through this checklist:

- [ ] Admin exists in database (Query 1 returns 1 row)
- [ ] Password is exactly `password123` (no extra spaces)
- [ ] Role is `ADMIN` (not `SUPERADMIN`)
- [ ] `is_super_admin` is `false` or `NULL`
- [ ] Browser console shows authentication logs
- [ ] No JavaScript errors in console (red text)
- [ ] Supabase connection works (check Network tab)
- [ ] `.env` file has correct `REACT_APP_SUPABASE_URL`

---

## 🆘 Still Not Working?

If you've tried everything above and it still doesn't work, provide me with:

### 1. Console Logs
Copy the entire console output when you try to login, starting from:
```
🔐 Starting authentication for: testadmin@example.com
```

### 2. Database Query Result
Run this and share the result:
```sql
SELECT * FROM admins WHERE email = 'testadmin@example.com';
```

### 3. Error Message
What exact error message do you see on the login screen?

### 4. Network Tab
- Open DevTools → Network tab
- Try to login
- Look for any failed requests (red)
- Share the request/response details

With this information, I can pinpoint the exact issue!

---

## 🎉 Expected Success

When it works, you should see:

**Console:**
```
🔐 Starting authentication for: testadmin@example.com
✅ Admin found in database
✅ Password verified successfully
✅ Admin authentication successful
```

**Screen:**
- Login successful
- Redirected to dashboard
- Shows "Test Admin" as logged-in user
- Role shows "Admin"

---

**Quick Fix:** Most likely the admin doesn't exist or password is wrong. Run `debug-regular-admin.sql` to check!
