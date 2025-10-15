# Admin Permissions System Guide

## Overview

This Lucky Draw application now includes a comprehensive permission management system that allows Super Admins to control what regular admins can do within the system.

## Permission Types

The system supports three granular permission levels:

### 1. **Read Permission**
- **Description**: Admin can view data but cannot input or edit any fields
- **Use Case**: For auditors, viewers, or report generators who only need to see data
- **Database Field**: `permission_read`

### 2. **Write Permission**
- **Description**: Admin can input new data but cannot modify existing entries
- **Use Case**: For data entry personnel who should only add new records
- **Database Field**: `permission_write`

### 3. **Update Permission**
- **Description**: Admin can edit or update existing data but cannot add new entries
- **Use Case**: For editors or moderators who need to correct or update existing information
- **Database Field**: `permission_update`

**Note**: Super Admins automatically have all permissions and bypass all permission checks.

## Database Schema

### Migration

Run the migration SQL file to add permission fields to your existing database:

```bash
# Execute in Supabase SQL Editor
supabase-migration-permissions.sql
```

### Schema Changes

The `admins` table now includes:
- `custom_role` VARCHAR(150) - Custom role name (e.g., "Event Manager", "Data Analyst")
- `permission_read` BOOLEAN - Read permission flag
- `permission_write` BOOLEAN - Write permission flag
- `permission_update` BOOLEAN - Update permission flag

## Creating Admins with Permissions

### Via Admin Management UI

1. Navigate to **User Management** page (`/admin-management`)
2. Click **Add Admin** button
3. Fill in the form:
   - **Name**: Admin's full name
   - **Email**: Admin's email address
   - **Password**: Secure password
   - **Role**: Select from SUPERADMIN, ADMIN, or MODERATOR
   - **Custom Role**: (Optional) Define a custom role like "Event Manager"
   - **Permissions**: Check the appropriate boxes:
     - ☑️ Read - View data
     - ☑️ Write - Add new data
     - ☑️ Update - Edit existing data
   - **2FA**: Enable two-factor authentication (optional)
4. Click **Create Admin**

### Programmatically

```typescript
import { AdminService } from './services/adminService';

// Create an admin with specific permissions
await AdminService.createAdmin({
  name: 'John Doe',
  email: 'john@example.com',
  password_hash: 'hashed_password', // Hash in production!
  role: 'ADMIN',
  custom_role: 'Event Manager',
  permission_read: true,
  permission_write: true,
  permission_update: false,
  two_factor: false,
});
```

## Using Permissions in Your Code

### 1. Permission Context

Wrap your app with the `PermissionProvider`:

```typescript
import { PermissionProvider } from './contexts/PermissionContext';

function App() {
  return (
    <PermissionProvider>
      {/* Your app components */}
    </PermissionProvider>
  );
}
```

### 2. usePermissions Hook

Access permission state in any component:

```typescript
import { usePermissions } from './contexts/PermissionContext';

function MyComponent() {
  const {
    currentAdmin,      // Current admin object
    permissions,       // { read, write, update }
    isSuperAdmin,      // Boolean
    canRead,           // Boolean
    canWrite,          // Boolean
    canUpdate,         // Boolean
    isLoading,         // Boolean
    refreshPermissions // Function to reload permissions
  } = usePermissions();

  return (
    <div>
      {canWrite && <button>Add New Entry</button>}
      {canUpdate && <button>Edit Entry</button>}
    </div>
  );
}
```

### 3. PermissionGuard Component

Conditionally render content based on permissions:

```typescript
import { PermissionGuard } from './components/PermissionGuard';

function ParticipantsPage() {
  return (
    <div>
      {/* Only show to users with write permission */}
      <PermissionGuard permission="write">
        <button>Add Participant</button>
      </PermissionGuard>

      {/* Only show to users with update permission */}
      <PermissionGuard permission="update">
        <button>Edit Participant</button>
      </PermissionGuard>

      {/* Hide completely if no permission */}
      <PermissionGuard permission="write" hideOnDenied>
        <ImportButton />
      </PermissionGuard>

      {/* Custom fallback message */}
      <PermissionGuard 
        permission="update"
        fallback={<p>Contact admin for edit access</p>}
      >
        <EditForm />
      </PermissionGuard>
    </div>
  );
}
```

### 4. DisableIfNoPermission Component

Disable form inputs based on permissions:

```typescript
import { DisableIfNoPermission } from './components/PermissionGuard';

function EditForm() {
  return (
    <form>
      <DisableIfNoPermission permission="update">
        {(disabled) => (
          <input
            type="text"
            disabled={disabled}
            placeholder="Participant Name"
          />
        )}
      </DisableIfNoPermission>

      <DisableIfNoPermission permission="update">
        {(disabled) => (
          <button disabled={disabled}>
            Save Changes
          </button>
        )}
      </DisableIfNoPermission>
    </form>
  );
}
```

### 5. Higher-Order Component (HOC)

Protect entire routes:

