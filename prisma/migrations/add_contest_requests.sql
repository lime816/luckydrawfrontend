-- ============================================
-- Contest Approval System Migration
-- ============================================
-- This migration adds support for contest approval workflow
-- Non-superadmin users create requests that need approval

-- Create enum for request status
CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Create contest_requests table
CREATE TABLE contest_requests (
  request_id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  theme VARCHAR(150),
  description TEXT,
  entry_form_id INT,
  start_date TIMESTAMP(6) NOT NULL,
  end_date TIMESTAMP(6) NOT NULL,
  entry_rules JSONB,
  requested_by INT NOT NULL,
  requested_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  status request_status DEFAULT 'PENDING',
  reviewed_by INT,
  reviewed_at TIMESTAMP(6),
  rejection_reason TEXT,
  approved_contest_id INT,
  
  -- Foreign keys
  CONSTRAINT fk_requested_by FOREIGN KEY (requested_by) 
    REFERENCES admins(admin_id) ON DELETE CASCADE,
  CONSTRAINT fk_reviewed_by FOREIGN KEY (reviewed_by) 
    REFERENCES admins(admin_id) ON DELETE SET NULL,
  CONSTRAINT fk_approved_contest FOREIGN KEY (approved_contest_id) 
    REFERENCES contests(contest_id) ON DELETE SET NULL,
  CONSTRAINT fk_entry_form FOREIGN KEY (entry_form_id) 
    REFERENCES forms(form_id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_contest_requests_status ON contest_requests(status);
CREATE INDEX idx_contest_requests_requested_by ON contest_requests(requested_by);
CREATE INDEX idx_contest_requests_reviewed_by ON contest_requests(reviewed_by);
CREATE INDEX idx_contest_requests_requested_at ON contest_requests(requested_at DESC);

-- Add comment to table
COMMENT ON TABLE contest_requests IS 'Stores contest creation requests from non-superadmin users that require approval';
COMMENT ON COLUMN contest_requests.status IS 'Request status: PENDING, APPROVED, or REJECTED';
COMMENT ON COLUMN contest_requests.approved_contest_id IS 'Links to the created contest if approved';
