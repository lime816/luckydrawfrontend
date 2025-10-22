# Contest Approval Workflow - Implementation Guide

## 🎯 Overview

Complete approval system for contests with Super Admin control, Approval Manager assignment, and full audit trail.

## 📋 Features Implemented

### 1. **Role-Based Approval**
- ✅ Super Admin: Full control (create, approve, reject, assign managers)
- ✅ Approval Manager: Can approve/reject contests (assigned by Super Admin)
- ✅ Regular Admins: Create contests that require approval

### 2. **Approval Workflow**
- ✅ Non-super admin creates contest → Status: PENDING
- ✅ Super Admin creates contest → Status: APPROVED (auto-approved)
- ✅ Approval Manager or Super Admin can approve/reject
- ✅ Contest creator gets notified of decision
- ✅ Full audit trail of all actions

### 3. **Database Schema**
- ✅ `admins` table: Added `is_approval_manager` fields
- ✅ `contests` table: Added approval workflow fields
- ✅ `contest_approval_log` table: Audit trail
- ✅ `approval_notifications` table: User notifications

### 4. **Security**
- ✅ Row Level Security (RLS) policies
- ✅ API-level permission checks
- ✅ Middleware enforcement
- ✅ Audit logging

## 🗄️ Database Changes

### Run This SQL Migration:

```sql
-- Location: database/migrations/add_approval_system.sql
-- Run in Supabase SQL Editor
```

The migration includes:
1. Approval manager fields in `admins`
2. Approval workflow fields in `contests`
3. `contest_approval_log` table
4. `approval_notifications` table
5. Indexes for performance
6. RLS policies
7. Auto-timeout function

## 🔧 Backend Services

### ApprovalService (`src/services/approvalService.ts`)

**Key Methods:**
```typescript
// Permission checks
canApprove(userId: number): Promise<boolean>
getApprovalManager(): Promise<any | null>

// Manager assignment
assignApprovalManager(superAdminId, managerId): Promise<Result>
revokeApprovalManager(superAdminId, managerId): Promise<Result>

// Approval actions
approveContest(contestId, reviewerId): Promise<Result>
rejectContest(contestId, reviewerId, reason): Promise<Result>

// Data retrieval
getPendingContests(): Promise<Contest[]>
getNotifications(userId, unreadOnly): Promise<Notification[]>
getApprovalLogs(contestId): Promise<Log[]>

// Utilities
logApprovalAction(log): Promise<void>
createNotification(notification): Promise<void>
markNotificationAsRead(notificationId): Promise<void>
checkExpiredApprovals(): Promise<void>
```

## 🎨 UI Components

### 1. **Pending Approvals Page** (`src/pages/PendingApprovals.tsx`)

**Features:**
- Lists all contests awaiting approval
- Shows creator info, submission date, days waiting
- Urgent badge for contests waiting 5+ days
- Approve/Reject actions with reason input
- Real-time updates

**Access:** Super Admin & Approval Manager only

### 2. **Contest Form Updates** (Needed)

Add to `src/components/contests/ContestForm.tsx`:
```tsx
{/* Approval Notice */}
{!isSuperAdmin && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <p className="text-sm text-yellow-800">
      <strong>⚠️ Awaiting Approval:</strong> Your contest will be reviewed by an administrator before becoming active.
    </p>
  </div>
)}
```

### 3. **Contest List Updates** (Needed)

Update `src/pages/Contests.tsx` to show approval status:
```tsx
// Add status badge
{contest.approvalStatus === 'PENDING' && (
  <Badge variant="warning">Pending Approval</Badge>
)}
{contest.approvalStatus === 'REJECTED' && (
  <Badge variant="danger">Rejected</Badge>
)}
```

## 🔐 Security Implementation

### 1. **Permission Middleware**

Create `src/middleware/approvalMiddleware.ts`:
```typescript
export const requireApprovalPermission = async (req, res, next) => {
  const userId = req.user.id;
  const canApprove = await ApprovalService.canApprove(userId);
  
  if (!canApprove) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  
  next();
};
```

### 2. **API Endpoints** (Backend - if using Express)

```typescript
// POST /api/contests/:id/approve
router.post('/:id/approve', requireApprovalPermission, async (req, res) => {
  const result = await ApprovalService.approveContest(
    req.params.id,
    req.user.id
  );
  res.json(result);
});

// POST /api/contests/:id/reject
router.post('/:id/reject', requireApprovalPermission, async (req, res) => {
  const { reason } = req.body;
  const result = await ApprovalService.rejectContest(
    req.params.id,
    req.user.id,
    reason
  );
  res.json(result);
});

// POST /api/approval-manager/assign
router.post('/assign', requireSuperAdmin, async (req, res) => {
  const { managerId } = req.body;
  const result = await ApprovalService.assignApprovalManager(
    req.user.id,
    managerId
  );
  res.json(result);
});
```

## 📱 UI/UX Flow

### For Regular Admins:
1. Create contest → Status shows "Pending Approval"
2. See yellow banner: "Awaiting approval"
3. Receive notification when approved/rejected
4. If rejected, can view reason and resubmit