```typescript
import { withPermission } from './contexts/PermissionContext';

const ProtectedComponent = withPermission(
  MyComponent,
  'write' // Required permission
);

// Use in routes
<Route path="/add-contest" element={<ProtectedComponent />} />
```

## AdminService Methods

### Check Permissions

```typescript
import { AdminService } from './services/adminService';

// Check if admin has specific permission
const hasWrite = await AdminService.hasPermission(adminId, 'write');

// Get all permissions for an admin
const permissions = await AdminService.getAdminPermissions(adminId);
// Returns: { read: boolean, write: boolean, update: boolean }

// Update admin permissions
await AdminService.updateAdminPermissions(adminId, {
  read: true,
  write: true,
  update: false,
});
```

## Best Practices

### 1. **Always Check Permissions on Backend**
Frontend permission checks are for UX only. Always validate permissions on your backend/API.

### 2. **Use Descriptive Custom Roles**
Instead of generic roles, use descriptive names:
- ✅ "Event Coordinator"
- ✅ "Data Entry Specialist"
- ✅ "Contest Moderator"
- ❌ "User1"
- ❌ "Admin2"

### 3. **Combine Permissions Logically**
- **Read-only users**: Only `read` permission
- **Data entry**: `read` + `write` permissions
- **Editors**: `read` + `update` permissions
- **Full access**: `read` + `write` + `update` permissions

### 4. **Super Admin Override**
Super Admins bypass all permission checks. Use this role sparingly.

### 5. **Permission Granularity**
Apply permissions at the component level for fine-grained control:

```typescript
// Good: Granular control
<PermissionGuard permission="write">
  <AddButton />
</PermissionGuard>
<PermissionGuard permission="update">
  <EditButton />
</PermissionGuard>

// Less ideal: All-or-nothing
<PermissionGuard permission="write">
  <AddButton />
  <EditButton />  {/* Should require 'update' */}
</PermissionGuard>
```

## Example Use Cases

### Use Case 1: Event Manager
**Custom Role**: "Event Manager"
**Permissions**: Read + Write + Update
**Can do**: View all data, create contests, edit contest details
**Cannot do**: Delete admins, change system settings

### Use Case 2: Data Entry Clerk
**Custom Role**: "Data Entry Clerk"
**Permissions**: Read + Write
**Can do**: View participants, add new participants
**Cannot do**: Edit existing participants, delete records

### Use Case 3: Auditor
**Custom Role**: "Auditor"
**Permissions**: Read only
**Can do**: View all data, generate reports
**Cannot do**: Add, edit, or delete any data

### Use Case 4: Contest Moderator
**Custom Role**: "Contest Moderator"
**Permissions**: Read + Update
**Can do**: View contests, edit contest status, update winners
**Cannot do**: Create new contests, add participants

## Troubleshooting

### Permissions Not Working?

1. **Check if PermissionProvider is wrapping your app**
   ```typescript
   // App.tsx
   <PermissionProvider>
     <YourApp />
   </PermissionProvider>
   ```

2. **Verify currentAdmin is set**
   ```typescript
   const { currentAdmin, setCurrentAdmin } = usePermissions();
   
   // After login, set the current admin
   setCurrentAdmin(loggedInAdmin);
   ```

3. **Check database values**
   ```sql
   SELECT name, permission_read, permission_write, permission_update 
   FROM admins 
   WHERE email = 'admin@example.com';
   ```

4. **Refresh permissions after updates**
   ```typescript
   const { refreshPermissions } = usePermissions();
   await refreshPermissions();
   ```

## Security Considerations

1. **Never trust frontend checks alone** - Always validate on backend
2. **Hash passwords properly** - Use bcrypt or similar
3. **Implement session management** - Track admin sessions
4. **Log permission changes** - Use `admin_activity_log` table
5. **Regular audits** - Review admin permissions periodically
6. **Principle of least privilege** - Grant minimum required permissions

## API Integration

When making API calls, include permission checks:

```typescript
// Backend API endpoint example
app.post('/api/participants', async (req, res) => {
  const adminId = req.user.id;
  
  // Check if admin has write permission
  const hasPermission = await AdminService.hasPermission(adminId, 'write');
  
  if (!hasPermission) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  
  // Proceed with creating participant
  // ...
});
```

## Migration Checklist

- [ ] Run `supabase-migration-permissions.sql` in Supabase SQL Editor
- [ ] Update existing admins with appropriate permissions
- [ ] Wrap app with `PermissionProvider`
- [ ] Set `currentAdmin` after login
- [ ] Add `PermissionGuard` components to protected UI elements
- [ ] Implement backend permission validation
- [ ] Test all permission combinations
- [ ] Document custom roles for your team

## Support

For questions or issues with the permission system, please refer to:
- AdminService: `src/services/adminService.ts`
- PermissionContext: `src/contexts/PermissionContext.tsx`
- PermissionGuard: `src/components/PermissionGuard.tsx`
- Database Schema: `supabase-schema.sql`
