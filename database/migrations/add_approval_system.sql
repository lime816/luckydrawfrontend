-- Contest Approval System Migration
-- Run this in your Supabase SQL Editor

-- 1. Add approval manager to admins table
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS is_approval_manager BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approval_manager_assigned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS approval_manager_assigned_by INTEGER REFERENCES admins(admin_id);

-- 2. Ensure contests table has all approval fields
ALTER TABLE contests
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES admins(admin_id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS auto_approve BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approval_timeout_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP DEFAULT NOW();

-- 3. Create approval audit log table
CREATE TABLE IF NOT EXISTS contest_approval_log (
  log_id SERIAL PRIMARY KEY,
  contest_id INTEGER NOT NULL REFERENCES contests(contest_id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('SUBMITTED', 'APPROVED', 'REJECTED', 'RESUBMITTED')),
  performed_by INTEGER NOT NULL REFERENCES admins(admin_id),
  performed_at TIMESTAMP DEFAULT NOW(),
  previous_status TEXT,
  new_status TEXT,
  reason TEXT,
  metadata JSONB
);

-- 4. Create approval notifications table
CREATE TABLE IF NOT EXISTS approval_notifications (
  notification_id SERIAL PRIMARY KEY,
  contest_id INTEGER NOT NULL REFERENCES contests(contest_id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES admins(admin_id),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'TIMEOUT')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

-- 5. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_contests_approval_status ON contests(approval_status);
CREATE INDEX IF NOT EXISTS idx_contests_created_by ON contests(created_by);
CREATE INDEX IF NOT EXISTS idx_approval_log_contest ON contest_approval_log(contest_id);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_recipient ON approval_notifications(recipient_id, is_read);

-- 6. Create function to auto-expire pending contests
CREATE OR REPLACE FUNCTION check_approval_timeout()
RETURNS void AS $$
BEGIN
  UPDATE contests
  SET 
    approval_status = 'REJECTED',
    rejection_reason = 'Approval timeout - not reviewed within ' || approval_timeout_days || ' days',
    reviewed_at = NOW()
  WHERE 
    approval_status = 'PENDING'
    AND approval_timeout_days IS NOT NULL
    AND submitted_at < NOW() - (approval_timeout_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- 7. Add comments for documentation
COMMENT ON COLUMN admins.is_approval_manager IS 'Whether this admin can approve contests (assigned by Super Admin)';
COMMENT ON COLUMN contests.approval_status IS 'Contest approval status: PENDING, APPROVED, or REJECTED';
COMMENT ON COLUMN contests.auto_approve IS 'If true, contests from this creator are auto-approved';
COMMENT ON COLUMN contests.approval_timeout_days IS 'Days before pending approval expires (default 7)';
COMMENT ON TABLE contest_approval_log IS 'Audit log for all contest approval actions';
COMMENT ON TABLE approval_notifications IS 'Notifications for contest approval workflow';

-- 8. Set default approval status for existing contests
UPDATE contests 
SET approval_status = 'APPROVED' 
WHERE approval_status IS NULL;

-- 9. Grant necessary permissions (adjust based on your RLS policies)
-- These are examples - modify based on your security requirements
ALTER TABLE contest_approval_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_notifications ENABLE ROW LEVEL SECURITY;

-- Allow admins to view approval logs
CREATE POLICY IF NOT EXISTS "Admins can view approval logs"
ON contest_approval_log FOR SELECT
TO authenticated
USING (true);

-- Allow users to view their own notifications
CREATE POLICY IF NOT EXISTS "Users can view own notifications"
ON approval_notifications FOR SELECT
TO authenticated
USING (recipient_id = (SELECT admin_id FROM admins WHERE supabase_user_id = auth.uid()));

-- Allow users to update their own notifications
CREATE POLICY IF NOT EXISTS "Users can update own notifications"
ON approval_notifications FOR UPDATE
TO authenticated
USING (recipient_id = (SELECT admin_id FROM admins WHERE supabase_user_id = auth.uid()));
