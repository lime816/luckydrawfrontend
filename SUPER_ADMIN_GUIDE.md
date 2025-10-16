# Super Admin Implementation Guide

## Overview

This guide explains how the Super Admin system works in the Lucky Draw application. The Super Admin is authenticated through Supabase Authentication and automatically synced to the `admins` table, while remaining hidden from other administrators.

## Architecture

### 1. **Dual Authentication System**
- **Super Admin**: Authenticated via Supabase Auth (email/password)
- **Regular Admins**: Authenticated via `admins` table

### 2. **Database Schema**

The `admins` table has been extended with:
```sql
is_super_admin BOOLEAN DEFAULT FALSE
supabase_user_id UUID UNIQUE
```

### 3. **Key Features**

✅ **Super Admin Authentication**
- Authenticates through Supabase Auth
- Automatically synced to `admins` table on login
- Full permissions to all features

✅ **Visibility Control**
- Super Admin is **hidden** from all admin lists for regular admins
- Only Super Admin can see their own record
- Regular admins cannot view, edit, or delete Super Admin

✅ **Access Control**
- `SuperAdminGuard` component protects Super Admin-only routes
- Automatic redirect with "Access Denied" screen for unauthorized access
- 3-second countdown before redirect

✅ **Activity Logging**
- Super Admin activities are logged but hidden from regular admins
- Full audit trail maintained for security

## Setup Instructions

### Step 1: Run Database Migration

Execute the SQL migration file in your Supabase SQL Editor:

```bash
# File: supabase-super-admin-setup.sql
```

This will:
- Add `is_super_admin` and `supabase_user_id` columns
- Create auto-sync trigger for Supabase Auth users
- Set up Row Level Security (RLS) policies
- Create helper functions

### Step 2: Create Super Admin User

1. **Go to Supabase Dashboard** → Authentication → Users
2. **Create a new user** with email and password
3. **Update user metadata** after creation:

```json
{
  "is_super_admin": true,
  "name": "Super Admin"
}
```

Or use SQL:
```sql
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"is_super_admin": true, "name": "Super Admin"}'::jsonb
WHERE email = 'superadmin@example.com';
```

### Step 3: Verify Setup

```sql
-- Check if Super Admin was synced to admins table
SELECT admin_id, name, email, role, is_super_admin, supabase_user_id 
FROM admins 
WHERE is_super_admin = true;
```

## Usage

### Login as Super Admin

1. Navigate to `/login`
2. Enter Super Admin credentials (from Supabase Auth)
3. System will:
   - Authenticate via Supabase Auth
   - Sync user data to `admins` table
   - Grant full permissions
   - Redirect to dashboard

### Creating Regular Admins

Super Admin can create regular admins through the Admin Management page:

1. Go to **Admin Management**
2. Click **Add Admin**
3. Fill in details:
   - Name
   - Email
   - Password
   - Role (Admin/Moderator)
   - Permissions
4. Click **Create**

**Note**: Maximum 5 regular admins can be created (excluding Super Admin)

### Protecting Super Admin Routes

Use the `SuperAdminGuard` component to protect routes:

```tsx
import { SuperAdminGuard } from '../components/auth/SuperAdminGuard';

function SuperAdminDashboard() {
  return (
    <SuperAdminGuard>
      <div>Super Admin Only Content</div>
    </SuperAdminGuard>
  );
}
```

Options:
```tsx
<SuperAdminGuard 
  redirectTo="/dashboard"        // Where to redirect non-super admins
  showAccessDenied={true}         // Show access denied screen (3s)
>
  {children}
</SuperAdminGuard>
```

## API Reference

### AdminService Methods

#### `getAllAdmins(includeSuperAdmin?: boolean)`
Get all admins, excluding Super Admin by default.

```typescript
// Get only regular admins (default)
const admins = await AdminService.getAllAdmins();

// Include Super Admin (Super Admin only)
const allAdmins = await AdminService.getAllAdmins(true);
```

#### `getSuperAdmin()`
Get Super Admin details (Super Admin only).

```typescript
const superAdmin = await AdminService.getSuperAdmin();
```

#### `isSuperAdmin(adminId: number)`
Check if an admin is the Super Admin.

```typescript
const isSuperAdmin = await AdminService.isSuperAdmin(adminId);
```

