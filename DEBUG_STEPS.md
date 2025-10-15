# 🔍 Debug Steps - Admin Login Issue

## Step 1: Check Console Logs

1. Open browser console (F12)
2. Go to Console tab
3. Clear all logs (trash icon)
4. Try to login with the new admin credentials
5. **Copy and share ALL console output**

---

## Step 2: Check What's in the Database

Open Supabase Dashboard and run this query:

```sql
SELECT 
  admin_id, 
  name, 
  email, 
  password_hash,
  LENGTH(password_hash) as password_length,
  role,
  created_at
FROM admins
ORDER BY created_at DESC
LIMIT 5;
```

**Share the results** (hide sensitive data if needed)

---

## Step 3: Test Direct Query

In Supabase SQL Editor, run:

```sql
-- Replace with your actual email
SELECT * FROM admins WHERE email = 'testadmin@example.com';
```

Check:
- Does the admin exist?
- What's the password_hash value?
- Is there any extra whitespace?

---

## Step 4: Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for any failed requests (red)
5. Click on them and check the error

---

## Step 5: Test Authentication Flow

Open browser console and run this:

```javascript
// Test 1: Check if AdminService is accessible
console.log('AdminService:', typeof AdminService);

// Test 2: Try to get admin by email
const testEmail = 'testadmin@example.com'; // Replace with your email
fetch(`${window.location.origin}/api/admins?email=${testEmail}`)
  .then(r => r.json())
  .then(data => console.log('Admin data:', data))
  .catch(err => console.error('Error:', err));
```

---

## Step 6: Check for JavaScript Errors

Look in console for:
- Red error messages
- Failed imports
- Undefined variables
- Network errors

---

## Common Issues & Quick Fixes

### Issue 1: Admin Not Found
**Console shows:** `❌ Admin not found in database for email: ...`

**Fix:**
```sql
-- Verify admin exists
SELECT email FROM admins WHERE email = 'testadmin@example.com';
```

### Issue 2: Password Mismatch
**Console shows:** `❌ Password mismatch`

**Check:**
```sql
-- Check exact password value
SELECT 
  email, 
  password_hash,
  LENGTH(password_hash) as len,
  password_hash = 'test123' as matches
FROM admins 
WHERE email = 'testadmin@example.com';
```

### Issue 3: No Console Logs
**Nothing appears in console**

**Possible causes:**
- Console is filtered (check filter settings)
- Code not running (check for JS errors)
- Wrong page (make sure you're on login page)

### Issue 4: Supabase RLS Policy
**Error:** "new row violates row-level security policy"

**Fix:**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'admins';

-- Temporarily disable RLS for testing (NOT for production!)
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
```

---

## Step 7: Manual Test

Try this in browser console on the login page:

```javascript
// Import the auth service
import { AuthService } from './services/authService';

// Test login directly
AuthService.login('testadmin@example.com', 'test123')
  .then(result => {
    console.log('Login result:', result);
    if (result.success) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed:', result.error);
    }
  })
  .catch(err => console.error('Error:', err));
```

---

## Step 8: Check Admin Creation Logs

When you created the admin, did you see these logs?

```javascript
🔧 Creating new admin with credentials: {...}
✅ Admin created successfully in database: {...}
```

If NOT, the admin might not have been created properly.

---

## What to Share

Please provide:

1. **Console output** when trying to login
2. **Database query results** (admin record)
3. **Any error messages** (red text in console)
4. **Network tab errors** (if any)
5. **What you see on screen** (error message, nothing happens, etc.)

---

## Quick Test Script

Run this in browser console to test everything:

```javascript
// Quick diagnostic
console.log('=== ADMIN LOGIN DIAGNOSTIC ===');

// 1. Check if on login page
console.log('Current URL:', window.location.href);

// 2. Check if services are loaded
console.log('AuthService available:', typeof AuthService !== 'undefined');

// 3. Test database connection
fetch('https://your-project.supabase.co/rest/v1/admins?select=count', {
  headers: {
    'apikey': 'your-anon-key',
    'Authorization': 'Bearer your-anon-key'
  }
})
.then(r => r.json())
.then(data => console.log('Database connection:', data))
.catch(err => console.error('Database error:', err));

// 4. Check localStorage
console.log('Auth storage:', localStorage.getItem('auth-storage'));

console.log('=== END DIAGNOSTIC ===');
```

---

## Next Steps

Based on what you find:

1. **If admin not in database** → Admin creation failed
2. **If password doesn't match** → Check password_hash value
3. **If no console logs** → JavaScript error or wrong page
4. **If RLS error** → Check Supabase policies
5. **If network error** → Check Supabase connection

Share your findings and I'll help you fix it! 🔧
