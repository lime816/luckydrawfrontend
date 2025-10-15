# 🚀 Quick Start - RBAC System

## 3-Step Setup (10 minutes)

### Step 1: Run SQL (2 minutes)

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste from `SETUP_RBAC.sql`
4. Click **Run**
5. Wait 2-3 minutes

### Step 2: Restart App (1 minute)

```bash
# Stop current server (Ctrl+C)
npm start
```

### Step 3: Test (7 minutes)

1. **Login as Super Admin**
2. **Go to User Management**
3. **Create test admin:**
   ```
   Name: Test Manager
   Email: testmanager@company.com
   Password: test123
   Role: Contest Manager
   ```
4. **Set permissions** (check boxes):
   - Dashboard: ✅ Read
   - Contests: ✅ Read, ✅ Write, ✅ Update
   - Participants: ✅ Read, ✅ Write
   - Others: Leave unchecked
5. **Click "Create Admin"**
6. **Logout**
7. **Login as Test Manager:**
   ```
   Email: testmanager@company.com
   Password: test123
   ```
8. **Verify:**
   - ✅ Sidebar shows only: Dashboard, Contests, Participants
   - ❌ Cannot see: Communication, Analytics, Settings, etc.

---

## ✅ Expected Results

### Sidebar for Test Manager:
```
✅ Dashboard
✅ Contests  
✅ Participants
```

### Sidebar for Super Admin:
```
✅ Dashboard
✅ Contests
✅ Participants
✅ Lucky Draw
✅ Winners
✅ Communication
✅ Analytics
✅ User Management
✅ Settings
```

---

## 🎯 What You Can Do Now

### As Super Admin:

1. **Create admins with custom roles:**
   - Contest Manager
   - Data Analyst
   - Event Coordinator
   - Support Staff

2. **Assign specific permissions:**
   - Read only (view pages)
   - Write (create items)
   - Update (edit/delete items)

3. **Control access to:**
   - Dashboard
   - Contests
   - Participants
   - Lucky Draw
   - Winners
   - Communication
   - Analytics
   - Settings
   - User Management

### As Regular Admin:

- Only see pages you have access to
- Only perform actions you're allowed to
- Cannot access restricted pages

---

## 📋 Permission Examples

### Contest Manager
```
Dashboard:      Read only
Contests:       Full access (read, write, update)
Participants:   Read + Write
Draw:           Read only
Winners:        Read only
Others:         No access
```

### Data Analyst
```
Dashboard:      Read only
Contests:       Read only
Participants:   Read only
Winners:        Read only
Analytics:      Read only
Others:         No access
```

### Support Staff
```
Dashboard:      Read only
Participants:   Read + Write
Communication:  Read + Write
Others:         No access
```

---

## 🔧 How to Use

### Creating Admin with Permissions:

1. Go to **User Management**
2. Click **"Add User"**
3. Fill in basic info
4. Enter **custom role name** (e.g., "Contest Manager")
5. **Check permission boxes** for each page:
   - ✅ Read = Can view the page
   - ✅ Write = Can create new items
   - ✅ Update = Can edit/delete items
6. Click **"Create Admin"**

### Testing Permissions:

1. **Logout**
2. **Login with new admin credentials**
3. **Check sidebar** - only shows allowed pages
4. **Try accessing restricted page** - shows "Access Denied"
5. **Check buttons** - only shows allowed actions

---

## 🆘 Troubleshooting

### Problem: All pages still visible

**Solution:**
1. Check if SQL was run successfully
2. Wait 3 minutes for cache refresh
3. Restart app: `npm start`
4. Clear browser cache (Ctrl+Shift+R)

### Problem: Super Admin has no access

**Solution:**
```sql
-- Run this in Supabase SQL Editor
UPDATE admins 
SET permissions = jsonb_build_object(
  'dashboard', ARRAY['read', 'write', 'update'],
  'contests', ARRAY['read', 'write', 'update'],
  'participants', ARRAY['read', 'write', 'update'],
  'draw', ARRAY['read', 'write', 'update'],
  'winners', ARRAY['read', 'write', 'update'],
  'communication', ARRAY['read', 'write', 'update'],
  'analytics', ARRAY['read', 'write', 'update'],
  'settings', ARRAY['read', 'write', 'update'],
  'user_management', ARRAY['read', 'write', 'update'],
  'admin_management', ARRAY['read', 'write', 'update']
)
WHERE role = 'SUPERADMIN';
```

### Problem: Permissions not saving

**Check:**
1. Database has `permissions` column
2. No console errors
3. Form is submitting correctly

---

## 📚 More Information

- **Full Guide:** `RBAC_IMPLEMENTATION_GUIDE.md`
- **SQL Setup:** `SETUP_RBAC.sql`
- **Code Examples:** See implementation guide

---

## ✅ Success Checklist

- [ ] SQL migration run successfully
- [ ] App restarted
- [ ] Test admin created with limited permissions
- [ ] Test admin can only see assigned pages
- [ ] Sidebar filters correctly
- [ ] Restricted pages show "Access Denied"
- [ ] Super Admin has full access

---

**You're all set!** 🎉

Your RBAC system is now active. Super Admins can control exactly what each admin can access.
