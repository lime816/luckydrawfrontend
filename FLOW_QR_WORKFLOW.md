# WhatsApp Flow QR Code Workflow

## 🎯 How It Works (Proper Implementation)

### **The Complete Flow:**

```
User Scans QR → WhatsApp Opens → User Sends Message → Backend Webhook → Flow Sent to User
```

---

## 📋 **Step-by-Step Process**

### **1. Create & Publish Flow**

When you click **"Create Flow"**:

1. ✅ Flow created in WhatsApp Business
2. ✅ Flow JSON uploaded (your screens/fields)
3. ✅ Flow published (made available)
4. ✅ **Webhook registered** with backend
5. ✅ Flow saved to database

### **2. Set Active Flow**

1. Click **"Manage Flows"**
2. Find your flow (e.g., "udith", "songsong")
3. Click **"Set Active"**
4. Flow is now selected for QR generation

### **3. Generate QR Code**

1. Click **"Flow QR"** button
2. QR code is generated with:
   - WhatsApp link to your business number
   - Pre-filled activation message
   - Flow ID embedded in backend

### **4. User Scans QR Code**

When a customer scans the QR:

```
📱 QR Code Scanned
    ↓
📲 WhatsApp Opens
    ↓
💬 Pre-filled Message: "Hi! I want to register for the lucky draw"
    ↓
👤 User Clicks Send
```

### **5. Backend Webhook Receives Message**

Your Railway backend at `https://whatsappbackend-production-8946.up.railway.app`:

```javascript
// Webhook receives message
POST /webhook
{
  "from": "918281348343",
  "message": "Hi! I want to register for the lucky draw"
}

// Backend checks triggers
- Matches activation message
- Finds associated flow ID
- Opens 24-hour messaging window
```

### **6. Backend Sends Flow**

```javascript
// Backend automatically sends flow
WhatsApp API Call:
POST /v22.0/{phone_number_id}/messages
{
  "messaging_product": "whatsapp",
  "to": "918281348343",
  "type": "interactive",
  "interactive": {
    "type": "flow",
    "action": {
      "flow_id": "1302627524691544",
      "flow_cta": "Complete Form"
    }
  }
}
```

### **7. User Receives Flow**

```
📨 User receives WhatsApp message
    ↓
🔘 "Complete Form" button appears
    ↓
👆 User clicks button
    ↓
📝 Your custom flow opens!
    ↓
✅ User fills out form
    ↓
💾 Response saved to database
```

---

## 🔧 **Backend Requirements**

Your Railway backend needs these endpoints:

### **1. Webhook Endpoint**
```
POST /webhook
```
- Receives incoming WhatsApp messages
- Verifies webhook signature
- Processes message triggers

### **2. Register Flow Endpoint**
```
POST /api/whatsapp/register-flow
Body: {
  "flowId": "1302627524691544",
  "flowName": "Lucky Draw Registration",
  "activationMessage": "Hi! I want to register",
  "autoCreateTrigger": true
}
```

### **3. Send Flow Endpoint**
```
POST /api/whatsapp/send-flow
Body: {
  "phoneNumber": "918281348343",
  "flowId": "1302627524691544",
  "message": "Please complete this form"
}
```

---

## 🎨 **Frontend Implementation**

### **QR Code Generation**
```typescript
// QRFlowInitiator.tsx
const generateWhatsAppUrl = () => {
  const cleanPhoneNumber = businessPhoneNumber.replace(/\D/g, '')
  const message = getFlowActivationMessage()
  const encodedMessage = encodeURIComponent(message)
  
  // WhatsApp deep link
  return `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`
}
```

### **Flow Registration**
```typescript
// FlowBuilderApp.tsx - After flow creation
await backendApiService.registerFlow(
  flowId,
  flowName,
  customMessage,
  true // Auto-create trigger
)
```

---

## 📊 **Database Schema**

