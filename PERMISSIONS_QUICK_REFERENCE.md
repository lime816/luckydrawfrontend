# Permission System - Quick Reference Card

## 🎯 Permission Types

| Permission | Description | Use Case |
|------------|-------------|----------|
| **Read** | View data only | Auditors, Viewers |
| **Write** | Add new data | Data Entry |
| **Update** | Edit existing data | Editors, Moderators |

## 🚀 Quick Setup (3 Steps)

```typescript
// 1. Wrap app with PermissionProvider (App.tsx)
<PermissionProvider>
  <YourApp />
</PermissionProvider>

// 2. Set current admin after login
const { setCurrentAdmin } = usePermissions();
setCurrentAdmin(loggedInAdmin);

// 3. Use in components
<PermissionGuard permission="write">
  <AddButton />
</PermissionGuard>
```

## 📦 Import Statements

```typescript
// Context & Hook
import { usePermissions } from './contexts/PermissionContext';

// Components
import { PermissionGuard, DisableIfNoPermission } from './components/PermissionGuard';

// Service
import { AdminService } from './services/adminService';
```

## 🎨 Common Patterns

### Pattern 1: Hide Button
```typescript
<PermissionGuard permission="write" hideOnDenied>
  <Button>Add New</Button>
</PermissionGuard>
```

### Pattern 2: Show Message
```typescript
<PermissionGuard 
  permission="update"
  fallback={<p>Contact admin for access</p>}
>
  <EditForm />
</PermissionGuard>
```

### Pattern 3: Disable Input
```typescript
<DisableIfNoPermission permission="update">
  {(disabled) => (
    <input disabled={disabled} />
  )}
</DisableIfNoPermission>
```

### Pattern 4: Conditional Logic
```typescript
const { canWrite, canUpdate } = usePermissions();

if (!canUpdate) {
  toast.error('No permission');
  return;
}
```

### Pattern 5: Protect Route
```typescript
const Protected = withPermission(MyPage, 'write');
<Route path="/add" element={<Protected />} />
```

## 🔧 AdminService Methods

```typescript
// Create admin with permissions
await AdminService.createAdmin({
  name: 'John Doe',
  email: 'john@example.com',
  password_hash: 'hashed',
  role: 'ADMIN',
  custom_role: 'Event Manager',
  permission_read: true,
  permission_write: true,
  permission_update: false,
  two_factor: false,
});

// Update permissions
await AdminService.updateAdminPermissions(adminId, {
  read: true,
  write: true,
  update: false,
});

// Get permissions
const perms = await AdminService.getAdminPermissions(adminId);

// Check permission
const canWrite = await AdminService.hasPermission(adminId, 'write');
```

## 🎣 usePermissions Hook

```typescript
const {
  currentAdmin,      // Admin object
  permissions,       // { read, write, update }
  isSuperAdmin,      // boolean
  canRead,           // boolean
  canWrite,          // boolean
  canUpdate,         // boolean
  isLoading,         // boolean
  refreshPermissions,// () => Promise<void>
  setCurrentAdmin,   // (admin) => void
} = usePermissions();
```

## 💾 Database Fields

```sql
-- New columns in admins table
custom_role VARCHAR(150)
permission_read BOOLEAN DEFAULT TRUE
permission_write BOOLEAN DEFAULT FALSE
permission_update BOOLEAN DEFAULT FALSE
```

## 🎭 Permission Combinations

| Role | Read | Write | Update | Description |
|------|------|-------|--------|-------------|
| Viewer | ✓ | ✗ | ✗ | View only |
| Data Entry | ✓ | ✓ | ✗ | Add new records |
| Editor | ✓ | ✗ | ✓ | Edit existing |
| Full Access | ✓ | ✓ | ✓ | All operations |
| Super Admin | ✓ | ✓ | ✓ | Automatic |

## ⚡ One-Liners

```typescript
// Check if can write
if (canWrite) { /* do something */ }

// Hide if no permission
{canUpdate && <EditButton />}

// Disable if no permission
<button disabled={!canWrite}>Add</button>

// Show loading
{isLoading && <Spinner />}

// Check super admin
{isSuperAdmin && <AdminPanel />}
```

## 🔒 Security Checklist

- [ ] Run migration: `supabase-migration-permissions.sql`
- [ ] Wrap app with `PermissionProvider`
- [ ] Set `currentAdmin` after login
- [ ] Add `PermissionGuard` to protected UI
- [ ] Implement backend validation
- [ ] Hash passwords properly
- [ ] Test all permission combinations
- [ ] Log permission changes

## 📁 Key Files

```
src/
├── contexts/PermissionContext.tsx      # Context & Hook
├── components/PermissionGuard.tsx      # Guard Components
├── services/adminService.ts            # Admin Service
├── pages/
│   ├── AdminManagement.tsx             # Admin UI (Updated)
│   ├── Users.tsx                       # Users UI (Updated)
│   └── ParticipantsWithPermissions.tsx # Example
└── ...

supabase-migration-permissions.sql      # Migration
PERMISSIONS_GUIDE.md                    # Full Guide
IMPLEMENTATION_SUMMARY.md               # Summary
```

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Permissions not working | Check `PermissionProvider` wraps app |
| All permissions false | Call `setCurrentAdmin()` after login |
| Database errors | Run migration script |
| TypeScript errors | Restart TS server |

## 📞 Need Help?

1. Read: `PERMISSIONS_GUIDE.md`
2. Check: `ParticipantsWithPermissions.tsx`
3. Review: `IMPLEMENTATION_SUMMARY.md`

---

**Quick Start**: Run migration → Wrap app → Set admin → Use guards
