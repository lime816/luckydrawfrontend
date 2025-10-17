# Run Flow Builder Migration Manually

Since automated migration requires special database permissions, please run the migration manually in Supabase SQL Editor.

## Steps:

### 1. Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: **rnihpvwaugrekmkbvhlk**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### 2. Copy the Migration SQL

Open the file: `database-migrations/add-flow-integration.sql`

Or copy this SQL:

```sql
-- ============================================
-- Flow Builder Integration Migration
-- ============================================

-- Add flow_id to forms table
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS flow_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS contest_id INT REFERENCES contests(contest_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_forms_flow_id ON forms(flow_id);
CREATE INDEX IF NOT EXISTS idx_forms_contest_id ON forms(contest_id);

-- Add flow_response_id to form_responses table
ALTER TABLE form_responses
ADD COLUMN IF NOT EXISTS flow_response_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS participant_id INT REFERENCES participants(participant_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_form_responses_flow_response_id ON form_responses(flow_response_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_participant_id ON form_responses(participant_id);

-- Add message_library_id to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS message_library_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS flow_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_messages_message_library_id ON messages(message_library_id);
CREATE INDEX IF NOT EXISTS idx_messages_flow_id ON messages(flow_id);

-- Create analytics view
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
```

### 3. Run the Migration

1. Paste the SQL into the SQL Editor
2. Click **Run** (or press Ctrl+Enter)
3. Wait for completion

### 4. Verify Migration

Run this verification query:

```sql
-- Check forms table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forms' 
AND column_name IN ('flow_id', 'contest_id');

-- Check form_responses table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'form_responses' 
AND column_name IN ('flow_response_id', 'participant_id');

-- Check messages table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('message_library_id', 'flow_id');

-- Check view
SELECT * FROM flow_analytics LIMIT 1;
```

### Expected Results:

You should see:
- ✅ `forms.flow_id` (varchar)
- ✅ `forms.contest_id` (integer)
- ✅ `form_responses.flow_response_id` (varchar)
- ✅ `form_responses.participant_id` (integer)
- ✅ `messages.message_library_id` (varchar)
- ✅ `messages.flow_id` (varchar)
- ✅ `flow_analytics` view exists

### 5. After Migration

Once the migration is complete:

1. ✅ Restart your dev server (if running)
2. ✅ The Flow Builder will now be connected to the database
3. ✅ You can create flows and link them to contests
4. ✅ Flow responses will be saved to the database

## Troubleshooting

### "Column already exists" error
This is fine - it means the column was already added. Continue with the rest of the migration.

### "Permission denied" error
Make sure you're using the Supabase SQL Editor with your project's admin credentials.

### "Relation does not exist" error
Check that the table names are correct and that you're connected to the right database.

## Next Steps

After successful migration:

1. Read: `FLOW_INTEGRATION_SUMMARY.md`
2. Test Flow Builder database integration
3. Create a test flow and link it to a contest
4. Verify data is saved in the database

---

**Need Help?**
- Check `FLOW_BUILDER_DATABASE_INTEGRATION.md` for full documentation
- Verify your Supabase connection in the dashboard
