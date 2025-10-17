-- ============================================
-- Flow Builder Integration Migration
-- ============================================
-- Adds fields to connect WhatsApp Flow Builder with database tables
-- Links flow_id, contest_id, and response_id

-- Add flow_id to forms table (stores WhatsApp Flow ID)
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS flow_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS contest_id INT REFERENCES contests(contest_id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_forms_flow_id ON forms(flow_id);
CREATE INDEX IF NOT EXISTS idx_forms_contest_id ON forms(contest_id);

-- Add flow_response_id to form_responses table (stores WhatsApp Flow Response ID)
ALTER TABLE form_responses
ADD COLUMN IF NOT EXISTS flow_response_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS participant_id INT REFERENCES participants(participant_id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_responses_flow_response_id ON form_responses(flow_response_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_participant_id ON form_responses(participant_id);

-- Add message_library_id to messages table (links to Flow Builder Message Library)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS message_library_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS flow_id VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_messages_message_library_id ON messages(message_library_id);
CREATE INDEX IF NOT EXISTS idx_messages_flow_id ON messages(flow_id);

-- Create view for flow analytics
CREATE OR REPLACE VIEW flow_analytics AS
SELECT 
    f.form_id,
    f.form_name,
    f.flow_id,
    f.contest_id,
    c.name as contest_name,
    COUNT(DISTINCT fr.response_id) as total_responses,
    COUNT(DISTINCT p.participant_id) as total_participants,
    f.created_at as flow_created_at,
    MAX(fr.submitted_at) as last_response_at
FROM forms f
LEFT JOIN contests c ON f.contest_id = c.contest_id
LEFT JOIN form_responses fr ON f.form_id = fr.form_id
LEFT JOIN participants p ON fr.participant_id = p.participant_id
WHERE f.flow_id IS NOT NULL
GROUP BY f.form_id, f.form_name, f.flow_id, f.contest_id, c.name, f.created_at;

-- Grant permissions
GRANT SELECT ON flow_analytics TO authenticated;

COMMENT ON COLUMN forms.flow_id IS 'WhatsApp Flow ID from Flow Builder';
COMMENT ON COLUMN forms.contest_id IS 'Associated contest for this flow';
COMMENT ON COLUMN form_responses.flow_response_id IS 'WhatsApp Flow Response ID';
COMMENT ON COLUMN form_responses.participant_id IS 'Participant who submitted this response';
COMMENT ON COLUMN messages.message_library_id IS 'Message Library entry ID from Flow Builder';
COMMENT ON COLUMN messages.flow_id IS 'Associated WhatsApp Flow ID';
