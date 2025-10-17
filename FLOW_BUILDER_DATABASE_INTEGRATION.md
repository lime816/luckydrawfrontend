# WhatsApp Flow Builder - Database Integration

## Overview

This document describes the complete integration between the WhatsApp Flow Builder and the Lucky Draw database. The integration connects:

1. **Message Library** → `messages` table
2. **Create Flow** → `forms` table  
3. **Flow Responses** → `form_responses` table
4. **Flow ID, Contest ID, and Response ID** matching

---

## Database Schema Changes

### 1. Forms Table
```sql
ALTER TABLE forms 
ADD COLUMN flow_id VARCHAR(255),           -- WhatsApp Flow ID
ADD COLUMN contest_id INT REFERENCES contests(contest_id);
```

**Purpose**: Links WhatsApp flows to database forms and optionally to contests.

### 2. Form Responses Table
```sql
ALTER TABLE form_responses
ADD COLUMN flow_response_id VARCHAR(255),  -- WhatsApp Flow Response ID
ADD COLUMN participant_id INT REFERENCES participants(participant_id);
```

**Purpose**: Stores unique flow response IDs and links responses to participants.

### 3. Messages Table
```sql
ALTER TABLE messages
ADD COLUMN message_library_id VARCHAR(255), -- Message Library entry ID
ADD COLUMN flow_id VARCHAR(255);            -- Associated Flow ID
```

**Purpose**: Links messages from Message Library to database and associates with flows.

---

## Architecture

### Service Layer

#### `flowBuilderDatabaseService.ts`

**Location**: `src/services/flowBuilderDatabaseService.ts`

**Services**:

1. **MessageLibraryService**
   - `saveMessage()` - Save message to database
   - `getMessagesByContest()` - Get all messages for a contest
   - `sendAndLogMessage()` - Send WhatsApp message and log to database

2. **FlowFormService**
   - `createFlowForm()` - Create form from WhatsApp flow
   - `getFormByFlowId()` - Get form by WhatsApp flow ID
   - `getFormsByContest()` - Get all forms for a contest
   - `linkFormToContest()` - Link form to contest

3. **FlowResponseService**
   - `saveFlowResponse()` - Save flow response with unique ID
   - `getResponseByFlowResponseId()` - Get response by flow response ID
   - `getResponsesByForm()` - Get all responses for a form
   - `linkResponseToParticipant()` - Link response to participant
   - `createParticipantFromResponse()` - Auto-create participant from response

4. **FlowBuilderDatabaseService** (Orchestrator)
   - `createCompleteFlow()` - Complete flow creation workflow
   - `processFlowResponse()` - Complete response processing workflow
   - `getCompleteFlowData()` - Get all data for a flow

---

## React Integration

### Custom Hook: `useFlowBuilderDatabase`

**Location**: `src/hooks/useFlowBuilderDatabase.ts`

**Usage**:

```typescript
import { useFlowBuilderDatabase } from '../hooks/useFlowBuilderDatabase';

function MyComponent() {
  const {
    createFlow,
    processFlowResponse,
    sendMessage,
    getFormByFlowId,
    isLoading,
    error
  } = useFlowBuilderDatabase();

  // Create flow
  const handleCreateFlow = async () => {
    const result = await createFlow(
      'Registration Form',
      flowSchema,
      'flow_123',
      contestId // optional
    );
    console.log('Form ID:', result.formId);
  };

  // Process response
  const handleResponse = async () => {
    const result = await processFlowResponse(
      'flow_123',
      'response_456',
      responseData
    );
    console.log('Response ID:', result.responseId);
    console.log('Participant ID:', result.participantId);
  };
}
```

### UI Component: `FlowDatabaseIntegration`

**Location**: `src/components/flowbuilder/components/FlowDatabaseIntegration.tsx`

**Features**:
- Visual database connection status
- Contest selection and linking
- Automatic form creation
- Real-time integration feedback

**Usage**:

```typescript
<FlowDatabaseIntegration
  flowId="flow_123"
  flowName="Registration Form"
  flowSchema={flowSchema}
  onIntegrationComplete={(formId, contestId) => {
    console.log('Integration complete!', formId, contestId);
  }}
/>
```

---

## Data Flow

### 1. Flow Creation Workflow

```
User Creates Flow in Flow Builder
         ↓
FlowBuilderApp calls createFlow()
         ↓
FlowFormService.createFlowForm()
  - Creates entry in forms table
  - Stores flow_id and contest_id in form_schema
         ↓
If contest_id provided:
  FlowFormService.linkFormToContest()
  - Updates contest.entry_form_id
         ↓
Returns: { formId, flowId, contestId }
```

### 2. Flow Response Workflow

```
User Submits WhatsApp Flow
         ↓
Webhook receives flow response
         ↓
processFlowResponse(flowId, flowResponseId, responseData)
         ↓
FlowFormService.getFormByFlowId()
  - Retrieves form_id and contest_id
         ↓
FlowResponseService.saveFlowResponse()
  - Saves to form_responses table
  - Stores flow_response_id in response_data
         ↓
If contest_id exists:
  FlowResponseService.createParticipantFromResponse()
  - Creates participant entry
  - Links form_response_id
         ↓
Returns: { responseId, participantId, formId }
```

