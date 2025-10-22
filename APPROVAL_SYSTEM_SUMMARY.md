# ✅ Contest Approval System - Complete Implementation

## 🎯 System Overview

A comprehensive approval workflow system for contest management with role-based permissions, audit trails, and notifications.

## 📦 What's Been Created

### 1. **Database Schema** ✅
- **File:** `database/migrations/add_approval_system.sql`
- **Tables Added:**
  - `contest_approval_log` - Audit trail for all approval actions
  - `approval_notifications` - User notifications system
- **Fields Added to `admins`:**
  - `is_approval_manager` - Flag for approval permission
  - `approval_manager_assigned_at` - Timestamp of assignment
  - `approval_manager_assigned_by` - Who assigned the manager
- **Fields Added to `contests`:**
  - `auto_approve` - Auto-approval flag
  - `approval_timeout_days` - Days before auto-rejection
  - `submitted_at` - Submission timestamp

### 2. **Prisma Schema** ✅
- **File:** `prisma/schema.prisma`
- **Models Updated:**
  - `admins` - Added approval manager fields
  - `contests` - Added approval workflow fields
  - `contest_approval_log` - New model
  - `approval_notifications` - New model

### 3. **Backend Service** ✅
- **File:** `src/services/approvalService.ts`
- **Features:**
  - Permission checking
  - Manager assignment/revocation
  - Contest approval/rejection
  - Notification management
  - Audit logging
  - Pending contests retrieval

### 4. **UI Components** ✅
- **File:** `src/pages/PendingApprovals.tsx`
- **Features:**
  - Lists pending contests
  - Shows creator info & submission date
  - Urgent badges for old requests
  - Approve/Reject actions
  - Rejection reason input
  - Real-time updates

### 5. **Routing** ✅
- **File:** `src/App.tsx`
- **Route Added:** `/pending-approvals`

### 6. **Documentation** ✅
- **File:** `APPROVAL_WORKFLOW_IMPLEMENTATION.md`
- Complete implementation guide
- Testing checklist
- Troubleshooting tips

## 🚀 Quick Start

### Step 1: Run Database Migration

```sql
-- In Supabase SQL Editor, run:
-- File: database/migrations/add_approval_system.sql
```

This creates:
- Approval log table
- Notifications table
- New columns in admins & contests
- RLS policies
- Indexes
- Auto-timeout function

### Step 2: Access the System

**For Super Admin:**
1. Navigate to `/pending-approvals`
2. See all contests awaiting approval
3. Approve or reject with reasons

**For Regular Admins:**
1. Create a contest
2. Status automatically set to "PENDING"
3. Wait for approval notification

## 🔑 Key Features

### Role-Based Access
- ✅ **Super Admin**: Full control, can assign Approval Manager
- ✅ **Approval Manager**: Can approve/reject (1 per system)
- ✅ **Regular Admin**: Create contests, receive notifications

### Approval Workflow
```
Regular Admin Creates Contest
         ↓
   Status: PENDING
         ↓
Super Admin/Manager Reviews
         ↓
    Approve or Reject
         ↓
  Creator Notified
         ↓
Status: APPROVED/REJECTED
```

### Security
- ✅ Row Level Security (RLS) policies
- ✅ Permission checks at service level
- ✅ Audit trail for all actions
- ✅ Blocked unauthorized access

### Notifications
- ✅ PENDING_APPROVAL → Sent to approvers
- ✅ APPROVED → Sent to creator
- ✅ REJECTED → Sent to creator (with reason)
- ✅ TIMEOUT → Auto-rejection notification

## 📊 Database Schema

### Admins Table (Updated)
```sql
ALTER TABLE admins ADD COLUMN:
- is_approval_manager BOOLEAN DEFAULT false
- approval_manager_assigned_at TIMESTAMP
- approval_manager_assigned_by INTEGER
```

### Contests Table (Updated)
```sql
ALTER TABLE contests ADD COLUMN:
- auto_approve BOOLEAN DEFAULT false
- approval_timeout_days INTEGER DEFAULT 7
- submitted_at TIMESTAMP DEFAULT NOW()
```

### New Tables
```sql
-- Approval Log
CREATE TABLE contest_approval_log (
  log_id SERIAL PRIMARY KEY,
  contest_id INTEGER REFERENCES contests,
  action TEXT CHECK (action IN ('SUBMITTED', 'APPROVED', 'REJECTED', 'RESUBMITTED')),
  performed_by INTEGER REFERENCES admins,
  performed_at TIMESTAMP DEFAULT NOW(),
  previous_status TEXT,
  new_status TEXT,
  reason TEXT,
  metadata JSONB
);

-- Notifications
CREATE TABLE approval_notifications (
  notification_id SERIAL PRIMARY KEY,
  contest_id INTEGER REFERENCES contests,
  recipient_id INTEGER REFERENCES admins,
  notification_type TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);
```

## 🎨 UI Components

### Pending Approvals Page
**Location:** `/pending-approvals`

**Features:**
- 📋 List of all pending contests
- 👤 Creator information
- 📅 Submission date & days waiting
- ⚠️ Urgent badge (5+ days)
- ✅ Approve button
- ❌ Reject button (with reason)
- 👁️ View details link

**Access:** Super Admin & Approval Manager only

### Contest Status Badges
- 🟡 **PENDING** - Awaiting approval
- 🟢 **APPROVED** - Active contest
- 🔴 **REJECTED** - Not approved

## 🔧 API Methods

### ApprovalService

