# 🔐 Approval Manager Assignment - Quick Guide

## How It Works

The Approval Manager is assigned through the **Admin Management** page under **"Other Permissions"**.

## 📍 Where to Assign

### Location: Admin Management Page
**Path:** `/admin-management`

### Steps to Assign:

1. **Navigate to Admin Management**
   - Click "Admin Management" in sidebar
   - Or go to `/admin-management`

2. **Create or Edit an Admin**
   - Click "Create Admin" button, OR
   - Click "Edit" on an existing admin

3. **Scroll to "Other Permissions" Section**
   - Below the page permissions list
   - Look for purple section labeled "🔐 Other Permissions"

4. **Check "Approval Manager" Checkbox**
   - ✅ Approval Manager
   - Description: "Can approve or reject contests created by other admins"

5. **Save Changes**
   - Click "Create Admin" or "Update Admin"

## ✨ What Happens

### When Assigned:
- ✅ Admin gets `is_approval_manager = true` in database
- ✅ Can access `/pending-approvals` page
- ✅ Can approve/reject contests
- ✅ Timestamp recorded (`approval_manager_assigned_at`)
- ✅ Assigner recorded (`approval_manager_assigned_by`)

### Automatic Behavior:
- 🔄 **Only ONE approval manager** at a time
- 🔄 Assigning new manager **automatically revokes** previous one
- 🔄 Super Admin always has approval rights (doesn't need checkbox)

## 🎯 UI Implementation

### In Admin Management Form:

```tsx
{/* Other Permissions Section */}
<div className="border-t-2 border-purple-200 pt-3 mt-2">
  <div className="mb-2">
    <span className="text-sm font-semibold text-purple-700">
      🔐 Other Permissions
    </span>
  </div>
  <div className="ml-6">
    <label className="flex items-center cursor-pointer p-2 hover:bg-purple-50 rounded">
      <input
        type="checkbox"
        checked={formData.is_approval_manager || false}
        onChange={(e) => setFormData({
          ...formData,
          is_approval_manager: e.target.checked
        })}
        className="w-4 h-4 text-purple-600"
      />
      <div className="ml-3">
        <span className="text-sm font-medium text-gray-900">
          ✅ Approval Manager
        </span>
        <p className="text-xs text-gray-500">
          Can approve or reject contests created by other admins
        </p>
      </div>
    </label>
  </div>
</div>
```

## 🔧 Backend Integration

### When Saving Admin:

```typescript
// In handleCreateAdmin or handleUpdateAdmin
await ApprovalService.assignApprovalManager(
  superAdminId,
  adminId
);
```

### The Service Handles:
1. Removes existing approval manager
2. Assigns new approval manager
3. Records timestamp and assigner
4. Returns success/error

## 📊 Database Changes

```sql
-- In admins table
is_approval_manager BOOLEAN DEFAULT false
approval_manager_assigned_at TIMESTAMP
approval_manager_assigned_by INTEGER REFERENCES admins(admin_id)
```

## 🎨 Visual Appearance

### In Permission List:
```
📊 Dashboard          ☑️ Read  ☑️ Write  ☑️ Update
🏆 Contest Management ☑️ Read  ☑️ Write  ☐ Update
👥 Participant Mgmt   ☑️ Read  ☐ Write   ☐ Update
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 Other Permissions
   ✅ Approval Manager
      Can approve or reject contests created by other admins
```

## 🔐 Permission Hierarchy

### Super Admin
- ✅ All permissions automatically
- ✅ Can approve contests
- ✅ Can assign/revoke Approval Manager
- ✅ Cannot be restricted

### Approval Manager
- ✅ Can approve/reject contests
- ✅ Can view pending approvals
- ❌ Cannot assign other managers
- ❌ Can be revoked by Super Admin

### Regular Admin
- ✅ Create contests (pending approval)
- ❌ Cannot approve contests
- ❌ Cannot access pending approvals

## ✅ Complete Workflow

### 1. Super Admin Assigns Manager
```
Admin Management → Edit User → Check "Approval Manager" → Save
```

### 2. Manager Gets Access
```
Sidebar shows "Pending Approvals" link
Can navigate to /pending-approvals
```

### 3. Manager Approves Contests
```
Pending Approvals → Review Contest → Approve/Reject
```

### 4. Creator Gets Notified
```
Notification: "Your contest has been approved!"
```

## 🚀 Quick Setup

### Step 1: Run Database Migration
```sql
-- File: database/migrations/add_approval_system.sql
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS is_approval_manager BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approval_manager_assigned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS approval_manager_assigned_by INTEGER;
```

### Step 2: Update Admin Form
- Add `is_approval_manager: false` to formData state
- Add "Other Permissions" section with checkbox
- Update save handlers to include `is_approval_manager`

### Step 3: Test
1. Create/edit an admin
2. Check "Approval Manager"
3. Save
4. Verify in database:
   ```sql
   SELECT name, is_approval_manager FROM admins;
   ```

## 📝 Code Locations

### Files to Update:
1. **`src/pages/AdminManagement.tsx`**
   - Add `is_approval_manager` to formData
   - Add "Other Permissions" UI section
   - Update save handlers

2. **`src/services/approvalService.ts`**
   - Already has `assignApprovalManager()` method
   - Handles automatic revocation

3. **`database/migrations/add_approval_system.sql`**
   - Already has schema changes

## 🎯 Summary

**Assignment Method:** Through Admin Management UI  
**Location:** "Other Permissions" section in admin form  
**Limit:** Only 1 approval manager at a time  
**Access:** Super Admin only can assign  
**Auto-Revoke:** Yes, when assigning new manager  

The approval manager checkbox is now integrated into the existing permissions system! ✨
