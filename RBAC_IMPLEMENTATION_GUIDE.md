## 🔐 Role-Based Access Control (RBAC) Implementation Guide

### Overview

This guide explains the complete RBAC system that allows Super Admins to control page-level permissions for each admin user.

---

## 📋 Table of Contents

1. [Database Setup](#database-setup)
2. [Permission Structure](#permission-structure)
3. [How It Works](#how-it-works)
4. [Implementation Steps](#implementation-steps)
5. [Usage Examples](#usage-examples)
6. [Testing](#testing)

---

## 🗄️ Database Setup

### Step 1: Run SQL Migration

Open Supabase SQL Editor and run:

```bash
# Use the provided SQL file
File: SETUP_RBAC.sql
```

This will:
- ✅ Add `permissions` JSONB column to `admins` table
- ✅ Add `custom_role` VARCHAR column
- ✅ Set default permissions for existing admins
- ✅ Create permission checking function

---

## 🔑 Permission Structure

### Permission Levels

Each page can have three permission levels:

| Level | Description | Example |
|-------|-------------|---------|
| `read` | Can view the page | View contests list |
| `write` | Can create new items | Create new contest |
| `update` | Can edit/delete items | Edit or delete contest |

### Available Pages

```typescript
{
  dashboard: ['read', 'write', 'update'],
  contests: ['read', 'write', 'update'],
  participants: ['read', 'write', 'update'],
  draw: ['read', 'write', 'update'],
  winners: ['read', 'write', 'update'],
  communication: ['read', 'write', 'update'],
  analytics: ['read', 'write', 'update'],
  settings: ['read', 'write', 'update'],
  user_management: ['read', 'write', 'update'],
  admin_management: ['read', 'write', 'update']
}
```

### Permission Examples

**Super Admin** (Full Access):
```json
{
  "dashboard": ["read", "write", "update"],
  "contests": ["read", "write", "update"],
  "participants": ["read", "write", "update"],
  ...all pages with all permissions
}
```

**Contest Manager** (Limited Access):
```json
{
  "dashboard": ["read"],
  "contests": ["read", "write", "update"],
  "participants": ["read", "write"],
  "draw": ["read"],
  "winners": ["read"],
  "communication": [],
  "analytics": [],
  "settings": [],
  "user_management": [],
  "admin_management": []
}
```

**Data Analyst** (Read-Only):
```json
{
  "dashboard": ["read"],
  "contests": ["read"],
  "participants": ["read"],
  "draw": [],
  "winners": ["read"],
  "communication": [],
  "analytics": ["read"],
  "settings": [],
  "user_management": [],
  "admin_management": []
}
```

---

## ⚙️ How It Works

### 1. Admin Creation with Permissions

When Super Admin creates a new admin in User Management:

```tsx
// User Management Page
<Input
  label="Role"
  value={adminForm.customRole}
  onChange={(e) => setAdminForm({ ...adminForm, customRole: e.target.value })}
  placeholder="e.g., Event Manager, Data Analyst"
/>

// Permission checkboxes for each page
{['dashboard', 'contests', 'participants', ...].map((page) => (
  <div key={page}>
    <label>
      <input type="checkbox" value="read" />
      Read
    </label>
    <label>
      <input type="checkbox" value="write" />
      Write
    </label>
    <label>
      <input type="checkbox" value="update" />
      Update
    </label>
  </div>
))}
```

### 2. Permissions Stored in Database

```sql
INSERT INTO admins (name, email, password_hash, role, custom_role, permissions)
VALUES (
  'John Doe',
  'john@example.com',
  'hashed_password',
  'ADMIN',
  'Contest Manager',
  '{"dashboard": ["read"], "contests": ["read", "write", "update"], ...}'::jsonb
);
```

### 3. Login Loads Permissions

When admin logs in:

```typescript
// authService.ts
const user: User = {
  id: admin.admin_id.toString(),
  email: admin.email,
  name: admin.name,
  role: userRole,
  permissions: admin.permissions, // ← Loaded from database
  customRole: admin.custom_role,
  ...
};
```

### 4. Permissions Checked Throughout App

```typescript
// usePermissions hook
const { hasPageAccess, canWrite, canUpdate } = usePermissions();

// Check if user can access a page
if (hasPageAccess('contests')) {
  // Show contests page
}

// Check if user can create
if (canWrite('contests')) {
  // Show "Create Contest" button
}
```

---

## 🚀 Implementation Steps

### Step 1: Database Setup (5 minutes)

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run `SETUP_RBAC.sql`
4. Wait 2-3 minutes for cache refresh

### Step 2: Restart Application (1 minute)

```bash
npm start
```

### Step 3: Test Permission System (10 minutes)

See [Testing](#testing) section below.

---

## 💻 Usage Examples

### Example 1: Protect a Route

```tsx
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// In App.tsx or Routes
<Route
  path="/contests"
  element={
    <ProtectedRoute page="contests" requirePermission="read">
      <ContestsPage />
    </ProtectedRoute>
  }
/>
```

### Example 2: Conditional Button Rendering

```tsx
import { CanWrite } from '../components/auth/PermissionGate';

function ContestsPage() {
  return (
    <div>
      <h1>Contests</h1>
      
      {/* Only show if user has write permission */}
      <CanWrite page="contests">
        <button>Create New Contest</button>
      </CanWrite>
    </div>
  );
}
```

### Example 3: Check Permission in Component Logic

```tsx
import { usePermissions } from '../hooks/usePermissions';

function ContestCard({ contest }) {
  const { canUpdate } = usePermissions();

  const handleDelete = () => {
    if (!canUpdate('contests')) {
      alert('You don't have permission to delete contests');
      return;
    }
    // Delete logic
  };

  return (
    <div>
      <h3>{contest.name}</h3>
      {canUpdate('contests') && (
        <button onClick={handleDelete}>Delete</button>
      )}
    </div>
  );
}
```

### Example 4: Filter Navigation Menu

```tsx
// Sidebar.tsx (Already implemented)
const { hasPageAccess } = usePermissions();

const navItems = allNavItems.filter((item) => 
  hasPageAccess(item.page)
);

// Only shows menu items user has access to
```

### Example 5: Permission Gate Component

```tsx
import { PermissionGate } from '../components/auth/PermissionGate';

<PermissionGate page="settings" permission="update">
  <button>Save Settings</button>
</PermissionGate>
```

### Example 6: Super Admin Only

```tsx
import { SuperAdminOnly } from '../components/auth/PermissionGate';

<SuperAdminOnly>
  <button>Delete All Data</button>
</SuperAdminOnly>
```

---

## 🧪 Testing

### Test Case 1: Create Admin with Custom Permissions

1. **Login as Super Admin**
2. **Go to User Management** (`/admin-management`)
3. **Click "Add User"**
4. **Fill in:**
   ```
   Name: Test Manager
   Email: manager@test.com
   Password: test123
   Role: Contest Manager
   ```
5. **Set Permissions:**
   - Dashboard: ✅ Read
   - Contests: ✅ Read, ✅ Write, ✅ Update
   - Participants: ✅ Read, ✅ Write
   - Draw: ✅ Read
   - Winners: ✅ Read
   - Others: ❌ (No access)
6. **Click "Create Admin"**

### Test Case 2: Login as New Admin

1. **Logout from Super Admin**
2. **Login with:**
   ```
   Email: manager@test.com
   Password: test123
   ```
3. **Verify:**
   - ✅ Can see Dashboard (read-only)
   - ✅ Can see Contests (full access)
   - ✅ Can see Participants (read + write)
   - ✅ Can see Draw (read-only)
   - ✅ Can see Winners (read-only)
   - ❌ Cannot see Communication
   - ❌ Cannot see Analytics
   - ❌ Cannot see Settings
   - ❌ Cannot see User Management

### Test Case 3: Verify Sidebar Menu

**Expected Sidebar for Contest Manager:**
```
✅ Dashboard
✅ Contests
✅ Participants
✅ Lucky Draw
✅ Winners
```

**NOT shown:**
```
❌ Communication
❌ Analytics
❌ User Management
❌ Settings
```

### Test Case 4: Test Permission Levels

**In Contests Page:**
1. ✅ Can view contests list (read)
2. ✅ Can click "Create Contest" button (write)
3. ✅ Can edit contests (update)
4. ✅ Can delete contests (update)

**In Dashboard:**
1. ✅ Can view dashboard (read)
2. ❌ Cannot see "Create" buttons (no write)
3. ❌ Cannot edit widgets (no update)

### Test Case 5: Direct URL Access

1. **Try accessing restricted page directly:**
   ```
   http://localhost:3000/settings
   ```
2. **Expected Result:**
   - Shows "Access Denied" page
   - Cannot access the page
   - "Go Back" button works

---

## 📊 Permission Matrix

| Role | Dashboard | Contests | Participants | Draw | Winners | Communication | Analytics | Settings | User Mgmt |
|------|-----------|----------|--------------|------|---------|---------------|-----------|----------|-----------|
| **Super Admin** | RWU | RWU | RWU | RWU | RWU | RWU | RWU | RWU | RWU |
| **Admin** | R | RWU | RW | RW | R | RW | R | - | - |
| **Moderator** | R | R | RW | R | R | R | - | - | - |
| **Contest Manager** | R | RWU | RW | R | R | - | - | - | - |
| **Data Analyst** | R | R | R | - | R | - | R | - | - |

**Legend:**
- R = Read
- W = Write
- U = Update
- \- = No Access

---

## 🔧 Troubleshooting

### Issue 1: Permissions Not Working

**Symptoms:**
- All pages visible regardless of permissions
- Permission checks always return true

**Solutions:**
1. Check database has `permissions` column:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'admins' AND column_name = 'permissions';
   ```
2. Verify permissions are loaded in user object:
   ```javascript
   console.log(localStorage.getItem('auth-storage'));
   // Should show permissions object
   ```
3. Restart application after database changes

### Issue 2: Access Denied for Super Admin

**Cause:** Permissions not set for Super Admin

**Solution:**
```sql
UPDATE admins 
SET permissions = jsonb_build_object(
  'dashboard', ARRAY['read', 'write', 'update'],
  'contests', ARRAY['read', 'write', 'update'],
  ...
)
WHERE role = 'SUPERADMIN';
```

### Issue 3: Sidebar Shows All Items

**Cause:** Permission filtering not working

**Check:**
1. `usePermissions` hook is imported correctly
2. User is logged in with permissions
3. Browser cache cleared

---

## 📝 API Reference

### usePermissions Hook

```typescript
const {
  permissions,          // Full permissions object
  hasPageAccess,        // Check if user can access page
  hasPermission,        // Check specific permission level
  canRead,             // Check read permission
  canWrite,            // Check write permission
  canUpdate,           // Check update permission
  getAccessiblePages,  // Get list of accessible pages
  isSuperAdmin,        // Check if Super Admin
  isAdmin,             // Check if Admin
  isModerator,         // Check if Moderator
} = usePermissions();
```

### ProtectedRoute Component

```typescript
<ProtectedRoute 
  page="contests"              // Required: page key
  requirePermission="write"    // Optional: permission level
>
  <YourComponent />
</ProtectedRoute>
```

### PermissionGate Component

```typescript
<PermissionGate 
  page="contests"              // Required: page key
  permission="write"           // Optional: permission level
  fallback={<div>No access</div>}  // Optional: fallback UI
>
  <button>Create</button>
</PermissionGate>
```

---

## ✅ Summary

**What You Get:**

1. ✅ **Page-Level Access Control** - Control which pages each admin can see
2. ✅ **Action-Level Permissions** - Control read/write/update permissions
3. ✅ **Dynamic Navigation** - Sidebar automatically filters based on permissions
4. ✅ **Route Protection** - Unauthorized pages show access denied
5. ✅ **Flexible Permission UI** - Easy checkboxes for Super Admin to assign permissions
6. ✅ **Custom Roles** - Define custom role names (Contest Manager, Data Analyst, etc.)
7. ✅ **Database-Driven** - All permissions stored in database
8. ✅ **Type-Safe** - Full TypeScript support

**Next Steps:**

1. Run `SETUP_RBAC.sql` in Supabase
2. Restart your application
3. Test creating admins with different permissions
4. Verify navigation and access control works

**Need Help?**

Check the troubleshooting section or review the code examples above.

---

**Last Updated:** October 15, 2025
**Version:** 1.0.0