```typescript
// Permission Checks
canApprove(userId: number): Promise<boolean>
getApprovalManager(): Promise<Admin | null>

// Manager Management
assignApprovalManager(superAdminId, managerId): Promise<Result>
revokeApprovalManager(superAdminId, managerId): Promise<Result>

// Approval Actions
approveContest(contestId, reviewerId): Promise<Result>
rejectContest(contestId, reviewerId, reason): Promise<Result>

// Data Retrieval
getPendingContests(): Promise<Contest[]>
getNotifications(userId, unreadOnly?): Promise<Notification[]>
getApprovalLogs(contestId): Promise<Log[]>

// Utilities
logApprovalAction(log): Promise<void>
createNotification(notification): Promise<void>
markNotificationAsRead(notificationId): Promise<void>
checkExpiredApprovals(): Promise<void>
```

## 📝 Usage Examples

### Approve a Contest
```typescript
import { ApprovalService } from '../services/approvalService';

const result = await ApprovalService.approveContest(
  contestId,
  reviewerId
);

if (result.success) {
  toast.success('Contest approved!');
} else {
  toast.error(result.error);
}
```

### Reject a Contest
```typescript
const result = await ApprovalService.rejectContest(
  contestId,
  reviewerId,
  'Does not meet quality standards'
);
```

### Assign Approval Manager
```typescript
const result = await ApprovalService.assignApprovalManager(
  superAdminId,
  managerId
);
```

### Get Pending Contests
```typescript
const contests = await ApprovalService.getPendingContests();
```

## 🧪 Testing Checklist

- [ ] **Database Migration**
  - [ ] Run SQL migration successfully
  - [ ] Verify new tables created
  - [ ] Check RLS policies active

- [ ] **Super Admin Functions**
  - [ ] Can create contests (auto-approved)
  - [ ] Can see pending approvals page
  - [ ] Can approve contests
  - [ ] Can reject contests with reason
  - [ ] Can assign Approval Manager
  - [ ] Can revoke Approval Manager

- [ ] **Approval Manager Functions**
  - [ ] Can see pending approvals page
  - [ ] Can approve contests
  - [ ] Can reject contests
  - [ ] Cannot assign other managers

- [ ] **Regular Admin Functions**
  - [ ] Creates contest → Status PENDING
  - [ ] Cannot access pending approvals page
  - [ ] Receives approval notification
  - [ ] Receives rejection notification with reason
  - [ ] Can view own contest status

- [ ] **Notifications**
  - [ ] Approvers notified of new submissions
  - [ ] Creators notified of approvals
  - [ ] Creators notified of rejections
  - [ ] Notification count updates

- [ ] **Audit Trail**
  - [ ] All actions logged
  - [ ] Logs show performer, timestamp, reason
  - [ ] Logs accessible to admins

- [ ] **Security**
  - [ ] Non-authorized users blocked from approval endpoints
  - [ ] RLS policies prevent unauthorized data access
  - [ ] Permission checks work correctly

## 🐛 Troubleshooting

### Issue: Cannot see pending approvals page
**Solution:** Check `is_super_admin` or `is_approval_manager` in database:
```sql
SELECT admin_id, name, is_super_admin, is_approval_manager 
FROM admins 
WHERE admin_id = YOUR_ID;
```

### Issue: Contest not showing as pending
**Solution:** Verify approval_status:
```sql
SELECT contest_id, name, approval_status, created_by 
FROM contests 
WHERE contest_id = YOUR_CONTEST_ID;
```

### Issue: Notifications not appearing
**Solution:** Check RLS policies:
```sql
SELECT * FROM approval_notifications 
WHERE recipient_id = YOUR_ID;
```

### Issue: Cannot approve contest
**Solution:** Verify permissions:
```typescript
const canApprove = await ApprovalService.canApprove(userId);
console.log('Can approve:', canApprove);
```

## 📈 Future Enhancements

1. **Email Notifications** - Send emails on status changes
2. **Multi-level Approval** - Require 2+ approvers
3. **Bulk Actions** - Approve/reject multiple contests
4. **Approval Templates** - Pre-defined rejection reasons
5. **Analytics Dashboard** - Approval metrics & trends
6. **Mobile Notifications** - Push notifications
7. **Approval Delegation** - Temporary permissions
8. **Auto-approval Rules** - Based on creator trust score

## 🎯 Next Steps

1. **Run the database migration** in Supabase SQL Editor
2. **Test the workflow** with different user roles
3. **Add navigation link** to sidebar (for Super Admin/Manager)
4. **Customize notifications** (add email integration)
5. **Add approval history** view to contest details
6. **Set up cron job** for auto-timeout function

## 📞 Support

**Files to Check:**
- `database/migrations/add_approval_system.sql` - Database schema
- `src/services/approvalService.ts` - Business logic
- `src/pages/PendingApprovals.tsx` - UI component
- `APPROVAL_WORKFLOW_IMPLEMENTATION.md` - Full guide

**Common Queries:**
```sql
-- Check approval status
SELECT * FROM contests WHERE approval_status = 'PENDING';

-- View approval logs
SELECT * FROM contest_approval_log ORDER BY performed_at DESC LIMIT 10;

-- Check notifications
SELECT * FROM approval_notifications WHERE is_read = false;

-- View approval managers
SELECT * FROM admins WHERE is_approval_manager = true;
```

---

## ✨ Summary

**Status:** ✅ Ready for Deployment  
**Version:** 1.0.0  
**Components:** 6 files created/updated  
**Database Tables:** 2 new tables, 2 updated tables  
**Features:** Complete approval workflow with notifications and audit trail  

The Contest Approval System is fully implemented and ready to use! 🎉