### **Triggers Table** (Backend)
```sql
CREATE TABLE flow_triggers (
  id UUID PRIMARY KEY,
  keyword VARCHAR(255),
  flow_id VARCHAR(255),
  message TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### **Forms Table** (Supabase)
```sql
CREATE TABLE forms (
  form_id UUID PRIMARY KEY,
  flow_id VARCHAR(255),
  flow_name VARCHAR(255),
  flow_json JSONB,
  contest_id UUID,
  created_at TIMESTAMP
)
```

---

## 🔐 **WhatsApp Configuration**

### **Required in .env:**
```env
REACT_APP_WHATSAPP_ACCESS_TOKEN=EAFgCn2WnS8s...
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=158282837372377
REACT_APP_WHATSAPP_BUSINESS_ACCOUNT_ID=164297206767745
REACT_APP_BACKEND_URL=https://whatsappbackend-production-8946.up.railway.app
```

### **Meta Developer Console Setup:**

1. **Configure Webhook URL:**
   ```
   https://whatsappbackend-production-8946.up.railway.app/webhook
   ```

2. **Subscribe to Events:**
   - ✅ messages
   - ✅ message_status
   - ✅ message_reactions

3. **Verify Token:**
   - Set a verification token in your backend
   - Meta will send GET request to verify

---

## 🚀 **Testing the Complete Flow**

### **Test 1: Create Flow**
```bash
1. Design flow in Flow Builder
2. Click "Create Flow"
3. Check console for:
   - ✅ Flow created
   - ✅ JSON uploaded
   - ✅ Flow published
   - ✅ Webhook registered
   - ✅ Saved to database
```

### **Test 2: QR Code**
```bash
1. Click "Manage Flows" → "Set Active"
2. Click "Flow QR"
3. Scan QR code with phone
4. WhatsApp should open with pre-filled message
```

### **Test 3: End-to-End**
```bash
1. Scan QR code
2. Send the message
3. Backend webhook receives message
4. Backend sends flow to your number
5. Flow appears in WhatsApp
6. Fill out form
7. Check database for response
```

---

## 🐛 **Troubleshooting**

### **QR Code doesn't open WhatsApp**
- Check business phone number format (no + or spaces)
- Verify QR code URL is correct

### **Message sent but no flow received**
- Check backend webhook is running
- Verify webhook URL in Meta console
- Check backend logs for errors
- Ensure access token is valid

### **Flow appears but is empty**
- Flow JSON upload failed
- Check flow is published
- Verify flow ID is correct

### **Backend not responding**
- Check Railway deployment status
- Verify BACKEND_URL in .env
- Test health endpoint: `/health`

---

## 📱 **User Experience**

### **What the user sees:**

1. **Scans QR Code**
   - Camera opens
   - QR code recognized
   - WhatsApp opens automatically

2. **Sees Pre-filled Message**
   - "Hi! I want to register for the lucky draw"
   - Just needs to click Send

3. **Receives Flow**
   - WhatsApp message arrives
   - "Complete Form" button visible
   - Clicks button

4. **Fills Form**
   - Beautiful interactive form
   - All your custom fields
   - Submit button

5. **Confirmation**
   - "Thank you!" message
   - Form submitted successfully

---

## ✅ **Success Criteria**

Your flow is working correctly when:

- ✅ QR code opens WhatsApp
- ✅ Message is pre-filled
- ✅ User sends message
- ✅ Flow arrives within 5 seconds
- ✅ Form displays correctly
- ✅ User can fill and submit
- ✅ Response saved to database

---

## 🎯 **Next Steps**

1. **Test the complete flow** with your phone
2. **Verify backend webhook** is receiving messages
3. **Check database** for form responses
4. **Deploy to production** when ready
5. **Share QR codes** with customers!

---

## 📞 **Support**

If you encounter issues:

1. Check browser console for errors
2. Check backend logs in Railway
3. Verify WhatsApp API permissions
4. Test with Meta's API Explorer
5. Check webhook verification status

---

**Your flow is now ready to use! 🎉**
