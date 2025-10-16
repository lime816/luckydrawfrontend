-- ============================================
-- Contest Approval System - Using Existing Table
-- ============================================
-- Modify contests table to support approval workflow
-- Non-superadmin users create contests with PENDING status
-- Only superadmin can approve/reject

-- Create enum for approval status (if not exists)
DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add approval_status column if not exists
DO $$ BEGIN
    ALTER TABLE contests ADD COLUMN approval_status approval_status DEFAULT 'APPROVED';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add reviewed_by column if not exists
DO $$ BEGIN
    ALTER TABLE contests ADD COLUMN reviewed_by INT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add reviewed_at column if not exists
DO $$ BEGIN
    ALTER TABLE contests ADD COLUMN reviewed_at TIMESTAMP(6);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add rejection_reason column if not exists
DO $$ BEGIN
    ALTER TABLE contests ADD COLUMN rejection_reason TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add foreign key for reviewer (if not exists)
DO $$ BEGIN
    ALTER TABLE contests
    ADD CONSTRAINT fk_contests_reviewed_by 
    FOREIGN KEY (reviewed_by) REFERENCES admins(admin_id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better query performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_contests_approval_status ON contests(approval_status);
CREATE INDEX IF NOT EXISTS idx_contests_reviewed_by ON contests(reviewed_by);

-- Add comments
COMMENT ON COLUMN contests.approval_status IS 'Approval status: PENDING (awaiting approval), APPROVED (approved by superadmin), REJECTED (rejected by superadmin)';
COMMENT ON COLUMN contests.reviewed_by IS 'Admin who approved or rejected the contest';
COMMENT ON COLUMN contests.reviewed_at IS 'Timestamp when contest was reviewed';
COMMENT ON COLUMN contests.rejection_reason IS 'Reason for rejection if status is REJECTED';

-- Update existing contests to APPROVED status
UPDATE contests SET approval_status = 'APPROVED' WHERE approval_status IS NULL;