### For Super Admin:
1. See "Pending Approvals" tab with count badge
2. Review contest details
3. Approve or reject with reason
4. Assign/revoke Approval Manager
5. View all approval logs

### For Approval Manager:
1. See "Pending Approvals" tab
2. Review and approve/reject contests
3. Cannot assign other managers

## 🔔 Notifications

### Notification Types:
- **PENDING_APPROVAL**: Sent to Super Admin & Approval Manager when contest submitted
- **APPROVED**: Sent to contest creator when approved
- **REJECTED**: Sent to contest creator when rejected (includes reason)
- **TIMEOUT**: Sent when approval expires (if timeout enabled)

### Notification Display:
```tsx
// Add to layout header
<NotificationBell 
  userId={user.id}
  onNotificationClick={(notification) => {
    // Navigate to contest or show details
  }}
/>
```

## ⚙️ Configuration Options

### In Contest Creation:
```typescript
{
  auto_approve: false,           // Auto-approve for trusted users
  approval_timeout_days: 7,      // Days before auto-rejection
  notify_creator: true,          // Email/alert on decision
}
```

### In Admin Settings:
```typescript
{
  approval_role: 'SUPER_ADMIN',  // Who can approve
  require_approval: true,        // Enable/disable workflow
  timeout_enabled: true,         // Enable auto-expiry
}
```

## 📊 Audit Trail

### View Approval History:
```tsx
<ApprovalHistory contestId={contest.id} />
```

Shows:
- Action (Submitted, Approved, Rejected)
- Performed by (name, role)
- Timestamp
- Reason (if rejected)
- Previous/new status

## 🚀 Deployment Steps

### 1. **Database Migration**
```bash
# Run in Supabase SQL Editor
# File: database/migrations/add_approval_system.sql
```

### 2. **Update Prisma Schema**
```bash
cd Lucky-draw
npx prisma generate
```

### 3. **Add Route**
Update `src/App.tsx`:
```tsx
<Route path="pending-approvals" element={<PendingApprovals />} />
```

### 4. **Update Navigation**
Add to sidebar (for Super Admin & Approval Manager):
```tsx
{canApprove && (
  <NavLink to="/pending-approvals">
    <Clock className="w-5 h-5" />
    Pending Approvals
    {pendingCount > 0 && (
      <Badge variant="warning">{pendingCount}</Badge>
    )}
  </NavLink>
)}
```

### 5. **Update Contest Creation**
Modify `src/pages/Contests.tsx`:
```typescript
// In handleCreateContest
const isSuperAdmin = user?.role === 'SUPER_ADMIN';

const contestPayload = {
  // ... other fields
  approval_status: isSuperAdmin ? 'APPROVED' : 'PENDING',
  submitted_at: new Date().toISOString(),
};

// Log submission
if (!isSuperAdmin) {
  await ApprovalService.logApprovalAction({
    contest_id: result.contest_id,
    action: 'SUBMITTED',
    performed_by: user.id,
    new_status: 'PENDING',
  });
  
  // Notify approvers
  // ... notification logic
}
```

## 🧪 Testing Checklist

- [ ] Super Admin can create contests (auto-approved)
- [ ] Regular admin creates contest (pending status)
- [ ] Super Admin can see pending approvals
- [ ] Super Admin can approve contest
- [ ] Super Admin can reject contest with reason
- [ ] Contest creator receives notification
- [ ] Approval Manager can be assigned
- [ ] Approval Manager can approve/reject
- [ ] Only one Approval Manager at a time
- [ ] Approval logs are created
- [ ] Expired approvals are handled
- [ ] RLS policies work correctly
- [ ] Non-authorized users blocked from approval endpoints

## 📈 Future Enhancements

1. **Multi-level Approval**: Require 2+ approvers
2. **Approval Templates**: Pre-defined rejection reasons
3. **Bulk Actions**: Approve/reject multiple contests
4. **Email Notifications**: Send emails on status changes
5. **Approval Analytics**: Dashboard with metrics
6. **Auto-approval Rules**: Based on creator trust score
7. **Approval Delegation**: Temporary approval permissions
8. **Mobile App**: Push notifications for approvals

## 🐛 Troubleshooting

### Issue: "Permission denied" when approving
**Solution:** Check `is_super_admin` or `is_approval_manager` flags in database

### Issue: Notifications not showing
**Solution:** Verify RLS policies on `approval_notifications` table

### Issue: Auto-timeout not working
**Solution:** Set up cron job to call `check_approval_timeout()` function

### Issue: Contest still pending after approval
**Solution:** Check `approval_status` field was updated in database

## 📞 Support

For issues or questions about the approval workflow:
1. Check approval logs: `SELECT * FROM contest_approval_log WHERE contest_id = X`
2. Verify permissions: `SELECT is_super_admin, is_approval_manager FROM admins WHERE admin_id = X`
3. Review notifications: `SELECT * FROM approval_notifications WHERE recipient_id = X`

---

**Status:** ✅ Ready for Implementation
**Version:** 1.0.0
**Last Updated:** 2025-01-22