#### `syncSuperAdminFromAuth(supabaseUserId, email, name)`
Sync Super Admin from Supabase Auth to admins table.

```typescript
await AdminService.syncSuperAdminFromAuth(
  user.id,
  user.email,
  user.name
);
```

### AuthService Methods

The `authenticateFromSupabaseAuth()` method automatically syncs Super Admin on login.

## Security Features

### Row Level Security (RLS)

1. **Super Admin Full Access**
   ```sql
   -- Super Admin can see and modify all admins
   CREATE POLICY "Super Admin full access" ON admins
     FOR ALL USING (is_current_user_super_admin());
   ```

2. **Hide Super Admin from Regular Admins**
   ```sql
   -- Regular admins can only see non-super admins
   CREATE POLICY "Admins can view non-super admins" ON admins
     FOR SELECT USING (is_super_admin = false);
   ```

3. **Activity Log Protection**
   ```sql
   -- Super Admin activities hidden from regular admins
   CREATE POLICY "Admins can view activity logs" ON admin_activity_log
     FOR SELECT USING (
       is_current_user_super_admin() OR
       admin_id IN (SELECT admin_id FROM admins WHERE is_super_admin = false)
     );
   ```

### Access Control

- **Route Protection**: `SuperAdminGuard` component
- **API Protection**: RLS policies at database level
- **UI Protection**: Super Admin hidden from lists and dropdowns

## Best Practices

### 1. **Never Expose Super Admin Credentials**
- Use strong, unique password
- Enable 2FA in Supabase Auth
- Store credentials securely (password manager)

### 2. **Limit Super Admin Actions**
- Only use Super Admin account for:
  - Creating/managing other admins
  - Accessing sensitive settings
  - Emergency interventions
- Use regular admin accounts for day-to-day operations

### 3. **Monitor Super Admin Activity**
- Regularly review Super Admin activity logs
- Set up alerts for suspicious activities
- Maintain audit trail

### 4. **Backup Super Admin Access**
- Keep backup Super Admin credentials secure
- Document recovery procedures
- Test recovery process periodically

## Troubleshooting

### Super Admin Not Syncing

**Problem**: Super Admin user created in Supabase Auth but not appearing in admins table.

**Solution**:
1. Check user metadata has `is_super_admin: true`
2. Verify trigger is enabled:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created_sync_admin';
   ```
3. Manually trigger sync:
   ```sql
   SELECT sync_super_admin_to_admins();
   ```

### Super Admin Visible to Regular Admins

**Problem**: Regular admins can see Super Admin in lists.

**Solution**:
1. Verify RLS policies are enabled:
   ```sql
   SELECT tablename, policyname FROM pg_policies WHERE tablename = 'admins';
   ```
2. Check `is_super_admin` flag is set correctly:
   ```sql
   SELECT * FROM admins WHERE is_super_admin = true;
   ```

### Access Denied Loop

**Problem**: Super Admin gets "Access Denied" when accessing protected routes.

**Solution**:
1. Check user role in auth store:
   ```typescript
   const { user } = useAuthStore();
   console.log('User role:', user?.role); // Should be 'SUPER_ADMIN'
   ```
2. Verify authentication source:
   ```typescript
   // In AuthService response
   source: 'supabase_auth' // Should be this for Super Admin
   ```

## Migration from Existing System

If you have existing admins in the `admins` table:

1. **Identify current Super Admin**:
   ```sql
   SELECT * FROM admins WHERE role = 'SUPERADMIN';
   ```

2. **Create Supabase Auth user** for Super Admin

3. **Link existing admin to Supabase Auth**:
   ```sql
   UPDATE admins 
   SET 
     is_super_admin = true,
     supabase_user_id = 'uuid-from-supabase-auth'
   WHERE admin_id = <existing_super_admin_id>;
   ```

4. **Test login** with new Supabase Auth credentials

## Support

For issues or questions:
1. Check this guide first
2. Review Supabase Auth documentation
3. Check application logs for errors
4. Verify database policies and triggers

## Changelog

### v1.0.0 (Current)
- Initial Super Admin implementation
- Supabase Auth integration
- Automatic sync to admins table
- Visibility controls with RLS
- SuperAdminGuard component
- Access denied screen with auto-redirect
