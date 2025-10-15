# 🔧 Fix Custom Role Display

## The Issue

The Role column is showing system roles (ADMIN, MODERATOR, SUPERADMIN) instead of your custom role (like "Coordinator").

## ✅ Solution Steps

### Step 1: Add custom_role Column to Database

1. **Go to Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run this SQL:**

```sql
-- Add custom_role column if it doesn't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);

-- Add permissions column if it doesn't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admins' 
AND column_name IN ('custom_role', 'permissions');

-- Force Supabase to refresh schema cache
NOTIFY pgrst, 'reload schema';
```

4. **Wait 2-3 minutes** for Supabase to refresh the schema cache

### Step 2: Update Existing Admins (Optional)

If you want to set custom roles for existing admins:

```sql
-- Update existing admins with custom roles
UPDATE admins 
SET custom_role = 'Moderator' 
WHERE role = 'MODERATOR' AND custom_role IS NULL;

UPDATE admins 
SET custom_role = 'Administrator' 
WHERE role = 'ADMIN' AND custom_role IS NULL;

UPDATE admins 
SET custom_role = 'Super Administrator' 
WHERE role = 'SUPERADMIN' AND custom_role IS NULL;

-- Verify
SELECT admin_id, name, email, role, custom_role FROM admins;
```

### Step 3: Restart Your Application

```bash
# Stop the server (Ctrl+C)
npm start
```

### Step 4: Test Creating New Admin

1. **Go to User Management** page
2. **Click "Add User"**
3. **Fill in:**
   ```
   Name:     Test User
   Email:    testuser@company.com
   Password: test123
   Role:     Coordinator  ← Enter your custom role here
   ```
4. **Click "Create Admin"**
5. **Check the table** - Role column should show "Coordinator"

---

## 🔍 Verify Database Column Exists

Run this in Supabase SQL Editor:

```sql
-- Check if custom_role column exists
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'admins' 
AND column_name = 'custom_role';
```

**Expected Result:**
```
column_name  | data_type        | character_maximum_length | is_nullable
-------------|------------------|--------------------------|-------------
custom_role  | character varying| 150                      | YES
```

If you get **no results**, the column doesn't exist. Run Step 1 again.

---

## 🐛 Troubleshooting

### Issue 1: Column Not Found Error

**Error:** `column "custom_role" does not exist`

**Solution:**
1. Run the SQL from Step 1
2. Wait 2-3 minutes
3. Restart your app
4. Try again

### Issue 2: Still Showing System Roles

**Possible Causes:**

1. **Database column doesn't exist**
   - Run Step 1 SQL
   - Wait for cache refresh

2. **Existing admins have NULL custom_role**
   - Run Step 2 SQL to update existing admins
   - Or delete and recreate them

3. **Browser cache**
   - Hard refresh: Ctrl+Shift+R
   - Clear browser cache

4. **Code not updated**
   - Make sure you saved all files
   - Restart npm start

### Issue 3: Custom Role Not Saving

**Check in database:**
```sql
SELECT admin_id, name, email, role, custom_role 
FROM admins 
ORDER BY created_at DESC 
LIMIT 5;
```

If `custom_role` is NULL for new admins:
- Check if the column exists
- Check for RLS policies blocking updates
- Check console for errors

---

## 📊 Expected Behavior

### Before Fix:
| User | Role |
|------|------|
| Emil | 🟡 Moderator |
| udith | 🟡 Moderator |
| Mrudhula | 🟡 Moderator |

### After Fix:
| User | Role |
|------|------|
| Emil | 🔵 Event Manager |
| udith | 🔵 Data Analyst |
| Mrudhula | 🔵 Coordinator |

---

## ✅ Verification Checklist

- [ ] Ran SQL to add custom_role column
- [ ] Waited 2-3 minutes for cache refresh
- [ ] Restarted npm start
- [ ] Created new admin with custom role
- [ ] Custom role appears in table
- [ ] Verified in database that custom_role is saved

---

## 🎯 Quick Test

1. **Run this SQL in Supabase:**
   ```sql
   ALTER TABLE admins ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);
   NOTIFY pgrst, 'reload schema';
   ```

2. **Wait 3 minutes**

3. **Restart app:**
   ```bash
   npm start
   ```

4. **Create test admin:**
   - Role: "Test Coordinator"

5. **Check table** - Should show "Test Coordinator"

---

If it still doesn't work after following all steps, share:
1. Result of the verification SQL query
2. Screenshot of the create admin form
3. Console errors (if any)
