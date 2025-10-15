# 📝 Simple Permissions Guide

## What You Can Do

1. ✅ **Create admins** with custom permissions
2. ✅ **Edit admins** to change their permissions
3. ✅ **Assign page access** using checkboxes

---

## Step 1: Setup Database (One-time, 2 minutes)

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Run this SQL:

```sql
-- Add permissions column
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;

-- Add custom_role column
ALTER TABLE admins ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);

-- Force schema reload
NOTIFY pgrst, 'reload schema';
```

4. Wait 2-3 minutes
5. Restart your app: `npm start`

---

## Step 2: Create Admin with Permissions

### In User Management Page:

1. **Click "Add User"**

2. **Fill in basic info:**
   ```
   Name:     John Manager
   Email:    john@company.com
   Password: john123
   Role:     Contest Manager  ← Custom role name
   ```

3. **Select Page Permissions** (checkboxes):

   **📊 Dashboard**
   - ✅ Read (can view dashboard)
   - ⬜ Write
   - ⬜ Update

   **🏆 Contest Management**
   - ✅ Read (can view contests)
   - ✅ Write (can create contests)
   - ✅ Update (can edit/delete contests)

   **👥 Participant Management**
   - ✅ Read
   - ✅ Write
   - ⬜ Update

   **🎲 Lucky Draw**
   - ✅ Read
   - ⬜ Write
   - ⬜ Update

   **🏅 Winners Management**
   - ✅ Read
   - ⬜ Write
   - ⬜ Update

   **💬 Communication**
   - ⬜ Read (no access)
   - ⬜ Write
   - ⬜ Update

   **📈 Analytics**
   - ⬜ Read (no access)
   - ⬜ Write
   - ⬜ Update

   **👤 User Management**
   - ⬜ Read (no access)
   - ⬜ Write
   - ⬜ Update

   **⚙️ Settings**
   - ⬜ Read (no access)
   - ⬜ Write
   - ⬜ Update

4. **Click "Create Admin"**

---

## Step 3: Edit Admin Permissions

1. **Go to User Management**
2. **Click the Edit icon** (✏️) next to an admin
3. **Change permissions** by checking/unchecking boxes
4. **Click "Update Admin"**

---

## What Each Permission Means

| Permission | What It Allows |
|------------|----------------|
| **Read** | Can view the page and see data |
| **Write** | Can create new items (contests, participants, etc.) |
| **Update** | Can edit and delete existing items |
| **None** | Cannot access the page at all |

---

## Example Roles

### Contest Manager
```
✅ Dashboard (Read)
✅ Contests (Read, Write, Update)
✅ Participants (Read, Write)
✅ Draw (Read)
✅ Winners (Read)
❌ Communication
❌ Analytics
❌ User Management
❌ Settings
```

### Data Analyst
```
✅ Dashboard (Read)
✅ Contests (Read)
✅ Participants (Read)
✅ Winners (Read)
✅ Analytics (Read)
❌ Communication
❌ User Management
❌ Settings
```

### Support Staff
```
✅ Dashboard (Read)
✅ Participants (Read, Write)
✅ Communication (Read, Write)
❌ Contests
❌ Draw
❌ Winners
❌ Analytics
❌ User Management
❌ Settings
```

---

## Testing

### Test 1: Create Admin
1. Create admin with limited permissions (e.g., only Dashboard + Contests)
2. Check database to verify permissions are saved

### Test 2: Login as New Admin
1. Logout from Super Admin
2. Login with new admin credentials
3. Check sidebar - should only show allowed pages

### Test 3: Edit Permissions
1. Login as Super Admin
2. Edit the admin's permissions
3. Logout and login as that admin again
4. Verify changes took effect

---

## Quick Tips

✅ **Check "Read" first** - User needs Read to access the page at all
✅ **Write = Create** - Allows creating new items
✅ **Update = Edit + Delete** - Allows modifying existing items
✅ **No checkboxes = No access** - Page won't appear in sidebar

---

## Troubleshooting

### Permissions not saving?

**Check:**
1. Did you run the SQL to add the `permissions` column?
2. Wait 2-3 minutes after running SQL
3. Restart the app
4. Check browser console for errors

### All pages still visible?

**Solution:**
1. Make sure you're logged in as the restricted admin (not Super Admin)
2. Clear browser cache (Ctrl+Shift+R)
3. Check that permissions were saved in database:
   ```sql
   SELECT name, email, custom_role, permissions 
   FROM admins 
   WHERE email = 'john@company.com';
   ```

### Edit not working?

**Check:**
1. Click the edit icon (✏️) next to the admin
2. Modal should open with current permissions checked
3. Change permissions and click "Update Admin"

---

## That's It!

You can now:
- ✅ Create admins with custom permissions
- ✅ Edit admin permissions anytime
- ✅ Control exactly what each admin can access

**No complex setup needed - just checkboxes!** 📋