### 3. Message Library Workflow

```
User Creates Message in Message Library
         ↓
MessageLibraryService.saveMessage()
  - Saves to messages table
  - Links to contest_id
  - Stores message_library_id
         ↓
When sending:
  MessageLibraryService.sendAndLogMessage()
  - Sends via WhatsApp API
  - Logs to database
         ↓
Returns: { messageId, sent: true }
```

---

## ID Matching System

### Flow ID Matching

**Purpose**: Link WhatsApp flows to database forms

```typescript
// When creating flow
const formId = await createFlowForm(
  flowName,
  flowSchema,
  flowId,      // WhatsApp Flow ID
  contestId
);

// When retrieving
const form = await getFormByFlowId(flowId);
// Returns form with form_id, flow_id, contest_id
```

### Contest ID Matching

**Purpose**: Associate flows with contests

```typescript
// Link form to contest
await linkFormToContest(formId, contestId);

// Contest now has entry_form_id
// Form has contest_id in form_schema
```

### Response ID Matching

**Purpose**: Track individual flow submissions

```typescript
// Save response with unique ID
const responseId = await saveFlowResponse(
  formId,
  responseData,
  flowResponseId,  // WhatsApp Flow Response ID
  participantId
);

// Retrieve by flow response ID
const response = await getResponseByFlowResponseId(flowResponseId);
```

---

## Database Migration

### Run Migration

```bash
# Connect to your Supabase database
psql -h your-supabase-host -U postgres -d postgres

# Run migration
\i database-migrations/add-flow-integration.sql
```

### Verify Migration

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

-- View flow analytics
SELECT * FROM flow_analytics;
```

---

## API Examples

### Create Flow with Contest

```typescript
const { createFlow } = useFlowBuilderDatabase();

const result = await createFlow(
  'Lucky Draw Registration',
  {
    screens: [...],
    version: '3.0'
  },
  'flow_abc123',
  42  // contest_id
);

console.log(result);
// {
//   formId: 15,
//   flowId: 'flow_abc123',
//   contestId: 42
// }
```

### Process Flow Response

```typescript
const { processFlowResponse } = useFlowBuilderDatabase();

const result = await processFlowResponse(
  'flow_abc123',
  'response_xyz789',
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890'
  }
);

console.log(result);
// {
//   responseId: 101,
//   participantId: 55,
//   formId: 15
// }
```

### Send Message

```typescript
const { sendMessage } = useFlowBuilderDatabase();

const result = await sendMessage(
  42,  // contest_id
  '1234567890',  // recipient
  'Welcome to Lucky Draw!',
  1  // sent_by (admin_id)
);

console.log(result);
// {
//   messageId: 203,
//   sent: true
// }
```

### Get Complete Flow Data

```typescript
const { getCompleteFlowData } = useFlowBuilderDatabase();

const data = await getCompleteFlowData('flow_abc123');

console.log(data);
// {
//   form: { form_id: 15, form_name: '...', ... },
//   responses: [{ response_id: 101, ... }, ...],
//   participants: [{ participant_id: 55, ... }, ...]
// }
```

---

## Analytics View

The migration creates a `flow_analytics` view for easy reporting:

```sql
SELECT * FROM flow_analytics WHERE contest_id = 42;
```

**Returns**:
- `form_id` - Database form ID
- `form_name` - Form name
- `flow_id` - WhatsApp flow ID
- `contest_id` - Associated contest
- `contest_name` - Contest name
- `total_responses` - Number of responses
- `total_participants` - Number of participants
- `flow_created_at` - When flow was created
- `last_response_at` - Last response time

---

## Integration Checklist

- [ ] Run database migration (`add-flow-integration.sql`)
- [ ] Verify new columns exist in tables
- [ ] Import `flowBuilderDatabaseService.ts`
- [ ] Import `useFlowBuilderDatabase` hook
- [ ] Add `FlowDatabaseIntegration` component to Flow Builder UI
- [ ] Test flow creation with contest linking
- [ ] Test flow response processing
- [ ] Test message library integration
- [ ] Verify participant auto-creation
- [ ] Check flow analytics view

---

## Troubleshooting

### Issue: "Form not found for flow_id"

**Solution**: Ensure flow was created using `createFlow()` before processing responses.

### Issue: "Failed to link form to contest"

**Solution**: Verify contest_id exists and user has permissions.

### Issue: "Participant not created from response"

**Solution**: Check that contest_id is linked to form and response data contains name/contact fields.

### Issue: "Message not saved to database"

**Solution**: Verify contest_id exists and message type is valid ('WHATSAPP', 'EMAIL', 'SMS', 'PUSH').

---

## Next Steps

1. **Webhook Integration**: Set up webhook to receive flow responses
2. **Real-time Updates**: Add Supabase real-time subscriptions
3. **Advanced Analytics**: Build dashboards using flow_analytics view
4. **Automated Workflows**: Trigger actions based on flow responses
5. **Multi-language Support**: Add i18n for flow messages

---

## Support

For questions or issues:
1. Check this documentation
2. Review code comments in service files
3. Check database migration logs
4. Test with sample data first

---

**Last Updated**: 2025-10-17
**Version**: 1.0.0
