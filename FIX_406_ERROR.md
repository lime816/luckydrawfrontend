# 🔧 Fix 406 Error - Supabase Headers Issue

## 🐛 The Problem

Error in console:
```
Failed to load resource: the server responded with a status of 406 ()
❌ Admin not found in database for email: udith@gmail.com
```

**Status 406** = "Not Acceptable" - Supabase is rejecting the request because it's missing proper headers.

---

## ✅ Solution Applied

I've updated `src/lib/supabase-db.ts` to include proper headers:

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  }
});
```

---

## 🚀 What to Do Now

### Step 1: Restart Your Dev Server

1. **Stop the server** (Ctrl + C in terminal)
2. **Start it again**:
   ```bash
   npm start
   ```

### Step 2: Clear Browser Cache

1. Press **Ctrl + Shift + R** (hard refresh)
2. Or clear cache completely:
   - Press **Ctrl + Shift + Delete**
   - Clear "Cached images and files"
   - Clear "Cookies and site data"

### Step 3: Test Login

Try logging in with:
- Email: `udith@gmail.com`
- Password: `password123`

---

## ✅ Expected Result

After restarting, you should see:

```
🔐 Starting authentication for: udith@gmail.com
📍 Step 1: Checking Supabase Auth...
❌ Not found in Supabase Auth, checking Admin table...
📍 Step 2: Checking Admin Table...
✅ Admin found in database: {email: "udith@gmail.com", role: "MODERATOR"}
🔐 Comparing passwords...
   - Stored password hash: password123
   - Provided password: password123
   - Match: true
✅ Password verified successfully
✅ Admin authentication successful
```

---

## 🎯 All Your Admins Should Now Work

| Email | Password | Role |
|-------|----------|------|
| admin@ecam.com | [Supabase Auth password] | SUPERADMIN |
| testadmin@example.com | password123 | ADMIN |
| mrudhula@gmail.com | password123 | MODERATOR |
| hrithik@gmail.com | password123 | MODERATOR |
| udith@gmail.com | password123 | MODERATOR |

---

## 🐛 If Still Getting 406 Error

### Check 1: Verify .env file

Make sure your `.env` has:
```
REACT_APP_SUPABASE_URL=https://rnihpvwaugrekmkbvhlk.supabase.co
REACT_APP_SUPABASE_ANON_KEY=[your-anon-key]
```

### Check 2: Verify Supabase Project

1. Go to Supabase Dashboard
2. Settings → API
3. Make sure "Project URL" matches your `.env`
4. Make sure "anon public" key matches your `.env`

### Check 3: Check RLS Policies

Run this in Supabase SQL Editor:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'admins';

-- Should show: rowsecurity = true
```

If RLS is blocking, temporarily disable it for testing:
```sql
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
```

Then try login again.

---

## 🎉 Summary

The fix adds proper HTTP headers to all Supabase requests, which should resolve the 406 error.

**Next steps:**
1. Restart dev server
2. Hard refresh browser (Ctrl+Shift+R)
3. Try login again
4. Check console logs

The 406 error should be gone and all admins should work! ✅
